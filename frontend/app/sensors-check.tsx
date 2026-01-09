import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SensorCard } from '../components/SensorCard';

export default function SensorsCheck() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/actuators-control');
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
            <Text style={styles.pageTitle}>Sensors</Text>
            <Text style={styles.pageSubtitle}>Smart Hydroponic System</Text>
        </View>

        {/* Refresh Card */}
        <TouchableOpacity style={styles.refreshCard} activeOpacity={0.8}>
          <Text style={styles.refreshText}>Refresh</Text>
          {/* Using a placeholder view for the refresh indicator in the screenshot if needed, or just text */}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Active Sensors</Text>

        {/* Sensors Grid */}
        <View style={styles.gridContainer}>
          <SensorCard
            iconName="thermometer"
            label="Temperature"
            value="24°C"
            status="Optimal"
          />
          <SensorCard
            iconName="water-percent"
            label="Humidity"
            value="65%"
            status="Good"
          />
          <SensorCard
            iconName="flask-empty" // Closest to pH beaker
            label="pH Level"
            value="6.2"
            status="Ideal"
          />
          <SensorCard
            iconName="lightning-bolt"
            label="EC"
            value="1.8"
            status="Normal"
          />
          <SensorCard
            iconName="white-balance-sunny"
            label="Light Level"
            value="6.2" // Value from screenshot, though weird for light
            status="Ideal"
          />
           <SensorCard
            iconName="air-filter"
            label="Air Quality" // Typo 'Qulity' in screenshot, fixing it here
            value="1.8"
            status="Normal"
          />
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
  refreshCard: {
    backgroundColor: '#EAEAEA',
    height: 140,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: 16,
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
