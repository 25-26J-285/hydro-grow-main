import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {showLogin ? (
        <LoginScreen onBack={() => setShowLogin(false)} />
      ) : (
        <OnboardingScreen onSkip={() => setShowLogin(true)} onContinue={() => setShowLogin(true)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
