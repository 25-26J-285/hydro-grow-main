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

export default function LoginScreen() {
  const router = useRouter();
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
      const { user } = await authService.login(email, password);
      Alert.alert('Success', `Welcome ${user.fullname}!`);
      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || 'Login failed. Please try again.';
      Alert.alert('Login Failed', errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Login</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.welcomeTitle}>Welcome to HydroGrow</Text>
          <Text style={styles.welcomeSub}>Sign in to your account</Text>

          <Text style={styles.sectionTitle}>Let's get started</Text>
          <Text style={styles.sectionSub}>
            Sign in to monitor and control your hydroponic farm
          </Text>

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

          {/* Remember & Forgot Password */}
          <View style={styles.rowBetween}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <CustomButton
            title="Sign In"
            loading={loading}
            onPress={handleLogin}
            disabled={loading}
          />

          {/* Divider */}
          <View style={styles.orRow}>
            <View style={styles.hr} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.hr} />
          </View>

          {/* Social Buttons */}
          <CustomButton
            title="Continue with Google"
            variant="outline"
            disabled={loading}
          />
          <CustomButton
            title="Continue with Apple"
            variant="outline"
            disabled={loading}
          />
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleGoToRegister} disabled={loading}>
            <Text style={styles.signupLink}> Sign Up here</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    height: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: Colors.gray,
    borderRadius: 2,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: {
    color: '#666',
    fontSize: 14,
  },
  forgot: {
    color: Colors.primary,
    fontWeight: '600',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  hr: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 12,
    color: '#999',
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
