import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/Colors';

const DEFAULT_BACKEND_URL = 'http://localhost:8000';

type PickerImage = {
  uri: string;
  name: string;
  mimeType: string;
  webFile?: any | null;
};

type PredictionResponse = {
  rice_type: string;
  rice_type_confidence: number;
  rice_quality: string;
  rice_quality_confidence: number;
  top_type_predictions: Array<{
    name: string;
    confidence: number;
  }>;
  quality_probabilities: Record<string, number>;
};

export default function SeedIdentification() {
  const router = useRouter();
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [selectedImage, setSelectedImage] = useState<PickerImage | null>(null);
  const [analysis, setAnalysis] = useState<PredictionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewSubtitle = useMemo(() => {
    if (!selectedImage) {
      return 'Select a rice image from the gallery or capture one using the camera.';
    }

    return selectedImage.name;
  }, [selectedImage]);

  const sanitizeUrl = (value: string) => value.trim().replace(/\/$/, '');

  const formatPercent = (value?: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '0.0%';
    }
    return `${(value * 100).toFixed(1)}%`;
  };

  const buildImagePayload = (asset: ImagePicker.ImagePickerAsset): PickerImage => ({
  uri: asset.uri,
  name: asset.fileName || `rice-scan-${Date.now()}.jpg`,
  mimeType: asset.mimeType || 'image/jpeg',
  webFile: (asset as any).file ?? null,
});

  const handleGalleryPick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow gallery access to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setSelectedImage(buildImagePayload(result.assets[0]));
    setAnalysis(null);
    setErrorMessage(null);
  };

  const handleCameraCapture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to capture a plant image.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setSelectedImage(buildImagePayload(result.assets[0]));
    setAnalysis(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('Image required', 'Please select or capture a rice image first.');
      return;
    }

    const normalizedUrl = sanitizeUrl(backendUrl);
    if (!normalizedUrl) {
      Alert.alert('Backend URL required', 'Please enter your backend server URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();

if (Platform.OS === 'web') {
  if (selectedImage.webFile) {
    formData.append('file', selectedImage.webFile, selectedImage.name);
  } else {
    const blobResponse = await fetch(selectedImage.uri);
    const blob = await blobResponse.blob();
    formData.append('file', blob, selectedImage.name);
  }
} else {
  formData.append('file', {
    uri: selectedImage.uri,
    name: selectedImage.name,
    type: selectedImage.mimeType,
  } as any);
}

const response = await fetch(`${normalizedUrl}/api/predict-rice`, {
  method: 'POST',
  body: formData,
});

      const rawText = await response.text();
      let payload: any = null;

      try {
        payload = rawText ? JSON.parse(rawText) : null;
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const detail =
          payload?.detail ||
          payload?.message ||
          rawText ||
          'Prediction failed. Please verify the backend URL and try again.';
        throw new Error(detail);
      }

      setAnalysis(payload as PredictionResponse);
    } catch (error: any) {
      const message = error?.message || 'Unable to analyze the selected image.';
      setAnalysis(null);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setErrorMessage(null);
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/sensors-check');
  };

  const qualityEntries = analysis ? Object.entries(analysis.quality_probabilities || {}) : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="sprout" size={20} color="white" />
          </View>
          <Text style={styles.appName}>HydroGrow</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.pageTitle}>Seed Identification</Text>
            <Text style={styles.pageSubtitle}>Advanced rice image analysis for farmers</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="leaf-circle" size={30} color={Colors.primary} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Capture, scan and review instantly</Text>
            <Text style={styles.heroSubtitle}>
              Use the camera or gallery, send the image to your backend, and review the rice type and quality prediction in one screen.
            </Text>
          </View>
        </View>

        <View style={styles.configCard}>
          <Text style={styles.configLabel}>Backend URL</Text>
          <TextInput
            value={backendUrl}
            onChangeText={setBackendUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://10.0.2.2:8000"
            style={styles.urlInput}
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.helperText}>
            Emulator: 10.0.2.2 | Real phone: use your computer&apos;s local IP address.
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard} onPress={handleGalleryPick} activeOpacity={0.9}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="images-outline" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Gallery</Text>
            <Text style={styles.actionCaption}>Select an existing image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleCameraCapture} activeOpacity={0.9}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="camera-outline" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Camera</Text>
            <Text style={styles.actionCaption}>Capture a fresh image</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.sectionTitle}>Selected Image</Text>
              <Text style={styles.previewSubtitle}>{previewSubtitle}</Text>
            </View>
            {selectedImage || analysis || errorMessage ? (
              <TouchableOpacity onPress={handleReset} style={styles.resetChip}>
                <Ionicons name="refresh" size={16} color={Colors.primary} />
                <Text style={styles.resetChipText}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {selectedImage ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.emptyPreview}>
              <MaterialCommunityIcons name="image-search-outline" size={52} color="#94a3b8" />
              <Text style={styles.emptyPreviewTitle}>No image selected yet</Text>
              <Text style={styles.emptyPreviewText}>Your picked or captured rice image will appear here.</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, (!selectedImage || isSubmitting) && styles.disabledButton]}
          disabled={!selectedImage || isSubmitting}
          onPress={handleAnalyze}
          activeOpacity={0.9}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#ffffff" />
              <Text style={styles.analyzeButtonText}>Analyzing image...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={20} color="#ffffff" />
              <Text style={styles.analyzeButtonText}>Analyze Rice Image</Text>
            </>
          )}
        </TouchableOpacity>

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color={Colors.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {analysis ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTitle}>Prediction Result</Text>
                <Text style={styles.resultSubtitle}>Live response from your FastAPI backend</Text>
              </View>
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveChipText}>Connected</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryBoxPrimary}>
                <Text style={styles.summaryLabelLight}>Rice Type</Text>
                <Text style={styles.summaryValueLight}>{analysis.rice_type}</Text>
                <Text style={styles.summaryMetaLight}>{formatPercent(analysis.rice_type_confidence)} confidence</Text>
              </View>
              <View style={styles.summaryBoxSecondary}>
                <Text style={styles.summaryLabelDark}>Quality</Text>
                <Text style={styles.summaryValueDark}>{analysis.rice_quality}</Text>
                <Text style={styles.summaryMetaDark}>{formatPercent(analysis.rice_quality_confidence)} confidence</Text>
              </View>
            </View>

            <View style={styles.blockCard}>
              <Text style={styles.blockTitle}>Top Type Predictions</Text>
              {analysis.top_type_predictions?.map((item, index) => (
                <View key={`${item.name}-${index}`} style={styles.predictionRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.predictionName}>{item.name}</Text>
                  <Text style={styles.predictionValue}>{formatPercent(item.confidence)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.blockCard}>
              <Text style={styles.blockTitle}>Quality Breakdown</Text>
              {qualityEntries.map(([label, value]) => (
                <View key={label} style={styles.barGroup}>
                  <View style={styles.barHeader}>
                    <Text style={styles.barLabel}>{label}</Text>
                    <Text style={styles.barValue}>{formatPercent(value)}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.max(4, Math.min(100, value * 100))}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtnBack} onPress={handleBack}>
            <Text style={styles.footerBtnText}>BACK</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerBtnNext} onPress={handleNext}>
            <Text style={styles.footerBtnText}>NEXT</Text>
            <Ionicons name="arrow-forward-circle-outline" size={24} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTextWrap: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginRight: 14,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#064e3b',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#166534',
  },
  configCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#dbe4ee',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  actionCaption: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
    marginTop: 4,
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  previewSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ecfdf5',
  },
  resetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
  },
  emptyPreview: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    paddingHorizontal: 18,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  emptyPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptyPreviewText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  disabledButton: {
    opacity: 0.55,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorCard: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  errorText: {
    flex: 1,
    color: '#9f1239',
    fontSize: 13,
    lineHeight: 19,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveChipText: {
    color: '#047857',
    fontWeight: '700',
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryBoxPrimary: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    backgroundColor: Colors.primary,
  },
  summaryBoxSecondary: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbe4ee',
  },
  summaryLabelLight: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValueLight: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 10,
  },
  summaryMetaLight: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 6,
  },
  summaryLabelDark: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValueDark: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
  },
  summaryMetaDark: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  blockCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankBadgeText: {
    color: '#166534',
    fontWeight: '800',
    fontSize: 12,
  },
  predictionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  predictionValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  barGroup: {
    marginBottom: 12,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  barTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  footerBtnBack: {
    flex: 1,
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  footerBtnNext: {
    flex: 1,
    backgroundColor: '#0f766e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
  },
  footerBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
