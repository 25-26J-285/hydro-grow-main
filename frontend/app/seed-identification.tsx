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
import { SeedQualityCard } from '../components/SeedQualityCard';

export default function SeedIdentification() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number>(1);

  const plants = [
    {
      id: 1,
      idCode: 'BG - 360',
      day: 1,
      quality: 'Good',
      variant: 'active' as const,
    },
    {
      id: 2,
      idCode: 'AT - 362',
      day: 1,
      quality: 'Bad',
      variant: 'empty' as const,
    },
    {
      id: 3,
      idCode: 'BW - 367',
      day: 1,
      quality: 'Good',
      variant: 'empty' as const,
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/sensors-check');
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
        {/* Header Section with Back Arrow */}
        <View style={styles.headerSection}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View>
                <Text style={styles.pageTitle}>Seed Identification</Text>
                <Text style={styles.pageSubtitle}>Ai-Powered recognition</Text>
            </View>
        </View>

        {/* Refresh Card */}
        <TouchableOpacity style={styles.refreshCard} activeOpacity={0.8}>
          <Text style={styles.refreshText}>Refresh</Text>
          <Ionicons name="refresh" size={28} color="black" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Current Plants</Text>

        {/* Plants List */}
        <View style={styles.listContainer}>
          {plants.map((plant) => (
            <SeedQualityCard
              key={plant.id}
              idCode={plant.idCode}
              day={plant.day}
              quality={plant.quality}
              variant={plant.id === selectedId ? 'active' : 'empty'}
              isSelected={plant.id === selectedId}
              onPress={() => setSelectedId(plant.id)}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  refreshCard: {
    backgroundColor: '#EAEAEA', // {Light gray background}
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
    marginBottom: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  listContainer: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
  },
  footerBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});
