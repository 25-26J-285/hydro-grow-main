import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

// molinda energy
export default function Energy() {
  const router = useRouter();

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleControlsPress = () => {
    router.push('/controls');
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HydroGrow</Text>
        <TouchableOpacity onPress={handleNotificationPress}>
          <Ionicons name="notifications" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* System Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <Text style={styles.sectionSubtitle}>ML-powered insights</Text>

          <View style={styles.cardsRow}>
            {/* Temperature Card */}
            <View style={styles.card}>
              <MaterialCommunityIcons name="thermometer" size={32} color={Colors.primary} />
              <Text style={styles.cardTitle}>Temperature</Text>
              <Text style={styles.cardValue}>—</Text>
            </View>

            {/* Humidity Card */}
            <View style={styles.card}>
              <MaterialCommunityIcons name="water" size={32} color={Colors.primary} />
              <Text style={styles.cardTitle}>Humidity</Text>
              <Text style={styles.cardValue}>—</Text>
            </View>

            {/* pH Level Card */}
            <View style={styles.card}>
              <MaterialCommunityIcons name="flask" size={32} color={Colors.primary} />
              <Text style={styles.cardTitle}>pH Level</Text>
              <Text style={styles.cardValue}>—</Text>
            </View>
          </View>
        </View>

        {/* Plant Camera Section */}
        <View style={styles.section}>
          <View style={styles.cameraHeader}>
            <Text style={styles.sectionTitle}>Plant Camera</Text>
            <TouchableOpacity>
              <MaterialCommunityIcons name="camera" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraContainer}>
            <Text style={styles.cameraPlaceholder}>Live Plant View</Text>
          </View>

          <Text style={styles.lastUpdated}>Last updated: —</Text>
        </View>

        {/* Energy Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy Analytics</Text>

          <View style={styles.analyticsRow}>
            {/* Current Usage Card */}
            <View style={[styles.card, styles.analyticsCard]}>
              <MaterialCommunityIcons name="lightning-bolt" size={28} color="#FFA500" />
              <Text style={styles.analyticsCardTitle}>Current Usage</Text>
              <Text style={styles.analyticsCardValue}>—</Text>
            </View>

            {/* Today's Cost Card */}
            <View style={[styles.card, styles.analyticsCard]}>
              <MaterialCommunityIcons name="cash" size={28} color={Colors.primary} />
              <Text style={styles.analyticsCardTitle}>Today's Cost</Text>
              <Text style={styles.analyticsCardValue}>—</Text>
            </View>
          </View>
        </View>

        {/* Controls Section */}
        <TouchableOpacity style={styles.section} onPress={handleControlsPress}>
          <Text style={styles.sectionTitle}>Controls</Text>
          <View style={styles.controlsCard}>
            <MaterialCommunityIcons name="cog" size={32} color={Colors.primary} />
            <Text style={styles.controlsText}>Manage your system</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" style={styles.chevron} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 8,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 80,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cameraPlaceholder: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 8,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
  },
  analyticsCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  analyticsCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 8,
  },
  controlsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  controlsText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chevron: {
    marginLeft: 'auto',
  },
});

