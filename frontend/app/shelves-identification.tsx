import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { ShelfSelectionCard } from '../components/ShelfSelectionCard';
import api from '../services/api';

interface Shelf {
  id: number;
  name: string;
  status: string;
  day: number;
  stage: string;
  variant: 'active' | 'empty';
}

export default function ShelvesIdentification() {
  const router = useRouter();
  const [selectedShelfId, setSelectedShelfId] = useState<number>(3);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [shelves, setShelves] = useState<Shelf[]>([
    {
      id: 3,
      name: 'Shelf 03 - Rice Plant',
      status: 'Day 1 - Growing',
      day: 1,
      stage: 'Seed',
      variant: 'active' as const,
    },
    {
      id: 4,
      name: 'Shelf 04 - Empty',
      status: 'Day 1 - Growing',
      day: 1,
      stage: 'Seed',
      variant: 'empty' as const,
    },
    {
      id: 5,
      name: 'Shelf 05 - Empty',
      status: 'Day 1 - Growing',
      day: 1,
      stage: 'Seed',
      variant: 'empty' as const,
    }
  ]);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setScanProgress(0);

      Alert.alert(
        'Starting Scan',
        'The mobile ESP32-CAM will now scan all shelves from top-right to bottom-left. This may take a few moments.',
        [{ text: 'OK' }]
      );

      // Use mock scan for testing (change to /api/scan/start for real ESP32)
      const useMockScan = true; // Set to false when ESP32 is connected
      const endpoint = useMockScan ? '/api/scan/mock' : '/api/scan/start';
      
      // Start the scan
      const response = await api.post(endpoint);
      
      if (response.data.success) {
        // Update shelves with scan results
        const scannedShelves: Shelf[] = response.data.shelves.map((shelf: any) => ({
          id: shelf.shelf_id,
          name: shelf.shelf_name,
          status: shelf.has_plant 
            ? `${shelf.stage} - ${Math.round(shelf.avg_confidence)}% confidence`
            : 'Empty',
          day: 1,
          stage: shelf.stage,
          variant: shelf.has_plant ? 'active' : 'empty',
        }));

        setShelves(scannedShelves);
        
        const scanType = response.data.is_simulation ? '🧪 SIMULATION' : '';
        Alert.alert(
          'Scan Complete',
          `${scanType}\nFound plants on ${response.data.shelves.filter((s: any) => s.has_plant).length} shelf(s)`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Scan Failed', response.data.message || 'Failed to complete scan');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      Alert.alert(
        'Scan Error',
        error.response?.data?.message || 'Failed to start scan. Make sure the ESP32 devices are connected.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  const handleNext = () => {
    router.push('/seed-identification');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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
        {/* Header Titles */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Shelves Identification</Text>
          <Text style={styles.pageSubtitle}>Smart Hydroponic System</Text>
        </View>

        {/* Scan Area */}
        <TouchableOpacity 
          style={[styles.scanCard, isScanning && styles.scanCardActive]} 
          activeOpacity={0.8}
          onPress={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <ActivityIndicator size="large" color="#00A859" style={{ marginBottom: 12 }} />
              <Text style={styles.scanText}>Scanning Shelves...</Text>
              <Text style={styles.scanSubtext}>Moving ESP32-CAM across structure</Text>
            </>
          ) : (
            <>
              <Text style={styles.scanText}>Scan</Text>
              <View style={styles.scanIconContainer}>
                <MaterialCommunityIcons name="barcode-scan" size={32} color="#333" />
              </View>
              <Text style={styles.scanSubtext}>Tap to start automated shelf scan</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Available Shelves</Text>

        {/* Shelves List */}
        <View style={styles.shelvesList}>
          {shelves.map((shelf) => (
            <ShelfSelectionCard
              key={shelf.id}
              shelfName={shelf.name}
              status={shelf.status}
              day={shelf.day}
              stage={shelf.stage}
              variant={shelf.variant}
              isSelected={selectedShelfId === shelf.id}
              onPress={() => setSelectedShelfId(shelf.id)}
            />
          ))}
        </View>
        
        {/* Next Button */}
        <View style={styles.footer}>
           <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
             <Text style={styles.nextButtonText}>NEXT</Text>
             <Ionicons name="arrow-forward-circle-outline" size={24} color="white" style={{marginLeft: 8}} />
           </TouchableOpacity>
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
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22, // Slightly smaller than Dashboard title
    fontWeight: '400',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scanCard: {
    backgroundColor: '#EAEAEA', // Light gray background
    height: 140,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCardActive: {
    backgroundColor: '#E8F5E9', // Light green when scanning
  },
  scanText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  scanSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  scanIconContainer: {
    // width: 48,
    // height: 48,
    // alignItems: 'center',
    // justifyContent: 'center',
    // borderWidth: 1.5,
    // borderColor: '#333',
    // borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  shelvesList: {
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#00A859', // Green button
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }

});
