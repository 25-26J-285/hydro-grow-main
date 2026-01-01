import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { PlantCard } from '../../components/PlantCard';
import { authAPI } from '../../services/api';

interface Item {
  id: number;
  name: string;
  status: string;
  ph: number;
}

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getItems();
      setItems(response.data.items || []);
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Failed to load plants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlant = () => {
    Alert.alert('Coming Soon', 'Add new plant feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>HydroGrow</Text>
          <Text style={styles.subtitle}>Dashboard</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadItems}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Add Button Area */}
          <TouchableOpacity
            style={styles.addCard}
            onPress={handleAddPlant}
          >
            <Text style={styles.addText}>Add</Text>
            <Ionicons name="add-circle-outline" size={32} color="black" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Current Plants</Text>

          {/* Plant Cards */}
          {items.length > 0 ? (
            items.map((item) => (
              <PlantCard
                key={item.id}
                plantName={item.name}
                shelf={`Shelf 0${item.id}`}
                day={5}
                progress={52}
                status={item.status}
                onPress={() => Alert.alert(item.name, `pH Level: ${item.ph}`)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="leaf-outline"
                size={64}
                color={Colors.gray}
                style={{ marginBottom: 16 }}
              />
              <Text style={styles.emptyText}>No plants yet</Text>
              <Text style={styles.emptySubText}>
                Add your first hydroponic plant to get started
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCard: {
    backgroundColor: Colors.lightGray,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
});
