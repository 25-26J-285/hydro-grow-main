import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TraySlotCard } from '../components/TraySlotCard';

// molinda actuators control
export default function ActuatorsControl() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/setup-summary');
  };

  // Mock data representing the grid in the screenshot
  // 4 rows of 3 items
  const [slots, setSlots] = useState([
    // Row 1
    { id: 1, num: '1', variant: 'active', status: 'Connect' },
    { id: 2, num: '2', variant: 'active', status: 'Connect' },
    { id: 3, num: '3', variant: 'active', status: 'Connect' },
    // Row 2
    { id: 4, num: '1', variant: 'active', status: 'Connect' },
    { id: 5, num: '2', variant: 'active', status: 'Connect' },
    { id: 6, num: '3', variant: 'active', status: 'Connect' },
    // Row 3
    { id: 7, num: '1', variant: 'active', status: 'Connect' },
    { id: 8, num: '2', variant: 'inactive', status: 'Disconnect' },
    { id: 9, num: '3', variant: 'inactive', status: 'Disconnect' },
    // Row 4
    { id: 10, num: '1', variant: 'error', status: 'Disconnect' },
    { id: 11, num: '2', variant: 'error', status: 'Disconnect' },
    { id: 12, num: '3', variant: 'error', status: 'Disconnect' },
  ]);

  const handleSlotToggle = (id: number) => {
    setSlots(currentSlots => currentSlots.map(slot => {
      if (slot.id === id) {
        // Toggle between active (Connect) and inactive (Disconnect)
        // Even if it was 'error', clicking it will reset it to active or inactive.
        // Let's assume 'Connect' -> 'Disconnect' (gray)
        // 'Disconnect' (gray or error) -> 'Connect' (light blue)
        if (slot.status === 'Connect') {
          return { ...slot, variant: 'inactive', status: 'Disconnect' };
        } else {
          return { ...slot, variant: 'active', status: 'Connect' };
        }
      }
      return slot;
    }));
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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Actuators</Text>
          <Text style={styles.pageSubtitle}>Smart Hydroponic System</Text>
        </View>

        {/* Live Plant View Card */}
        <View style={styles.cameraCard}>
          <TouchableOpacity style={styles.arrowLeft}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.cameraContent}>
            <TouchableOpacity style={styles.expandIcon}>
              <MaterialCommunityIcons name="arrow-expand-all" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.cameraText}>Live Plant View</Text>
            <Ionicons name="camera" size={24} color="#666" style={{ marginTop: 8 }} />
          </View>

          <TouchableOpacity style={styles.arrowRight}>
            <Ionicons name="chevron-forward" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Active Tray Slots</Text>

        {/* Slots Grid */}
        <View style={styles.gridContainer}>
          {slots.map((slot) => (
            <TraySlotCard
              key={slot.id}
              slotNumber={slot.num}
              variant={slot.variant as any}
              statusText={slot.status}
              onPress={() => handleSlotToggle(slot.id)}
            />
          ))}
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          {/* BACK Button */}
          <TouchableOpacity style={styles.footerBtnBack} onPress={handleBack}>
            <Text style={styles.footerBtnText}>BACK</Text>
          </TouchableOpacity>

          {/* NEXT Button */}
          <TouchableOpacity style={styles.footerBtnNext} onPress={handleNext}>
            <Text style={styles.footerBtnText}>NEXT</Text>
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
    fontSize: 22,
    fontWeight: '400',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cameraCard: {
    backgroundColor: '#EAEAEA',
    height: 160,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  cameraContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  arrowLeft: {
    padding: 10,
  },
  arrowRight: {
    padding: 10,
  },
  expandIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  cameraText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  footerBtnBack: {
    backgroundColor: '#00A859',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  footerBtnNext: {
    backgroundColor: '#00A859',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  footerBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});
