import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { InputField, CustomButton } from '../../components';
import { authService } from '../../services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullname || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.register(email, password, fullname);
      Alert.alert(
        'Success',
        'Account created! Please log in with your credentials.'
      );
      router.replace('/(auth)/login');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoToLogin}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.welcomeTitle}>Welcome to HydroGrow</Text>
          <Text style={styles.welcomeSub}>Create your account to get started</Text>

          <Text style={styles.sectionTitle}>Register</Text>
          <Text style={styles.sectionSub}>
            Sign up to manage your hydroponic farm
          </Text>

          {/* Full Name Input */}
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            value={fullname}
            onChangeText={setFullname}
            editable={!loading}
            icon={<MaterialIcons name="person" size={20} color={Colors.gray} />}
          />

          {/* Email Input */}
          <InputField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            icon={<MaterialIcons name="email" size={20} color={Colors.gray} />}
          />

          {/* Password Input */}
          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            icon={<MaterialIcons name="lock" size={20} color={Colors.gray} />}
          />

          {/* Confirm Password Input */}
          <InputField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
            icon={<MaterialIcons name="lock" size={20} color={Colors.gray} />}
          />

          {/* Register Button */}
          <CustomButton
            title="Create Account"
            loading={loading}
            onPress={handleRegister}
            disabled={loading}
          />

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleGoToLogin} disabled={loading}>
              <Text style={styles.loginLink}> Login here</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    height: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  mainContent: {
    padding: 20,
  },
  welcomeTitle: {
    textAlign: 'center',
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  welcomeSub: {
    textAlign: 'center',
    color: '#777',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    color: '#333',
  },
  sectionSub: {
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
