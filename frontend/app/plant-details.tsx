import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

export default function PlantDetails() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'plant' | 'disease'>('plant');

  const DiseaseItem = ({ title, subtitle, icon, isAlert }: { title: string, subtitle: string, icon: any, isAlert?: boolean }) => (
    <View style={styles.card}>
      <View style={styles.diseaseItemRow}>
          <View style={styles.diseaseIconBox}> 
              <MaterialCommunityIcons name="sprout" size={24} color="white" />
          </View>
          <View style={styles.diseaseInfo}>
              <Text style={styles.diseaseTitle}>{title}</Text>
              <Text style={styles.diseaseSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.diseaseStateIcon}>
             {isAlert ? (
               <Ionicons name="warning" size={20} color="#4B5563" />
             ) : (
               <View style={styles.shieldIcon}>
                 <Ionicons name="shield-checkmark" size={14} color="#333" />
               </View>
             )}
          </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <View style={styles.logoIcon}>
                <MaterialCommunityIcons name="sprout" size={20} color="white" />
              </View>
             <Text style={styles.appName}>HydroGrow</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>System Overview</Text>

        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
           <TouchableOpacity 
             style={[styles.toggleButton, activeTab === 'plant' && styles.toggleButtonActive]}
             onPress={() => setActiveTab('plant')}
           >
             <Text style={[styles.toggleText, activeTab === 'plant' && styles.toggleTextActive]}>Plant</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[styles.toggleButton, activeTab === 'disease' && styles.toggleButtonActive]}
             onPress={() => setActiveTab('disease')}
           >
             <Text style={[styles.toggleText, activeTab === 'disease' && styles.toggleTextActive]}>Disease</Text>
           </TouchableOpacity>
        </View>

        {activeTab === 'plant' ? (
        <>
            {/* System Overview - Stats */}
            <View style={styles.statsRow}>
                {/* Temperature */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <FontAwesome5 name="thermometer-half" size={14} color={Colors.primary} />
                        <Text style={styles.statLabel}>Temperature</Text>
                    </View>
                    <Text style={styles.statValue}>24°C</Text>
                    <Text style={styles.statStatus}>Optimal</Text>
                </View>

                {/* Humidity */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Ionicons name="water-outline" size={14} color={Colors.primary} />
                        <Text style={styles.statLabel}>Humidity</Text>
                    </View>
                    <Text style={styles.statValue}>65%</Text>
                    <Text style={styles.statStatus}>Good</Text>
                </View>

                {/* pH Level */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <FontAwesome5 name="flask" size={14} color={Colors.primary} />
                        <Text style={styles.statLabel}>pH Level</Text>
                    </View>
                    <Text style={styles.statValue}>6.2</Text>
                    <Text style={styles.statStatus}>Ideal</Text>
                </View>
            </View>

            {/* Plant Camera */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Plant Camera</Text>
                    <Ionicons name="camera-outline" size={20} color="#555" />
                </View>
                <View style={styles.cameraPlaceholder}>
                    <Text style={styles.liveViewText}>Live Plant View</Text>
                </View>
                <Text style={styles.lastUpdated}>Last updated: 2 min ago</Text>
            </View>

            {/* Growth Stage */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Growth Stage</Text>
                <View style={styles.growthInfoRow}>
                    <View style={styles.growthIconBox}>
                        <MaterialCommunityIcons name="leaf" size={24} color="white" />
                    </View>
                    <View>
                        <Text style={styles.stageName}>Germination</Text>
                        <Text style={styles.stageDetail}>Day 2 of growth</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarRow}>
                        <View style={[styles.progressSegment, styles.segmentActive]} />
                        <View style={styles.progressSegment} />
                        <View style={styles.progressSegment} />
                        <View style={styles.progressSegment} />
                    </View>
                    <View style={styles.progressLabelsRow}>
                        <Text style={[styles.progressLabel, styles.labelActive]}>Germination</Text>
                        <Text style={styles.progressLabel}>Sprout</Text>
                        <Text style={styles.progressLabel}>Seedling</Text>
                        <Text style={styles.progressLabel}>Plant</Text>
                    </View>
                </View>
            </View>

            {/* Alert Card */}
            <View style={[styles.card, styles.alertCard]}>
                <View style={styles.alertContent}>
                    <Ionicons name="warning" size={24} color={Colors.primary} style={styles.alertIcon} />
                    <View>
                        <Text style={styles.alertTitle}>Germination Detection Alert</Text>
                        <Text style={styles.alertMessage}>Germination stage detected – 82% confidence</Text>
                    </View>
                </View>
            </View>
        </>
        ) : (
        <>
            {/* Disease Status Card */}
            <View style={styles.card}>
               <View style={styles.diseaseStatusHeader}>
                  <View style={styles.statusIconCircle}>
                     <Ionicons name="shield-outline" size={20} color="#333" />
                  </View>
                  <View style={{flex: 1, marginLeft: 12}}>
                     <Text style={styles.statusTitle}>Plant Disease</Text>
                     <Text style={styles.statusSubtitle}>diseases detected</Text>
                  </View>
                  <Text style={styles.statusBad}>Bad</Text>
               </View>
            </View>

            {/* Plant Camera (Reused) */}
             <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Plant Camera</Text>
                    <Ionicons name="camera-outline" size={20} color="#555" />
                </View>
                <View style={styles.cameraPlaceholder}>
                    <Text style={styles.liveViewText}>Live Plant View</Text>
                </View>
                <Text style={styles.lastUpdated}>Last updated: 2 min ago</Text>
            </View>

             <DiseaseItem 
               title="Narrow Brown Spots" 
               subtitle="Day 15 of growth" 
               icon="sprout" 
             />
             <DiseaseItem 
               title="Leaf Smut Detected" 
               subtitle="Day 15 of growth" 
               icon="sprout" 
               isAlert
             />
             <DiseaseItem 
               title="Hispa Detected" 
               subtitle="Day 15 of growth" 
               icon="sprout" 
               isAlert
             />
        </>
        )}

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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    backgroundColor: Colors.primary,
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statStatus: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  cameraPlaceholder: {
    height: 140,
    backgroundColor: '#4B5563',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  liveViewText: {
    color: '#fff',
    fontSize: 14,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
  },
  growthInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  growthIconBox: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stageName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  stageDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarRow: {
    flexDirection: 'row',
    height: 6,
    gap: 8,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  segmentActive: {
    backgroundColor: Colors.primary, // Activated dark gray
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  alertCard: {
    backgroundColor: '#fff', // White background as per image, faint shadow/border
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center', // Center vertically
    gap: 16,
  },
  alertIcon: {
    marginTop: 0, // Align properly with text block
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
    color: '#4B5563',
  },
  // Toggle Styles
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    marginBottom: 20,
    marginTop: 8,
    width: 200,
    alignSelf: 'center',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  toggleText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#374151',
    fontWeight: '600',
  },
  // Disease View Styles
  diseaseStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
  },
  statusTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: '#111827',
  },
  statusSubtitle: {
      fontSize: 12,
      color: '#6B7280',
  },
  statusBad: {
      fontSize: 12,
      fontWeight: '500',
      color: '#111827',
  },
  diseaseItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  diseaseIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#4B5563',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  diseaseInfo: {
      flex: 1,
  },
  diseaseTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#111827',
      marginBottom: 2,
  },
  diseaseSubtitle: {
      fontSize: 12,
      color: '#6B7280',
  },
  diseaseStateIcon: {
      marginLeft: 10,
  },
  shieldIcon: {
      backgroundColor: '#E5E7EB',
      borderRadius: 12,
      padding: 4,
  }
});