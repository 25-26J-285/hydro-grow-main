import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { PlantCard } from '../../components/PlantCard';
import { authAPI } from '../../services/api';

interface Item {
  id: number;
  name: string;
  status: string;
  ph: number;
}

export default function Dashboard() {
  const router = useRouter();

  // Use mock data directly to match design request
  const items = [
    { id: 1, name: 'Rice Plant', status: 'Growing', ph: 6.5, day: 5, progress: 52 },
    { id: 2, name: 'Rice Plant', status: 'Growing', ph: 6.4, day: 7, progress: 52 },
  ];

  /* 
  // Commented out backend integration for UI demo purposes
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getItems();
      setItems(response.data.items || []);
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Failed to load plants');
    } finally {
      setLoading(false);
    }
  };
  */

  const handleAddPlant = () => {
    console.log('Navigating to shelves identification...');
    router.push('/shelves-identification');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Logo and Notifications of the app*/}
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="sprout" size={24} color="#4A4A4A" style={styles.logoIcon}/>
            <Text style={styles.appName}>HydroGrow</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Dashboard Title Section */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>Smart Hydroponic System</Text>
        </View>

        {/* Add Button Area */}
        <TouchableOpacity
            style={styles.addCard}
            onPress={handleAddPlant}
            activeOpacity={0.8}
        >
            <Text style={styles.addText}>Add</Text>
            <View style={styles.addIconContainer}>
                <Ionicons name="add" size={28} color="black" />
            </View>
        </TouchableOpacity>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Testing & Tools</Text>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/seed-identification')}
            activeOpacity={0.8}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionCardIcon}>
                <MaterialCommunityIcons name="leaf-circle" size={24} color={Colors.primary} />
              </View>
              <View style={styles.actionCardText}>
                <Text style={styles.actionCardTitle}>Seed Identification</Text>
                <Text style={styles.actionCardDesc}>Test rice type & quality with local images</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/germination-detection-test')}
            activeOpacity={0.8}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionCardIcon}>
                <MaterialCommunityIcons name="seed" size={24} color={Colors.primary} />
              </View>
              <View style={styles.actionCardText}>
                <Text style={styles.actionCardTitle}>Germination Detection</Text>
                <Text style={styles.actionCardDesc}>Test YOLO germination model with local images</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Current Plants</Text>

        {/* Plant Cards - Displayed directly from mock data */}
        { items.map((item) => (
        <PlantCard
            key={item.id}
            plantName={item.name}
            shelf={`Shelf 0${item.id}`}
            day={item.day}
            progress={item.progress}
            status={item.status}
            onPress={() => router.push('/plant-details')}
        />
        ))}
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 2,
    color: 'white',
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dashboardHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#333',
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContent: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCard: {
    backgroundColor: '#EAEAEA',
    height: 160,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginHorizontal: 20,
  },
  addText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  addIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionCardText: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
});
