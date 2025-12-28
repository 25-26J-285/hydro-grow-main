import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function OnboardingScreen({ onSkip, onContinue }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipTouch} onPress={onSkip}>
        <Text style={styles.skip}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <View style={styles.logoCircle}>
          <Image source={require('../assets/plant-logo.png')} style={styles.logoImage} />
        </View>

        <Text style={styles.title}>Smart Hydroponic{"\n"}System</Text>

        <Text style={styles.subtitle}>
          Monitor and control your{"\n"}hydroponic fodder farm with AI-powered{"\n"}technology designed for Sri Lankan
          farmers
        </Text>
      </View>

      <TouchableOpacity style={styles.cta} onPress={onContinue}>
        <Text style={styles.ctaText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fdfa', paddingHorizontal: 24 },
  skipTouch: { alignItems: 'flex-end', marginTop: 12 },
  skip: { color: '#4b4b4b' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#e8f6f0', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  logoImage: { width: 70, height: 70, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  subtitle: { textAlign: 'center', color: '#667', lineHeight: 20, paddingHorizontal: 12 },
  cta: { backgroundColor: '#0aa370', margin: 24, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700' },
});
