import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function Sensors() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensors</Text>
      <Text style={styles.subtitle}>Sensor data coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
