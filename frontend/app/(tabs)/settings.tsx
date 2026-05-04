import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import Colors from '../../constants/Colors';
import authService from '../../services/authService';
import { CustomButton } from '../../components';

type StoredUser = {
  email?: string;
  fullname?: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadUser = useCallback(async () => {
    const storedUser = await authService.getUser();
    setUser(storedUser);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const farmerName = user?.fullname || 'Hydro Farmer';
  const initials = farmerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroOverlay} />
          <Text style={styles.heroEyebrow}>Farmer Profile</Text>
          <Text style={styles.heroTitle}>Manage your growing identity</Text>
          <Text style={styles.heroSubtitle}>
            Keep your account ready for monitoring crops, sensors, and automation from one place.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'HF'}</Text>
          </View>
          <View style={styles.profileTextBlock}>
            <Text style={styles.profileName}>{farmerName}</Text>
            <Text style={styles.profileRole}>Smart Hydroponic Farmer</Text>
            <Text style={styles.profileEmail}>{user?.email || 'No email available'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="sprout" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>Active</Text>
            <Text style={styles.statLabel}>Farm Status</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="water-outline" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>Tracked</Text>
            <Text style={styles.statLabel}>Hydro System</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <View style={styles.detailCard}>
            <ProfileRow icon="person-outline" label="Farmer Name" value={farmerName} />
            <ProfileRow icon="mail-outline" label="Email Address" value={user?.email || 'Unavailable'} />
            <ProfileRow icon="leaf-outline" label="Role" value="Protected farm operator" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Secure session control</Text>
            <Text style={styles.actionText}>
              Sign out when you are done to keep your farm controls and sensor data protected.
            </Text>
            <CustomButton title="Logout" loading={loggingOut} onPress={handleLogout} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F2',
  },
  scrollContent: {
    paddingBottom: 36,
  },
  hero: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#14532D',
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  heroEyebrow: {
    color: '#BBF7D0',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#DCFCE7',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: '92%',
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: -22,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  profileTextBlock: {
    flex: 1,
  },
  profileName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  profileRole: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  profileEmail: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    alignItems: 'flex-start',
  },
  statValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#166534',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowValue: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
  },
  actionTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  actionText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
});
