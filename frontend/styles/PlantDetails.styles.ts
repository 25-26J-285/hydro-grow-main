import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  logoIcon: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    padding: 4,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },

  /* Toggle */
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    marginBottom: 20,
    alignSelf: 'center',
    width: 200,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    elevation: 1,
  },
  toggleText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#374151',
    fontWeight: '600',
  },

   /* Cards */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },

  cameraPlaceholder: {
    height: 140,
    backgroundColor: '#4B5563',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  liveViewText: {
    color: '#fff',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
  },

  /* Disease */
  diseaseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diseaseIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#4B5563',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  diseaseSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  shieldIcon: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
  },
});

export default styles;