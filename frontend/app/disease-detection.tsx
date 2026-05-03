import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  LayoutChangeEvent,
  Image as RNImage,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/Colors';
import { API_BASE_URL } from '../services/api';
import { captureBackendSnapshot } from '../services/snapshotCapture';

const DEFAULT_BACKEND_URL = API_BASE_URL || 'http://localhost:8000';

// Box colors cycling for multiple detections
const BOX_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

type PickerImage = {
  uri: string;
  previewUri: string;
  name: string;
  mimeType: string;
  originalWidth: number;
  originalHeight: number;
  webFile?: any | null;
};

type Detection = {
  label: string;
  confidence: number;
  bbox: number[] | null;
};

type DetectionResponse = {
  detections: Detection[];
  image_id: string;
};

type ImageLayout = { width: number; height: number };

export default function DiseaseDetection() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<PickerImage | null>(null);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewLoadFailed, setPreviewLoadFailed] = useState(false);
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);

  const previewSubtitle = useMemo(() => {
    if (!selectedImage) return 'Select a plant image from the gallery or capture one using the camera.';
    return selectedImage.name;
  }, [selectedImage]);

  const sanitizeUrl = (value: string) => value.trim().replace(/\/$/, '');

  const formatPercent = (value?: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '0.0%';
    return `${(value * 100).toFixed(1)}%`;
  };

  const buildImagePayload = (asset: ImagePicker.ImagePickerAsset): PickerImage => ({
    uri: asset.uri,
    previewUri: asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri,
    name: asset.fileName || `plant-scan-${Date.now()}.jpg`,
    mimeType: asset.mimeType || 'image/jpeg',
    originalWidth: asset.width || 640,
    originalHeight: asset.height || 640,
    webFile: (asset as any).file ?? null,
  });

  const getImageDimensions = (uri: string) =>
    new Promise<{ width: number; height: number }>((resolve) => {
      RNImage.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        () => resolve({ width: 640, height: 640 })
      );
    });

  const handleGalleryPick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow gallery access to select an image.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      base64: true,
    });
    if (res.canceled || !res.assets?.length) return;
    setPreviewLoadFailed(false);
    setSelectedImage(buildImagePayload(res.assets[0]));
    setResult(null);
    setErrorMessage(null);
    setImageLayout(null);
  };

  const handleCameraCapture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to capture a plant image.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      base64: true,
    });
    if (res.canceled || !res.assets?.length) return;
    setPreviewLoadFailed(false);
    setSelectedImage(buildImagePayload(res.assets[0]));
    setResult(null);
    setErrorMessage(null);
    setImageLayout(null);
  };

  const handleCameraModeCapture = async () => {
    setIsCapturingSnapshot(true);
    setErrorMessage(null);

    try {
      const snapshot = await captureBackendSnapshot('plant-camera-mode');
      const dimensions = await getImageDimensions(snapshot.uri);

      setSelectedImage({
        ...snapshot,
        originalWidth: dimensions.width,
        originalHeight: dimensions.height,
      });
      setPreviewLoadFailed(false);
      setResult(null);
      setImageLayout(null);
    } catch {
      setErrorMessage('Unable to fetch a live camera snapshot right now. Please check the camera connection and try again.');
    } finally {
      setIsCapturingSnapshot(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('Image required', 'Please select or capture a plant image first.');
      return;
    }
    const normalizedUrl = sanitizeUrl(DEFAULT_BACKEND_URL);
    if (!normalizedUrl) {
      Alert.alert('Server unavailable', 'The backend server is not configured.');
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

      const response = await fetch(`${normalizedUrl}/api/detect-disease`, {
        method: 'POST',
        body: formData,
      });

      const rawText = await response.text();
      let payload: any = null;
      try { payload = rawText ? JSON.parse(rawText) : null; } catch { payload = null; }

      if (!response.ok) {
        throw new Error(payload?.detail || payload?.message || rawText || 'Detection failed.');
      }
      setResult(payload as DetectionResponse);
    } catch {
      setResult(null);
      setErrorMessage('Unable to analyze the image right now. Please check the backend connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setErrorMessage(null);
    setPreviewLoadFailed(false);
    setImageLayout(null);
  };

  const handleWrapperLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setImageLayout({ width, height });
  };

  // Scale a bbox [x1,y1,x2,y2] from original image coords to displayed image coords
  const scaleBbox = (bbox: number[]) => {
    if (!imageLayout || !selectedImage) return null;
    const scaleX = imageLayout.width / selectedImage.originalWidth;
    const scaleY = imageLayout.height / selectedImage.originalHeight;
    return {
      left: bbox[0] * scaleX,
      top: bbox[1] * scaleY,
      width: (bbox[2] - bbox[0]) * scaleX,
      height: (bbox[3] - bbox[1]) * scaleY,
    };
  };

  const hasDetections = (result?.detections?.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Bar */}
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

        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.pageTitle}>Disease Detection</Text>
            <Text style={styles.pageSubtitle}>AI-powered plant disease analysis using YOLOv11</Text>
          </View>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="shield-bug" size={30} color={Colors.primary} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Detect diseases instantly</Text>
            <Text style={styles.heroSubtitle}>
              Upload or capture a plant photo and our YOLO model will identify diseases with bounding box overlays.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
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

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleCameraModeCapture}
            activeOpacity={0.9}
            disabled={isCapturingSnapshot}
          >
            <View style={styles.actionIconCircle}>
              {isCapturingSnapshot ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Ionicons name="videocam-outline" size={26} color={Colors.primary} />
              )}
            </View>
            <Text style={styles.actionTitle}>Camera Mode</Text>
            <Text style={styles.actionCaption}>Use the live backend snapshot</Text>
          </TouchableOpacity>
        </View>

        {/* Preview / Result Image Card */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {result ? 'Detection Result' : 'Selected Image'}
              </Text>
              <Text style={styles.previewSubtitle}>{previewSubtitle}</Text>
            </View>
            {(selectedImage || result || errorMessage) && (
              <TouchableOpacity onPress={handleReset} style={styles.resetChip}>
                <Ionicons name="refresh" size={16} color={Colors.primary} />
                <Text style={styles.resetChipText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedImage ? (
            // Image with bounding box overlay
            <View style={styles.imageWrapper} onLayout={handleWrapperLayout}>
              {!previewLoadFailed ? (
                <ExpoImage
                  key={selectedImage.previewUri}
                  source={{ uri: selectedImage.previewUri }}
                  style={styles.previewImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  onError={() => setPreviewLoadFailed(true)}
                />
              ) : (
                <View style={styles.previewFallback}>
                  <MaterialCommunityIcons name="image-broken-variant" size={44} color="#94a3b8" />
                  <Text style={styles.previewFallbackTitle}>Preview unavailable</Text>
                  <Text style={styles.previewFallbackText}>The image was selected, but the phone could not render this file preview.</Text>
                </View>
              )}
              {/* Draw bounding boxes when result is available */}
              {result && imageLayout && result.detections.map((det, i) => {
                if (!det.bbox) return null;
                const scaled = scaleBbox(det.bbox);
                if (!scaled) return null;
                const color = BOX_COLORS[i % BOX_COLORS.length];
                return (
                  <View
                    key={i}
                    style={[
                      styles.bbox,
                      {
                        left: scaled.left,
                        top: scaled.top,
                        width: scaled.width,
                        height: scaled.height,
                        borderColor: color,
                      },
                    ]}
                  >
                    <View style={[styles.bboxLabel, { backgroundColor: color }]}>
                      <Text style={styles.bboxLabelText}>
                        {det.label.toUpperCase()} {formatPercent(det.confidence)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyPreview}>
              <MaterialCommunityIcons name="image-search-outline" size={52} color="#94a3b8" />
              <Text style={styles.emptyPreviewTitle}>No image selected yet</Text>
              <Text style={styles.emptyPreviewText}>Your picked or captured plant image will appear here.</Text>
            </View>
          )}
        </View>

        {/* Analyze Button */}
        <TouchableOpacity
          style={[styles.analyzeButton, (!selectedImage || isSubmitting) && styles.disabledButton]}
          disabled={!selectedImage || isSubmitting}
          onPress={handleAnalyze}
          activeOpacity={0.9}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#ffffff" />
              <Text style={styles.analyzeButtonText}>Scanning for diseases...</Text>
            </>
          ) : (
            <>
              <Ionicons name="scan-outline" size={20} color="#ffffff" />
              <Text style={styles.analyzeButtonText}>Detect Diseases</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Error */}
        {errorMessage && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#dc2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Detection Summary List */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTitle}>
                  {hasDetections ? `${result.detections.length} Disease${result.detections.length > 1 ? 's' : ''} Detected` : 'No Diseases Found'}
                </Text>
                <Text style={styles.resultSubtitle}>YOLOv11 detection results</Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: hasDetections ? '#fef2f2' : '#ecfdf5' }]}>
                <MaterialCommunityIcons
                  name={hasDetections ? 'virus' : 'shield-check'}
                  size={16}
                  color={hasDetections ? '#dc2626' : '#059669'}
                />
                <Text style={[styles.statusChipText, { color: hasDetections ? '#dc2626' : '#059669' }]}>
                  {hasDetections ? 'Alert' : 'Healthy'}
                </Text>
              </View>
            </View>

            {hasDetections ? (
              result.detections.map((det, i) => {
                const color = BOX_COLORS[i % BOX_COLORS.length];
                return (
                  <View key={i} style={styles.detectionItem}>
                    <View style={[styles.detectionColorBar, { backgroundColor: color }]} />
                    <View style={styles.detectionBody}>
                      <View style={styles.detectionTopRow}>
                        <Text style={styles.detectionLabel}>{det.label.toUpperCase()}</Text>
                        <Text style={[styles.detectionConfidence, { color }]}>
                          {formatPercent(det.confidence)}
                        </Text>
                      </View>
                      <View style={styles.detectionBottomRow}>
                        <View style={[styles.confidenceTrack]}>
                          <View style={[styles.confidenceFill, { width: `${Math.max(4, det.confidence * 100)}%` as any, backgroundColor: color }]} />
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.healthyCard}>
                <MaterialCommunityIcons name="check-circle" size={36} color="#059669" />
                <Text style={styles.healthyTitle}>Plant looks healthy!</Text>
                <Text style={styles.healthySubtitle}>No diseases were detected in the scanned image.</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtn} onPress={() => router.back()}>
            <Text style={styles.footerBtnText}>BACK</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 36 },
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
  headerTextWrap: { flex: 1 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  pageSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  heroCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#fed7aa',
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
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 17, fontWeight: '700', color: '#7c2d12', marginBottom: 6 },
  heroSubtitle: { fontSize: 13, lineHeight: 20, color: '#9a3412' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
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
    backgroundColor: '#fff7ed',
    marginBottom: 12,
  },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  actionCaption: { fontSize: 12, lineHeight: 18, color: '#64748b', marginTop: 4 },
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  previewSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff7ed',
  },
  resetChipText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  imageWrapper: {
    width: '100%',
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  previewFallbackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  previewFallbackText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  // Bounding box overlay
  bbox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 2,
  },
  bboxLabel: {
    position: 'absolute',
    top: -22,
    left: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bboxLabelText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
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
  emptyPreviewTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 12 },
  emptyPreviewText: { fontSize: 12, lineHeight: 18, color: '#64748b', marginTop: 6, textAlign: 'center' },
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
  disabledButton: { opacity: 0.55 },
  analyzeButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
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
  errorText: { flex: 1, color: '#9f1239', fontSize: 13, lineHeight: 19 },
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
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  resultSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusChipText: { fontWeight: '700', fontSize: 12 },
  // Detection list items
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detectionColorBar: {
    width: 5,
  },
  detectionBody: {
    flex: 1,
    padding: 12,
  },
  detectionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 0.5,
  },
  detectionConfidence: {
    fontSize: 15,
    fontWeight: '800',
  },
  detectionBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 999,
  },
  healthyCard: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  healthyTitle: { fontSize: 18, fontWeight: '700', color: '#14532d', marginTop: 10 },
  healthySubtitle: { fontSize: 13, color: '#166534', marginTop: 6, textAlign: 'center' },
  footer: { flexDirection: 'row', gap: 12 },
  footerBtn: {
    flex: 1,
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  footerBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
});
