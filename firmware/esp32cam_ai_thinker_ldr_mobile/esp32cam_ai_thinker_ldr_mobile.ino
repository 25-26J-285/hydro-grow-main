#include <esp_camera.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <ESPmDNS.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>

using namespace websockets;

// ==========================================
// USER CONFIGURATION
// ==========================================
const char* ssid = "CONDOo";
const char* password = "1234512345";

const uint16_t server_port = 8000;
const char* ws_path = "/ws/camera";
const uint16_t udp_discovery_port = 12345;

// ==========================================
// AI THINKER ESP32-CAM PIN MAP
// ==========================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22
#define FLASH_LED_PIN      4

// ==========================================
// RUNTIME STATE
// ==========================================
WebsocketsClient client;
WiFiUDP udp;

String serverIp = "";
unsigned long lastWsRetry = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastFrameTime = 0;
unsigned long lastStatusPrint = 0;

const unsigned long WS_RETRY_INTERVAL_MS = 5000;
const unsigned long HEARTBEAT_INTERVAL_MS = 5000;
const unsigned long FRAME_INTERVAL_MS = 200;
const unsigned long STATUS_INTERVAL_MS = 3000;

// ==========================================
// CAMERA
// ==========================================
bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_RGB565;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  config.grab_mode = CAMERA_GRAB_LATEST;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[Camera] Init failed: 0x%x\n", err);
    return false;
  }

  Serial.println("[Camera] Init OK - QVGA RGB565 320x240");
  return true;
}

// ==========================================
// NETWORK HELPERS
// ==========================================
void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("[WiFi] Connecting to ");
  Serial.println(ssid);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("[WiFi] Connected. IP: ");
    Serial.println(WiFi.localIP());
    WiFi.setSleep(false);
  } else {
    Serial.println();
    Serial.println("[WiFi] Connection failed");
  }
}

bool startMdnsResponder() {
  if (!MDNS.begin("hydrogrow-camera")) {
    Serial.println("[mDNS] Responder start failed");
    return false;
  }

  Serial.println("[mDNS] Responder started as hydrogrow-camera.local");
  return true;
}

bool discoverServerMdns() {
  Serial.println("[mDNS] Looking up _hydrogrow._tcp.local");

  int serviceCount = MDNS.queryService("hydrogrow", "tcp");
  if (serviceCount <= 0) {
    Serial.println("[mDNS] No Hydro Grow service found");
    return false;
  }

  String hostName = MDNS.hostname(0);
  IPAddress resolvedIp;

  if (hostName.length() == 0) {
    Serial.println("[mDNS] Service found, but hostname was empty");
    return false;
  }

  if (!MDNS.queryHost(hostName.c_str(), resolvedIp)) {
    Serial.print("[mDNS] Failed to resolve host ");
    Serial.println(hostName);
    return false;
  }

  serverIp = resolvedIp.toString();
  Serial.print("[mDNS] Found server at ");
  Serial.print(serverIp);
  Serial.print(":");
  Serial.println(MDNS.port(0));
  return true;
}

bool discoverServerUdp() {
  Serial.println("[UDP] Falling back to UDP discovery");

  udp.stop();
  if (!udp.begin(udp_discovery_port)) {
    Serial.println("[UDP] Failed to open local UDP socket");
    return false;
  }

  udp.beginPacket("255.255.255.255", udp_discovery_port);
  udp.print("HYDRO_DISCOVER");
  if (!udp.endPacket()) {
    Serial.println("[UDP] Failed to send discovery packet");
    udp.stop();
    return false;
  }

  unsigned long start = millis();
  while (millis() - start < 3000) {
    int packetSize = udp.parsePacket();
    if (packetSize > 0) {
      char buffer[64] = {0};
      int len = udp.read(buffer, sizeof(buffer) - 1);
      if (len > 0) {
        buffer[len] = '\0';
      }

      String response = String(buffer);
      if (response.startsWith("HYDRO_SERVER_HERE:")) {
        serverIp = udp.remoteIP().toString();
        Serial.print("[UDP] Found server at ");
        Serial.print(serverIp);
        Serial.print(":");
        Serial.println(server_port);
        udp.stop();
        return true;
      }
    }

    delay(50);
  }

  Serial.println("[UDP] No discovery response received");
  udp.stop();
  return false;
}

// ==========================================
// WEBSOCKET
// ==========================================
void onEventsCallback(WebsocketsEvent event, String data) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("[WS] Connected to server");
    digitalWrite(FLASH_LED_PIN, LOW);
  } else if (event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("[WS] Disconnected from server");
    digitalWrite(FLASH_LED_PIN, LOW);
  } else if (event == WebsocketsEvent::GotPing) {
    client.pong();
  }
}

