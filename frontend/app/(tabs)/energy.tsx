import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';

import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL, sensorAPI } from '../../services/api';

const ELECTRICITY_RATE_PER_KWH = 45; // Rs. per kWh

interface SensorData {
  temp: number;
  humidity: number;
  ph: number;
  power: number;
  totalEnergy: number;
  voltage: number;
  current: number;
  energyStatus: string;
}

interface EnergyPrediction {
  available: boolean;
  predicted_energy_kwh?: number;
  reason?: string;
  samples_collected?: number;
  samples_needed?: number;
  samples_used?: number;
}

interface DeviceStatus {
  mobile: boolean;
  stationary: boolean;
}

const isConnected = (device: unknown) =>
  typeof device === 'boolean'
    ? device
    : !!(device && typeof device === 'object' && 'connected' in device && (device as { connected?: boolean }).connected);

const formatEnergyValue = (kwh: number) => {
  if (kwh >= 1) {
    return `${kwh.toFixed(5)} kWh`;
  }

  return `${(kwh * 1000).toFixed(4)} Wh`;
};

export default function Energy() {
  const router = useRouter();

  const [sensors, setSensors] = useState<SensorData>({
    temp: 0,
    humidity: 0,
    ph: 0,
    power: 0,
    totalEnergy: 0,
    voltage: 0,
    current: 0,
    energyStatus: 'UNKNOWN',
  });
  const [devices, setDevices] = useState<DeviceStatus>({ mobile: false, stationary: false });
  const [prediction, setPrediction] = useState<EnergyPrediction>({
    available: false,
    reason: 'Collecting live sensor history...',
  });
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
        ph: all.stationary?.ph ?? 0,
        power: energy.power ?? 0,
        totalEnergy: energy.total_energy ?? 0,
        voltage: energy.voltage ?? 0,
        current: energy.current ?? 0,
        energyStatus: energy.status ?? 'UNKNOWN',
      });

      setDevices({
        mobile: isConnected(deviceData.mobile),
        stationary: isConnected(deviceData.stationary),
      });
      setPrediction(
        energy.prediction ?? {
          available: false,
          reason: 'Prediction unavailable.',
        }
      );

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

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleControlsPress = () => {
    router.push('/controls');
  };

  const cost = (sensors.totalEnergy * ELECTRICITY_RATE_PER_KWH).toFixed(2);
  const predictionStatus = prediction.available
    ? `24 samples used${prediction.samples_collected ? ` | ${prediction.samples_collected} collected` : ''}`
    : prediction.reason ?? 'Prediction unavailable';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HydroGrow</Text>
        <TouchableOpacity onPress={handleNotificationPress}>
          <Ionicons name="notifications" size={24} color="#333" />
        </TouchableOpacity>
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
          <View style={styles.deviceStatusRow}>
            <View style={styles.deviceBadge}>
              <View style={[styles.statusDot, { backgroundColor: devices.mobile ? '#22c55e' : '#ef4444' }]} />
              <Text style={styles.deviceLabel}>Mobile Unit</Text>
            </View>
            <View style={styles.deviceBadge}>
              <View style={[styles.statusDot, { backgroundColor: devices.stationary ? '#22c55e' : '#ef4444' }]} />
              <Text style={styles.deviceLabel}>Stationary Unit</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Energy Prediction</Text>
            <Text style={styles.sectionSubtitle}>IOT-powered insights</Text>

            <View style={styles.cardsRow}>
              <View style={styles.card}>
                <MaterialCommunityIcons name="thermometer" size={32} color={Colors.primary} />
                <Text style={styles.cardTitle}>Temperature</Text>
                <Text style={styles.cardValue}>{sensors.temp.toFixed(1)} C</Text>
              </View>

              <View style={styles.card}>
                <MaterialCommunityIcons name="water" size={32} color={Colors.primary} />
                <Text style={styles.cardTitle}>Humidity</Text>
                <Text style={styles.cardValue}>{sensors.humidity.toFixed(1)} %</Text>
              </View>

              <View style={styles.card}>
                <MaterialCommunityIcons name="flask" size={32} color={Colors.primary} />
                <Text style={styles.cardTitle}>pH Level</Text>
                <Text style={styles.cardValue}>{sensors.ph.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Energy Analytics</Text>

            <View style={styles.analyticsRow}>
              <View style={[styles.card, styles.analyticsCard]}>
                <MaterialCommunityIcons name="lightning-bolt" size={28} color="#FFA500" />
                <Text style={styles.analyticsCardTitle}>Current Usage</Text>
                <Text style={styles.analyticsCardValue}>{sensors.power.toFixed(1)} W</Text>
                <Text style={styles.cardSub}>
                  {sensors.voltage.toFixed(1)} V | {sensors.current.toFixed(2)} A
                </Text>
              </View>

              <View style={[styles.card, styles.analyticsCard]}>
                <MaterialCommunityIcons name="cash" size={28} color={Colors.primary} />
                <Text style={styles.analyticsCardTitle}>Today's Cost</Text>
                <Text style={styles.analyticsCardValue}>Rs. {cost}</Text>
                <Text style={styles.cardSub}>{sensors.totalEnergy.toFixed(3)} kWh</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Predicted Energy for Tomorrow</Text>
            <Text style={styles.sectionSubtitle}>ML Prediction</Text>

            <View style={styles.card}>
              <MaterialCommunityIcons name="chart-line" size={32} color={Colors.primary} />
              <Text style={styles.cardTitle}>Estimated Usage</Text>
              <Text style={styles.cardValue}>
                {prediction.available ? formatEnergyValue(prediction.predicted_energy_kwh ?? 0) : '--'}
              </Text>
              <Text style={styles.predictionConfidence}>{predictionStatus}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.section} onPress={handleControlsPress}>
            <Text style={styles.sectionTitle}>Controls</Text>
            <View style={styles.controlsCard}>
              <MaterialCommunityIcons name="cog" size={32} color={Colors.primary} />
              <Text style={styles.controlsText}>Manage your system</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" style={styles.chevron} />
            </View>
          </TouchableOpacity>
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
    paddingBottom: 20,
  },
  deviceStatusRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 8,
  },
  cardSub: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'center',
  },
  predictionConfidence: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
  },
  analyticsCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  analyticsCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 8,
  },
  controlsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  controlsText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chevron: {
    marginLeft: 'auto',
  },
});
