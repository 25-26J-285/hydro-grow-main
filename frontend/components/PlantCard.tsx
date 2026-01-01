import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface PlantCardProps {
  plantName: string;
  shelf: string;
  day: number;
  progress: number;
  status: string;
  image?: ImageSourcePropType;
  onPress?: () => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plantName,
  shelf,
  day,
  progress,
  status,
  image,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.plantName}>{`${shelf} - ${plantName}`}</Text>
        <View style={styles.dateBadge}>
          <MaterialCommunityIcons name="calendar" size={14} color="#555" />
          <Text style={styles.dateText}> Day {day}</Text>
        </View>
      </View>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Day {day} - {status}</Text>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Growth Progress</Text>
        <Text style={styles.progressValue}>{progress}%</Text>
      </View>

      {/* Custom Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.stagesRow}>
        <Text style={styles.stageText}>Germination</Text>
        <Text style={styles.stageText}>Sprout</Text>
        <Text style={styles.stageText}>Seedling</Text>
        <Text style={styles.stageText}>Plant</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  plantName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  dateBadge: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  dateText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stageText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
});
