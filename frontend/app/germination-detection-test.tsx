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

type GerminationDetectionResult = {
  image_id: string;
  germination_detected: boolean;
  confidence: number;
  detected_objects: Array<{
    class_id: number;
    class_name: string;
    confidence: number;
    bbox: [number, number, number, number];
  }>;
  stage?: string;
  message: string;
};

export default function GerminationDetectionTest() {
  const router = useRouter();
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [selectedImage, setSelectedImage] = useState<PickerImage | null>(null);
  const [analysis, setAnalysis] = useState<GerminationDetectionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewSubtitle = useMemo(() => {
    if (!selectedImage) {
      return 'Select a seed/seedling image from the gallery or capture one using the camera.';
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
    name: asset.fileName || `germination-scan-${Date.now()}.jpg`,
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
      Alert.alert('Image required', 'Please select or capture a seed/seedling image first.');
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

      const response = await fetch(`${normalizedUrl}/api/detect-germination/mobile-camera`, {
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
          'Detection failed. Please verify the backend URL and try again.';
        throw new Error(detail);
      }

      setAnalysis(payload as GerminationDetectionResult);
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
            <Text style={styles.pageTitle}>Germination Detection</Text>
            <Text style={styles.pageSubtitle}>AI-powered seed & seedling analysis</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="seed" size={30} color={Colors.primary} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Scan & analyze germination</Text>
            <Text style={styles.heroSubtitle}>
              Capture seed images, send to your backend, and instantly see germination stage and detection confidence.
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
            Emulator: 10.0.2.2 | Real phone: use your computer's local IP address.
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
              <Text style={styles.emptyPreviewText}>Your picked or captured seed image will appear here.</Text>
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
              <Text style={styles.analyzeButtonText}>Analyze Germination</Text>
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
                <Text style={styles.resultTitle}>Detection Result</Text>
                <Text style={styles.resultSubtitle}>Live response from your FastAPI backend</Text>
              </View>
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveChipText}>Connected</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryBoxPrimary, {
                backgroundColor: analysis.germination_detected ? '#ecfdf5' : '#fee2e2'
              }]}>
                <Text style={styles.summaryLabelLight}>Detection Status</Text>
                <Text style={[styles.summaryValueLight, {
                  color: analysis.germination_detected ? '#065f46' : '#991b1b'
                }]}>
                  {analysis.germination_detected ? 'GERMINATED' : 'NOT DETECTED'}
                </Text>
                <Text style={styles.summaryMetaLight}>{formatPercent(analysis.confidence)} confidence</Text>
              </View>
              {analysis.stage && (
                <View style={styles.summaryBoxSecondary}>
                  <Text style={styles.summaryLabelDark}>Stage</Text>
                  <Text style={styles.summaryValueDark}>{analysis.stage}</Text>
                  <Text style={styles.summaryMetaDark}>Current growth stage</Text>
                </View>
              )}
            </View>

            {analysis.detected_objects && analysis.detected_objects.length > 0 && (
              <View style={styles.blockCard}>
                <Text style={styles.blockTitle}>Detected Objects ({analysis.detected_objects.length})</Text>
                {analysis.detected_objects.map((obj, index) => (
                  <View key={`${obj.class_name}-${index}`} style={styles.predictionRow}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankBadgeText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.predictionName}>{obj.class_name}</Text>
                    <Text style={styles.predictionValue}>{formatPercent(obj.confidence)}</Text>
                  </View>
                ))}
              </View>
            )}

            {analysis.message && (
              <View style={styles.messageCard}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.messageText}>{analysis.message}</Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtnBack} onPress={handleBack}>
            <Text style={styles.footerBtnText}>BACK</Text>
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
    color: '#047857',
  },
  configCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionCaption: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
  },
  resetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  emptyPreview: {
    height: 240,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 10,
  },
  emptyPreviewText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 18,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ecfdf5',
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryBoxPrimary: {
    flex: 1,
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  summaryBoxSecondary: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  summaryLabelLight: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  summaryLabelDark: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  summaryValueLight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
    marginVertical: 6,
  },
  summaryValueDark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
    marginVertical: 6,
  },
  summaryMetaLight: {
    fontSize: 11,
    color: '#047857',
  },
  summaryMetaDark: {
    fontSize: 11,
    color: '#15803d',
  },
  blockCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  predictionName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
  },
  predictionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  messageText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  footerBtnBack: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
