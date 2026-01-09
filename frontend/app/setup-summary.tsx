import React from 'react';
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

export default function SetupSummary() {
  const router = useRouter();

  const handleSetup = () => {
    // Navigate to the home tab, replacing the current stack connected to setup
    // Using '/home' because (tabs) group is pathless
    router.replace('/home'); 
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
        
        {/* Card 1: Current Stage */}
        <View style={styles.card}>
            <View style={styles.pillContainer}>
                <View style={styles.pill}>
                    <Text style={styles.pillText}>Current Stage</Text>
                </View>
            </View>
            
            <Text style={styles.plantTitle}>Rice Plant - BG 360</Text>
            <Text style={styles.dayText}>Day 1</Text>

            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="sprout" size={40} color="#008000" />
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '25%' }]} />
                </View>
                <Text style={styles.stepText}>Step 1</Text>
            </View>
        </View>

        {/* Card 2: Details */}
        <View style={styles.card}>
            {/* Shelf Row */}
            <View style={styles.row}>
                <View style={styles.iconBadge}>
                    <MaterialCommunityIcons name="ladder" size={24} color="white" />
                </View>
                <Text style={styles.rowText}>Shelf 03</Text>
            </View>

            {/* Seed Row */}
            <View style={styles.row}>
                <View style={styles.iconBadge}>
                    <MaterialCommunityIcons name="leaf" size={24} color="white" />
                </View>
                <Text style={styles.rowText}>BG - 360 seed</Text>
            </View>

            {/* Sensors Row (Complex) */}
            <View style={[styles.row, { alignItems: 'flex-start' }]}>
                <View style={styles.iconBadge}>
                    <MaterialCommunityIcons name="access-point-network" size={24} color="white" />
                </View>
                
                <View style={styles.sensorGrid}>
                    <View style={styles.sensorColumn}>
                        <View style={styles.sensorItem}>
                            <MaterialCommunityIcons name="thermometer" size={16} color="black" />
                            <Text style={styles.sensorLabel}>Temperature</Text>
                        </View>
                        <View style={styles.sensorItem}>
                            <MaterialCommunityIcons name="water-percent" size={16} color="black" />
                            <Text style={styles.sensorLabel}>Humidity</Text>
                        </View>
                        <View style={styles.sensorItem}>
                            <MaterialCommunityIcons name="flask" size={16} color="black" />
                            <Text style={styles.sensorLabel}>pH Level</Text>
                        </View>
                    </View>

                    <View style={styles.sensorColumn}>
                        <View style={styles.sensorItem}>
                            <MaterialCommunityIcons name="white-balance-sunny" size={16} color="black" />
                            <Text style={styles.sensorLabel}>Light Level</Text>
                        </View>
                        <View style={styles.sensorItem}>
                            <MaterialCommunityIcons name="air-filter" size={16} color="black" />
                            <Text style={styles.sensorLabel}>Air Qulity</Text>
                        </View>
                        <View style={styles.sensorItem}>
                            <MaterialCommunityIcons name="lightning-bolt" size={16} color="black" />
                            <Text style={styles.sensorLabel}>EC</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Trays/Slots Row */}
            <View style={styles.row}>
                <View style={styles.iconBadge}>
                    <MaterialCommunityIcons name="inbox-full" size={24} color="white" />
                </View>
                <View>
                    <Text style={styles.rowText}>Trays : 3</Text>
                    <Text style={styles.rowText}>Slots : 7</Text>
                </View>
            </View>

        </View>

        {/* SETUP Button */}
        <View style={styles.footer}>
           <TouchableOpacity style={styles.setupButton} onPress={handleSetup}>
             <Text style={styles.setupButtonText}>SETUP</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#F0FDF4', // Very light green background
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22C55E', // Green border
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  pillContainer: {
    marginBottom: 16,
  },
  pill: {
    backgroundColor: '#0F766E', // Dark Green/Teal
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  plantTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'black',
    marginBottom: 8,
    textAlign: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#DCFCE7', // Lighter green circle
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
  },
  progressContainer: {
      width: '100%',
      alignItems: 'center',
  },
  progressBar: {
      height: 8,
      backgroundColor: '#E5E7EB',
      borderRadius: 4,
      width: '100%',
      marginBottom: 8,
      overflow: 'hidden',
  },
  progressFill: {
      height: '100%',
      backgroundColor: '#15803D', // Green fill
      borderRadius: 4,
  },
  stepText: {
      color: '#666',
      fontSize: 12,
  },
  // Details Card Styles
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 24,
  },
  iconBadge: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#15803D', // Green circle
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
  },
  rowText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'black',
  },
  sensorGrid: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  sensorColumn: {
      gap: 8,
  },
  sensorItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  sensorLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: 'black',
  },
  footer: {
      alignItems: 'center',
      marginTop: 20,
  },
  setupButton: {
      backgroundColor: '#15803D', // Green button
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 25,
      minWidth: 160,
      alignItems: 'center',
  },
  setupButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
  }
});
