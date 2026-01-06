import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QualityCardProps {
  seedType: string;
  day: number;
  quality: 'Good' | 'Bad';
  colors: {
    lightGray: string;
    progressData: string;
    success: string;
    error: string;
  };
}

const QualityCard: React.FC<QualityCardProps> = ({ 
  seedType, 
  day, 
  quality, 
  colors 
}) => {
  const isGoodQuality = quality === 'Good';
  const cardBackgroundColor = isGoodQuality ? colors.lightGray : '#FFE5E5';
  const dotColor = isGoodQuality ? colors.success : colors.error;

  return (
    <View style={[styles.container, { backgroundColor: cardBackgroundColor }]}>
      <View style={styles.header}>
        <View style={[styles.seedTypeBadge, { backgroundColor: colors.progressData }]}>
          <Text style={styles.seedTypeText}>{seedType}</Text>
        </View>
        
        <View style={styles.dayBadge}>
          <Ionicons name="calendar-outline" size={15} color="black" />
          <Text style={styles.dayText}>Day {day}</Text>
        </View>
      </View>

      <Text style={styles.qualityLabel}>Quality</Text>

      <View style={styles.qualityRow}>
        <Text>{quality}</Text>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    height: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seedTypeBadge: {
    width: 80,
    height: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedTypeText: {
    color: '#fff',
  },
  dayBadge: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 5,
    width: 65,
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 10,
  },
  qualityLabel: {
    marginTop: 30,
    fontWeight: 'bold',
    fontSize: 18,
  },
  qualityRow: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 40,
    borderWidth: 1,
  },
});

export default QualityCard;