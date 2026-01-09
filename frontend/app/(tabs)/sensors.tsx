import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { sensorAPI } from '../../services/api';

interface SensorData {
  mobile: {
    temp: number;
    humidity: number;
    air_quality: number;
    light: number;
    distance: number;
  };
  stationary: {
    ph: number;
    energy: {
      status: string;
      voltage: number;
      current: number;
      power: number;
      total: number;
    };
  };
}

export default function Sensors() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSensorData = async () => {
    try {
      const response = await sensorAPI.getAllSensors();
      setSensorData(response.data);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSensorData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sensor Readings</Text>
        
        {/* Mobile Sensors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Mobile ESP32-CAM</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>🌡️ Temperature</Text>
            <Text style={styles.value}>{sensorData?.mobile.temp.toFixed(1)}°C</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>💧 Humidity</Text>
            <Text style={styles.value}>{sensorData?.mobile.humidity.toFixed(1)}%</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>🌫️ Air Quality</Text>
            <Text style={styles.value}>{sensorData?.mobile.air_quality.toFixed(1)}%</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>💡 Light Level</Text>
            <Text style={styles.value}>{sensorData?.mobile.light.toFixed(1)}%</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>📏 Distance</Text>
            <Text style={styles.value}>{sensorData?.mobile.distance} cm</Text>
          </View>
        </View>

        {/* Stationary Sensors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Stationary ESP32</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>⚗️ pH Level</Text>
            <Text style={styles.value}>{sensorData?.stationary.ph}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>⚡ Energy Monitor</Text>
            <Text style={styles.subValue}>Status: {sensorData?.stationary.energy.status}</Text>
            <Text style={styles.subValue}>Voltage: {sensorData?.stationary.energy.voltage.toFixed(1)} V</Text>
            <Text style={styles.subValue}>Current: {sensorData?.stationary.energy.current.toFixed(2)} A</Text>
            <Text style={styles.subValue}>Power: {sensorData?.stationary.energy.power.toFixed(1)} W</Text>
            <Text style={styles.subValue}>Total: {sensorData?.stationary.energy.total.toFixed(2)} kWh</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
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
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
