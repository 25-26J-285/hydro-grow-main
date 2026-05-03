import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { API_BASE_URL, sensorAPI } from '../../services/api';

interface AllSensors {
  temp: number;
  humidity: number;
  airQuality: number;
  light: number;
  ph: number;
  voltage: number;
  current: number;
  power: number;
  totalEnergy: number;
  energyStatus: string;
}

interface DeviceStatus {
  mobile: boolean;
  stationary: boolean;
}

const isConnected = (device: unknown) =>
  typeof device === 'boolean'
    ? device
    : !!(device && typeof device === 'object' && 'connected' in device && (device as { connected?: boolean }).connected);

function SensorCard({
  icon,
  label,
  value,
  unit,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name={icon as any} size={28} color={Colors.primary} />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>
        {value}
        {unit ? <Text style={styles.cardUnit}> {unit}</Text> : null}
      </Text>
      {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
    </View>
  );
}

export default function Sensors() {
  const [sensors, setSensors] = useState<AllSensors>({
    temp: 0,
    humidity: 0,
    airQuality: 0,
    light: 0,
    ph: 0,
    voltage: 0,
    current: 0,
    power: 0,
    totalEnergy: 0,
    energyStatus: 'UNKNOWN',
  });
  const [devices, setDevices] = useState<DeviceStatus>({ mobile: false, stationary: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [allRes, energyRes, deviceRes] = await Promise.all([
        sensorAPI.getAll(),
        sensorAPI.getEnergy(),
        sensorAPI.getDeviceStatus(),
      ]);

      const all = allRes.data;
      const energy = energyRes.data;
      const deviceData = deviceRes.data;

      setSensors({
        temp: all.mobile?.temp ?? 0,
        humidity: all.mobile?.humidity ?? 0,
        airQuality: all.mobile?.air_quality ?? 0,
        light: all.mobile?.light ?? 0,
        ph: all.stationary?.ph ?? 0,
        voltage: energy.voltage ?? 0,
        current: energy.current ?? 0,
        power: energy.power ?? 0,
        totalEnergy: energy.total_energy ?? 0,
        energyStatus: energy.status ?? 'UNKNOWN',
      });

      setDevices({
        mobile: isConnected(deviceData.mobile),
        stationary: isConnected(deviceData.stationary),
      });

      setError(null);
    } catch {
      setError(`Unable to reach server at ${API_BASE_URL}. Check that your phone and computer are on the same Wi-Fi.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sensors</Text>
        <View style={styles.deviceRow}>
          <View style={styles.deviceBadge}>
            <View style={[styles.dot, { backgroundColor: devices.mobile ? '#22c55e' : '#ef4444' }]} />
            <Text style={styles.deviceLabel}>Mobile</Text>
          </View>
          <View style={styles.deviceBadge}>
            <View style={[styles.dot, { backgroundColor: devices.stationary ? '#22c55e' : '#ef4444' }]} />
            <Text style={styles.deviceLabel}>Stationary</Text>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={16} color="#fff" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading sensor data...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Mobile Unit */}
          <Text style={styles.sectionTitle}>Mobile Unit (ESP32-CAM)</Text>
          <View style={styles.grid}>
            <SensorCard icon="thermometer" label="Temperature" value={sensors.temp.toFixed(1)} unit="°C" sub="DHT22" />
            <SensorCard icon="water-percent" label="Humidity" value={sensors.humidity.toFixed(1)} unit="%" sub="DHT22" />
            <SensorCard icon="air-filter" label="Air Quality" value={sensors.airQuality.toFixed(1)} unit="%" sub="MQ-135" />
            <SensorCard icon="weather-sunny" label="Light Level" value={sensors.light.toFixed(1)} unit="%" sub="LDR" />
          </View>

          {/* Stationary Unit */}
          <Text style={styles.sectionTitle}>Stationary Unit (NodeMCU)</Text>
          <View style={styles.grid}>
            <SensorCard icon="flask" label="pH Level" value={sensors.ph.toFixed(2)} sub="Analog pH" />
            <SensorCard icon="lightning-bolt" label="Voltage" value={sensors.voltage.toFixed(1)} unit="V" sub="PZEM-004T" />
            <SensorCard icon="current-ac" label="Current" value={sensors.current.toFixed(2)} unit="A" sub="PZEM-004T" />
            <SensorCard icon="meter-electric" label="Power" value={sensors.power.toFixed(1)} unit="W" sub="PZEM-004T" />
            <SensorCard
              icon="battery-charging"
              label="Total Energy"
              value={sensors.totalEnergy.toFixed(3)}
              unit="kWh"
              sub={`Status: ${sensors.energyStatus}`}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  deviceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: 13,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 6,
  },
  cardUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  cardSub: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'center',
  },
});
