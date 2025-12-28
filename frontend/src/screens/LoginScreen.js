import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';

const API_URL = 'http://localhost:8000'; // Change to your backend URL

export default function LoginScreen({ onBack }) {
  const [email, setEmail] = useState('farmer@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', `Welcome ${data.user.fullname}!`);
        // Store token for future requests
        // In production, use SecureStore or AsyncStorage
        console.log('Token:', data.access_token);
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server. Make sure backend is running at ' + API_URL);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.welcomeTitle}>Welcome to Explore PH</Text>
        <Text style={styles.welcomeSub}>Sign in to your account</Text>

        <Text style={styles.sectionTitle}>Welcome Back!</Text>
        <Text style={styles.sectionSub}>Let's get started by filling out the form below.</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.rowBetween}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.hr} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.hr} />
        </View>

        <TouchableOpacity style={styles.socialButton} disabled={loading}>
          <Text style={styles.socialText}>G   Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} disabled={loading}>
          <Text style={styles.socialText}>   Continue with Apple</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />

        <View style={styles.signupRow}>
          <Text>Don't have an account?</Text>
          <TouchableOpacity>
            <Text style={styles.signupLink}> Sign Up here</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: '#fff' },
  header: { height: 60, backgroundColor: '#148a76', justifyContent: 'center', paddingHorizontal: 16 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  container: { padding: 20 },
  welcomeTitle: { textAlign: 'center', color: '#148a76', fontSize: 22, fontWeight: '700', marginTop: 12 },
  welcomeSub: { textAlign: 'center', color: '#777', marginBottom: 18 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  sectionSub: { color: '#666', marginBottom: 12 },
  input: { backgroundColor: '#f5f8fb', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#ccc', borderRadius: 2, marginRight: 6 },
  checkboxChecked: { backgroundColor: '#148a76', borderColor: '#148a76' },
  rememberText: { color: '#666', fontSize: 14 },
  forgot: { color: '#148a76' },
  signInButton: { backgroundColor: '#148a76', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  signInButtonDisabled: { backgroundColor: '#999' },
  signInText: { color: '#fff', fontWeight: '700' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  hr: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  orText: { marginHorizontal: 8, color: '#999' },
  socialButton: { borderWidth: 1, borderColor: '#e0e0e0', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  socialText: { color: '#222' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  signupLink: { color: '#148a76', fontWeight: '600' },
});
