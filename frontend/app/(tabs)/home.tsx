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
import { authAPI, systemAPI } from '../../services/api';

interface Item {
  id: number;
  name: string;
  status: string;
  ph: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [deviceStatus, setDeviceStatus] = useState({ mobile: false, stationary: false });

  // Fetch device status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await systemAPI.getDevicesStatus();
        setDeviceStatus(response.data);
      } catch (error) {
        console.error('Error fetching device status:', error);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Top Bar with Logo and Notifications */}
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

        {/* Device Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, deviceStatus.stationary ? styles.online : styles.offline]} />
            <Text style={styles.statusText}>Stationary: {deviceStatus.stationary ? 'Online' : 'Offline'}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, deviceStatus.mobile ? styles.online : styles.offline]} />
            <Text style={styles.statusText}>Mobile: {deviceStatus.mobile ? 'Online' : 'Offline'}</Text>
          </View>
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
  statusBanner: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
});
