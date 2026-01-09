import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface SeedQualityCardProps {
  idCode: string; // e.g. "BG - 360"
  day: number;
  quality: string; // "Good" or "Bad"
  variant?: 'active' | 'empty'; // "active" is Teal, "empty" is Gray
  isSelected?: boolean;
  onPress?: () => void;
}

export const SeedQualityCard: React.FC<SeedQualityCardProps> = ({
  idCode,
  day,
  quality,
  variant = 'empty',
  isSelected = false,
  onPress,
}) => {
  const isActive = variant === 'active';
  // Matching the screenshot colors
  // Active (Teal): #0D9488
  // Inactive (Gray): #888888 or similar
  const backgroundColor = isActive ? '#0F9D88' : '#888888';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.headerRow}>
        {/* Green Badge for ID */}
        <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>{idCode}</Text>
        </View>

        {/* Day Badge */}
        <View style={styles.dayBadge}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={14} color="#666" />
          <Text style={styles.dayText}> Day {day}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
          <View>
            <Text style={styles.qualityLabel}>Quality</Text>
            <Text style={styles.qualityValue}>{quality}</Text>
          </View>
          
          {/* Radio Button */}
          <View style={styles.radioContainer}>
            {isSelected ? (
                <Ionicons name="checkmark-circle" size={28} color="white" />
            ) : (
                <Ionicons name="ellipse-outline" size={28} color="white" />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  idBadge: {
    backgroundColor: '#059669', // Darker green for the pill
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
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
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  qualityLabel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 4,
  },
  qualityValue: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  radioContainer: {
    paddingBottom: 4, 
  }
});
