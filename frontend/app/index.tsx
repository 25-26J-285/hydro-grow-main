import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

export default function Home() {
  const router = useRouter();

  const go = (path: string) => router.push(path as any);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="sprout" size={22} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.appName}>HydroGrow</Text>
              <Text style={styles.subtitle}>Hydroponic Monitoring & Smart Farming</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bell}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Farmer summary card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Farmer Dashboard</Text>
          <Text style={styles.heroText}>
            Manage crops, monitor sensors, and run AI-based seed classification from one place.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>24°C</Text>
              <Text style={styles.statLabel}>Temp</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>6.2</Text>
              <Text style={styles.statLabel}>pH</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>65%</Text>
              <Text style={styles.statLabel}>Humidity</Text>
            </View>
          </View>

          <Text style={styles.heroHint}>
            (These are demo values — you can connect real sensor values later.)
          </Text>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          <ActionCard
            title="Seed Identification"
            subtitle="AI classify rice type & quality"
            icon={<MaterialCommunityIcons name="image-search-outline" size={26} color={Colors.white} />}
            color={Colors.primary}
            onPress={() => go('/seed-identification')}
          />

          <ActionCard
            title="Sensors Check"
            subtitle="View water & environment"
            icon={<MaterialCommunityIcons name="chart-box-outline" size={26} color={Colors.white} />}
            color={Colors.secondary}
            onPress={() => go('/sensors-check')}
          />

          <ActionCard
            title="Plant Details"
            subtitle="Growth & disease info"
            icon={<MaterialCommunityIcons name="leaf-circle-outline" size={26} color={Colors.white} />}
            color="#16A34A"
            onPress={() => go('/plant-details')}
          />

          <ActionCard
            title="System Controls"
            subtitle="Pump, light, irrigation"
            icon={<MaterialCommunityIcons name="tune-variant" size={26} color={Colors.white} />}
            color="#0EA5E9"
            onPress={() => go('/controls')}
          />
        </View>

        {/* Help section */}
        <View style={styles.helpCard}>
          <View style={styles.helpIcon}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.helpTitle}>Tips for Best Results</Text>
            <Text style={styles.helpText}>
              Take photos in good lighting. Keep the rice sample centered and avoid blur.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          HydroGrow • Research Project • Smart Agriculture
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  color,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardIcon, { backgroundColor: color }]}>{icon}</View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },

  header: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appName: { fontSize: 18, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 12, color: Colors.gray, marginTop: 2 },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  heroText: { marginTop: 6, fontSize: 13, color: Colors.gray, lineHeight: 18 },
  heroStatsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  statValue: { fontSize: 16, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.gray, marginTop: 2 },
  heroHint: { marginTop: 10, fontSize: 11, color: Colors.gray },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  cardSub: { marginTop: 4, fontSize: 12, color: Colors.gray, lineHeight: 16 },

  helpCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  helpText: { marginTop: 4, fontSize: 12, color: Colors.gray, lineHeight: 16 },

  footerText: { marginTop: 18, textAlign: 'center', fontSize: 11, color: Colors.gray },
});