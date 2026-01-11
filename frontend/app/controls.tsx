import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default function Controls() {
  const [activeTab, setActiveTab] = useState('climate');
  const [waterPumpOn, setWaterPumpOn] = useState(true);
  const [lightsOn, setLightsOn] = useState(true);
  const [fanOn, setFanOn] = useState(true);
  const [selectedPh, setSelectedPh] = useState('6.2');

  const phTargets = ['5.5', '6.0', '6.2', '6.5'];

  //molinda controls screen

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Controls</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'climate' && styles.activeTab]}
            onPress={() => setActiveTab('climate')}
          >
            <Text style={[styles.tabText, activeTab === 'climate' && styles.activeTabText]}>
              Climate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'irrigation' && styles.activeTab]}
            onPress={() => setActiveTab('irrigation')}
          >
            <Text style={[styles.tabText, activeTab === 'irrigation' && styles.activeTabText]}>
              Irrigation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'lighting' && styles.activeTab]}
            onPress={() => setActiveTab('lighting')}
          >
            <Text style={[styles.tabText, activeTab === 'lighting' && styles.activeTabText]}>
              Lighting
            </Text>
          </TouchableOpacity>
        </View>

        {/* Water Management Section */}
        <View style={styles.section}>
          <View style={styles.waterManagementHeader}>
            <Text style={styles.sectionTitle}>Water Management</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Running</Text>
            </View>
          </View>

          {/* Water Pump */}
          <View style={styles.controlItem}>
            <Text style={styles.controlLabel}>Water Pump</Text>
            <Switch
              value={waterPumpOn}
              onValueChange={setWaterPumpOn}
              trackColor={{ false: '#e0e0e0', true: '#81c784' }}
              thumbColor={waterPumpOn ? Colors.primary : '#f4f3f4'}
            />
          </View>

          {/* Lights */}
          <View style={styles.controlItem}>
            <Text style={styles.controlLabel}>Lights</Text>
            <Switch
              value={lightsOn}
              onValueChange={setLightsOn}
              trackColor={{ false: '#e0e0e0', true: '#81c784' }}
              thumbColor={lightsOn ? Colors.primary : '#f4f3f4'}
            />
          </View>

          {/* Fan */}
          <View style={styles.controlItem}>
            <Text style={styles.controlLabel}>Fan</Text>
            <Switch
              value={fanOn}
              onValueChange={setFanOn}
              trackColor={{ false: '#e0e0e0', true: '#81c784' }}
              thumbColor={fanOn ? Colors.primary : '#f4f3f4'}
            />
          </View>

          {/* pH Level Target */}
          <View style={styles.phContainer}>
            <Text style={styles.phLabel}>pH Level Target</Text>
            <View style={styles.phButtonsRow}>
              {phTargets.map((ph) => (
                <TouchableOpacity
                  key={ph}
                  style={[
                    styles.phButton,
                    selectedPh === ph && styles.phButtonActive,
                  ]}
                  onPress={() => setSelectedPh(ph)}
                >
                  <Text
                    style={[
                      styles.phButtonText,
                      selectedPh === ph && styles.phButtonTextActive,
                    ]}
                  >
                    {ph}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Advanced Manual Controls */}
        <TouchableOpacity style={styles.advancedButton}>
          <Text style={styles.advancedButtonText}>Advanced Manual Controls</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#333',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  waterManagementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  controlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  controlLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  phContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  phLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  phButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  phButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  phButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  phButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  phButtonTextActive: {
    color: '#fff',
  },
  advancedButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  advancedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});

