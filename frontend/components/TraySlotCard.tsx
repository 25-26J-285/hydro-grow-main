import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TraySlotCardProps {
  slotNumber: string;
  label?: string; // "Slot"
  statusText: string; // "Connect" or "Disconnect"
  variant: 'active' | 'inactive' | 'error';
  onPress?: () => void;
}

export const TraySlotCard: React.FC<TraySlotCardProps> = ({
  slotNumber,
  label = "Slot",
  statusText,
  variant,
  onPress
}) => {
  // Determine styles based on variant
  let backgroundColor;
  let dotColor;
  let showBanIcon = false;

  switch (variant) {
    case 'active':
      backgroundColor = '#CCFBF1'; // Light Teal/Mint
      dotColor = '#0EA5E9'; // Blue dot
      break;
    case 'inactive':
      backgroundColor = '#E5E7EB'; // Gray
      dotColor = '#4B5563'; // Dark Gray dot
      break;
    case 'error':
      backgroundColor = '#FCA5A5'; // Salmon/Orange-ish
      dotColor = '#4B5563'; // Dark Gray dot
      showBanIcon = true;
      break;
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.number}>{slotNumber}</Text>
      
      <View style={styles.footer}>
        <Text style={[styles.statusText, {color: variant === 'error' ? '#4B5563' : '#9CA3AF' }]}>
            {statusText}
        </Text>
        <View style={styles.iconArea}>
            {showBanIcon ? (
                <Ionicons name="ban-outline" size={16} color="black" style={{marginRight: 4}} />
            ) : null}
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '30%', // Fits 3 in a row with spacing
    aspectRatio: 1, // Square-ish
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '500',
  },
  number: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  iconArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  }
});
