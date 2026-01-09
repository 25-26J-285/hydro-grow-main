import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PlantItem {
  id: string;
  name: string;
  growthStatus: string;
  route: string;
}

const PlantListItem = ({ name, growthStatus, onPress }: { name: string; growthStatus: string, onPress: () => void }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="leaf" size={24} color="white" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.plantName}>{name}</Text>
      <Text style={styles.growthStatus}>{growthStatus}</Text>
    </View>
  </TouchableOpacity>
);

export default function Plants() {
  const router = useRouter();
  const plants: PlantItem[] = [
    { id: '1', name: 'BG201 - Rice Plant', growthStatus: 'Day 2 of growth', route: '/plant-details' },
    { id: '2', name: 'CO2 Grass Plant', growthStatus: 'Day 6 of growth', route: '/co2-grass-details' },
    { id: '3', name: 'BG203 - Rice Plant', growthStatus: 'Day 10 of growth', route: '/plant-details' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="sprout" size={20} color="white" />
          </View>
          <Text style={styles.appName}>HydroGrow</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Plants</Text>

        <View style={styles.listContainer}>
          {plants.map((plant) => (
            <PlantListItem 
              key={plant.id} 
              name={plant.name} 
              growthStatus={plant.growthStatus} 
              onPress={() => router.push(plant.route as any)}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    backgroundColor: '#333',
    borderRadius: 6,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24, // increased padding to match screenshot boxiness
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // faint border
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4B5563', // Dark gray
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  growthStatus: {
    fontSize: 14,
    color: '#6B7280',
  }
});
