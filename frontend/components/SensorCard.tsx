import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SensorCardProps {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  status: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  iconName,
  label,
  value,
  status,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name={iconName} size={20} color="#333" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#D1FAE5', // Light mint/teal green background
    borderRadius: 20,
    padding: 16,
    width: '47%', // roughly half width minus gap
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6
  },
  label: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    color: '#4B5563',
  },
});
