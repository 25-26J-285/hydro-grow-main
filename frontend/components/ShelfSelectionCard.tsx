import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface ShelfSelectionCardProps {
  shelfName: string;
  status: string; // e.g. "Day 1 - Growing"
  day: number;
  stage: string; // e.g. "Seed"
  variant?: 'active' | 'empty'; // controls background color (Green vs Gray)
  isSelected?: boolean; // controls radio button state
  onPress?: () => void;
}

export const ShelfSelectionCard: React.FC<ShelfSelectionCardProps> = ({
  shelfName,
  status,
  day,
  stage,
  variant = 'empty',
  isSelected = false,
  onPress,
}) => {
  const isActive = variant === 'active';
  const backgroundColor = isActive ? '#2A9D8F' : '#9CA3AF'; // Teal vs Gray
  
  // Specific colors matching screenshot approximations
  // Green card in screenshot looks like the primary teal #0D9488 or close
  // Gray card is a standard medium gray.

  const cardStyle = {
    backgroundColor: isActive ? '#0F9D88' : '#888888', // Adjusting to match screenshot
  };

  return (
    <TouchableOpacity
      style={[styles.container, cardStyle]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{shelfName}</Text>
        <View style={styles.dayBadge}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={14} color="#666" />
          <Text style={styles.dayText}> Day {day}</Text>
        </View>
      </View>

      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.stageText}>Active Stage : {stage}</Text>
        
        {/* Radio Button */}
        <View style={styles.radioContainer}>
          {isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color="white" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="white" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500', // Medium weight
    color: 'white',
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  statusPill: {
    backgroundColor: 'rgba(0,0,0,0.15)', // slightly darker active pill
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // Pill shape
    marginBottom: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  radioContainer: {
    // Just the container for the icon
  }
});