void onMessageCallback(WebsocketsMessage message) {
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, message.data());
  if (err) {
    Serial.println("[WS] Ignoring non-JSON message");
    return;
  }

  const char* type = doc["type"];
  if (type && strcmp(type, "state_sync") == 0) {
    JsonObject actuators = doc["actuators"];
    if (!actuators.isNull()) {
      const char* flash = actuators["flash"];
      int flashBrightness = actuators["flash_brightness"] | 0;

      if (flash && strcmp(flash, "ON") == 0) {
        digitalWrite(FLASH_LED_PIN, HIGH);
      } else if (flash && strcmp(flash, "OFF") == 0) {
        digitalWrite(FLASH_LED_PIN, LOW);
      }

      if (flashBrightness > 0) {
        analogWrite(FLASH_LED_PIN, flashBrightness);
      }
    }
    Serial.println("[WS] State sync received");
    return;
  }

  const char* component = doc["component"];
  const char* action = doc["action"];
  if (!component || !action) {
    return;
  }

  if (strcmp(component, "flash") == 0) {
    if (strcmp(action, "ON") == 0) {
      digitalWrite(FLASH_LED_PIN, HIGH);
      Serial.println("[Flash] ON");
    } else if (strcmp(action, "OFF") == 0) {
      digitalWrite(FLASH_LED_PIN, LOW);
      Serial.println("[Flash] OFF");
    } else if (strcmp(action, "SET_BRIGHTNESS") == 0) {
      int brightness = doc["value"] | 0;
      analogWrite(FLASH_LED_PIN, brightness);
      Serial.printf("[Flash] Brightness: %d\n", brightness);
    }
  }
}

bool connectWebSocket() {
  if (serverIp.length() == 0) {
    if (!discoverServerMdns() && !discoverServerUdp()) {
      return false;
    }
  }

  String wsUrl = "ws://" + serverIp + ":" + String(server_port) + ws_path;
  Serial.print("[WS] Connecting to ");
  Serial.println(wsUrl);

  if (client.connect(wsUrl.c_str())) {
    Serial.println("[WS] Connection successful");
    return true;
  }

  Serial.println("[WS] Connection failed");
  serverIp = "";
  return false;
}

void sendHeartbeat() {
  StaticJsonDocument<128> doc;
  doc["status"] = "OK";
  doc["heap"] = ESP.getFreeHeap();

  String payload;
  serializeJson(doc, payload);
  client.send(payload);

  Serial.print("[Heartbeat] heap:");
  Serial.println(ESP.getFreeHeap());
}

void sendFrame() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("[Camera] Capture failed");
    return;
  }

  client.sendBinary((const char*)fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

// ==========================================
// SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("==================================");
  Serial.println(" Hydro Grow ESP32-CAM Camera ");
  Serial.println("==================================");

  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  if (!initCamera()) {
    Serial.println("[FATAL] Camera failed. Halting.");
    while (true) {
      delay(1000);
    }
  }

  connectToWiFi();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[BOOT] WiFi not connected in setup, loop() will retry");
    return;
  }

  startMdnsResponder();

  client.onEvent(onEventsCallback);
  client.onMessage(onMessageCallback);
  connectWebSocket();
}

// ==========================================
// MAIN LOOP
// ==========================================
void loop() {
  unsigned long now = millis();

  if (WiFi.status() != WL_CONNECTED) {
    if (now - lastWsRetry >= WS_RETRY_INTERVAL_MS) {
      lastWsRetry = now;
      Serial.println("[WiFi] Reconnecting...");
      connectToWiFi();
    }
    return;
  }

  if (client.available()) {
    client.poll();
  } else if (now - lastWsRetry >= WS_RETRY_INTERVAL_MS) {
    lastWsRetry = now;
    Serial.println("[WS] Reconnecting...");
    serverIp = "";
    connectWebSocket();
  }

  if (!client.available()) {
    if (now - lastStatusPrint >= STATUS_INTERVAL_MS) {
      lastStatusPrint = now;
      Serial.println("[STATUS] Not connected");
    }
    return;
  }

  if (now - lastFrameTime >= FRAME_INTERVAL_MS) {
    lastFrameTime = now;
    sendFrame();
  }

  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeat = now;
    sendHeartbeat();
  }

  if (now - lastStatusPrint >= STATUS_INTERVAL_MS) {
    lastStatusPrint = now;
    Serial.println("[STATUS] Connected");
  }
}
