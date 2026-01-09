import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Switch, Alert, RefreshControl } from 'react-native';
import { actuatorAPI, systemAPI, VIDEO_FEED_URL } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

interface ActuatorStatus {
  pump: string;
  fan: string;
  led_strip: string;
  brightness: number;
  rail: string;
}

interface DeviceStatus {
  mobile: boolean;
  stationary: boolean;
}

export default function Settings() {
  const [actuators, setActuators] = useState<ActuatorStatus | null>(null);
  const [devices, setDevices] = useState<DeviceStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [ledBrightness, setLedBrightness] = useState(128);

  const fetchData = async () => {
    try {
      const [actuatorRes, deviceRes] = await Promise.all([
        actuatorAPI.getStatus(),
        systemAPI.getDevicesStatus()
      ]);
      setActuators(actuatorRes.data);
      setDevices(deviceRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePump = async (enabled: boolean) => {
    try {
      await actuatorAPI.controlPump(enabled ? 'ON' : 'OFF');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to control pump');
    }
  };

  const handleFan = async (enabled: boolean) => {
    try {
      await actuatorAPI.controlFan(enabled ? 'ON' : 'OFF');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to control fan');
    }
  };

  const handleLED = async (enabled: boolean) => {
    try {
      await actuatorAPI.controlLED(enabled ? 'ON' : 'OFF');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to control LED');
    }
  };

  const handleLEDBrightness = async (brightness: number) => {
    try {
      setLedBrightness(brightness);
      await actuatorAPI.controlLED('SET_BRIGHTNESS', brightness);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to set brightness');
    }
  };

  const handleRail = async (direction: 'MOVE_LEFT' | 'MOVE_RIGHT' | 'STOP') => {
    try {
      await actuatorAPI.controlRail(direction);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to control rail');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>System Controls</Text>

      {/* Device Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📡 Device Status</Text>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Stationary ESP32:</Text>
            <View style={[styles.statusBadge, devices?.stationary ? styles.online : styles.offline]}>
              <Text style={styles.statusText}>{devices?.stationary ? 'ONLINE' : 'OFFLINE'}</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Mobile ESP32-CAM:</Text>
            <View style={[styles.statusBadge, devices?.mobile ? styles.online : styles.offline]}>
              <Text style={styles.statusText}>{devices?.mobile ? 'ONLINE' : 'OFFLINE'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actuator Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Actuator Controls</Text>
        
        {/* Pump */}
        <View style={styles.card}>
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <Ionicons name="water" size={24} color="#2196F3" />
              <Text style={styles.controlLabel}>Water Pump</Text>
            </View>
            <Switch
              value={actuators?.pump === 'ON'}
              onValueChange={handlePump}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
            />
          </View>
        </View>

        {/* Fan */}
        <View style={styles.card}>
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <Ionicons name="sync" size={24} color="#FF9800" />
              <Text style={styles.controlLabel}>Fan</Text>
            </View>
            <Switch
              value={actuators?.fan === 'ON'}
              onValueChange={handleFan}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
            />
          </View>
        </View>

        {/* LED Strip */}
        <View style={styles.card}>
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <Ionicons name="bulb" size={24} color="#FFC107" />
              <Text style={styles.controlLabel}>LED Strip</Text>
            </View>
            <Switch
              value={actuators?.led_strip === 'ON'}
              onValueChange={handleLED}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
            />
          </View>
          {actuators?.led_strip === 'ON' && (
            <View style={styles.brightnessControl}>
              <Text style={styles.brightnessLabel}>Brightness: {actuators?.brightness}</Text>
              <View style={styles.brightnessButtons}>
                <TouchableOpacity style={styles.brightBtn} onPress={() => handleLEDBrightness(64)}>
                  <Text>25%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.brightBtn} onPress={() => handleLEDBrightness(128)}>
                  <Text>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.brightBtn} onPress={() => handleLEDBrightness(192)}>
                  <Text>75%</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.brightBtn} onPress={() => handleLEDBrightness(255)}>
                  <Text>100%</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Rail Control */}
        <View style={styles.card}>
          <View style={styles.railHeader}>
            <Ionicons name="train" size={24} color="#9C27B0" />
            <Text style={styles.controlLabel}>Mobile Rail</Text>
          </View>
          <View style={styles.railButtons}>
            <TouchableOpacity 
              style={[styles.railBtn, styles.railBtnLeft]} 
              onPress={() => handleRail('MOVE_LEFT')}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.railBtnText}>Left</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.railBtn, styles.railBtnStop]} 
              onPress={() => handleRail('STOP')}
            >
              <Ionicons name="stop" size={20} color="#fff" />
              <Text style={styles.railBtnText}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.railBtn, styles.railBtnRight]} 
              onPress={() => handleRail('MOVE_RIGHT')}
            >
              <Text style={styles.railBtnText}>Right</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Video Feed Link */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📹 Camera Feed</Text>
        <View style={styles.card}>
          <Text style={styles.videoInfo}>Live video feed available at:</Text>
          <Text style={styles.videoUrl}>{VIDEO_FEED_URL}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  brightnessControl: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  brightnessLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  brightnessButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  brightBtn: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  railHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  railButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  railBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    padding: 12,
    borderRadius: 8,
  },
  railBtnLeft: {
    backgroundColor: '#2196F3',
  },
  railBtnStop: {
    backgroundColor: '#F44336',
  },
  railBtnRight: {
    backgroundColor: '#4CAF50',
  },
  railBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  videoInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  videoUrl: {
    fontSize: 12,
    color: '#2196F3',
    fontFamily: 'monospace',
  },
});
