import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { actuatorAPI } from '../services/api';

export default function Controls() {
  const [waterPumpOn, setWaterPumpOn] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  //molinda controls screen

  useEffect(() => {
    actuatorAPI.getStatus().then((res) => {
      const data = res.data;
      setWaterPumpOn(data.pump === 'ON');
      setLightsOn(data.led_strip === 'ON');
      setFanOn(data.fan === 'ON');
    }).catch(() => {});
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handlePumpToggle = async (value: boolean) => {
    setWaterPumpOn(value);
    try {
      const res = await actuatorAPI.controlPump(value ? 'ON' : 'OFF');
      showFeedback(res.data.success ? `Pump ${value ? 'ON' : 'OFF'}` : 'Device not connected');
    } catch {
      showFeedback('Server unreachable');
    }
  };

  const handleLightsToggle = async (value: boolean) => {
    setLightsOn(value);
    try {
      const res = await actuatorAPI.controlLED(value ? 'ON' : 'OFF');
      showFeedback(res.data.success ? `Lights ${value ? 'ON' : 'OFF'}` : 'Device not connected');
    } catch {
      showFeedback('Server unreachable');
    }
  };

  const handleFanToggle = async (value: boolean) => {
    setFanOn(value);
    try {
      const res = await actuatorAPI.controlFan(value ? 'ON' : 'OFF');
      showFeedback(res.data.success ? `Fan ${value ? 'ON' : 'OFF'}` : 'Device not connected');
    } catch {
      showFeedback('Server unreachable');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Controls</Text>
      </View>

      {feedback && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Water Management Section */}
        <View style={styles.section}>
          <View style={styles.waterManagementHeader}>
            <Text style={styles.sectionTitle}>Water Management</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Running</Text>
            </View>
          </View>

          {/* Water Pump */}
          <View style={styles.controlItem}>
            <Text style={styles.controlLabel}>Water Pump</Text>
            <Switch
              value={waterPumpOn}
              onValueChange={handlePumpToggle}
              trackColor={{ false: '#e0e0e0', true: '#81c784' }}
              thumbColor={waterPumpOn ? Colors.primary : '#f4f3f4'}
            />
          </View>

          {/* Lights */}
          <View style={styles.controlItem}>
            <Text style={styles.controlLabel}>Lights</Text>
            <Switch
              value={lightsOn}
              onValueChange={handleLightsToggle}
              trackColor={{ false: '#e0e0e0', true: '#81c784' }}
              thumbColor={lightsOn ? Colors.primary : '#f4f3f4'}
            />
          </View>

          {/* Fan */}
          <View style={styles.controlItem}>
            <Text style={styles.controlLabel}>Fan</Text>
            <Switch
              value={fanOn}
              onValueChange={handleFanToggle}
              trackColor={{ false: '#e0e0e0', true: '#81c784' }}
              thumbColor={fanOn ? Colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  feedbackBanner: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  waterManagementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  controlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  controlLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});

