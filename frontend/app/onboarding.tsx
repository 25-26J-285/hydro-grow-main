import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default function Onboarding() {
  const router = useRouter();

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Logo / Image Container */}
          <View style={styles.imageContainer}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="leaf-outline"
                size={80}
                color={Colors.primary}
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Smart Hydroponic{'\n'}System</Text>

          {/* Description */}
          <Text style={styles.description}>
            Monitor and control your hydroponic fodder farm with AI-powered
            technology designed for Sri Lankan farmers
          </Text>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.cta}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fdfa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipBtn: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  skipText: {
    color: '#4b4b4b',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#e8f6f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
    lineHeight: 32,
  },
  description: {
    textAlign: 'center',
    color: '#667',
    lineHeight: 24,
    fontSize: 14,
    paddingHorizontal: 12,
  },
  cta: {
    backgroundColor: Colors.primary,
    margin: 24,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
