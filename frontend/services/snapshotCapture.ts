import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { API_BASE_URL } from './api';

export type SnapshotImageAsset = {
  uri: string;
  previewUri: string;
  name: string;
  mimeType: string;
  webFile?: File | null;
};

export async function captureBackendSnapshot(prefix: string): Promise<SnapshotImageAsset> {
  const filename = `${prefix}-${Date.now()}.jpg`;
  const snapshotUrl = `${API_BASE_URL}/api/snapshot?t=${Date.now()}`;

  if (Platform.OS === 'web') {
    const response = await fetch(snapshotUrl);
    if (!response.ok) {
      throw new Error('No live camera frame available.');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return {
      uri: objectUrl,
      previewUri: objectUrl,
      name: filename,
      mimeType: 'image/jpeg',
      webFile: new File([blob], filename, { type: 'image/jpeg' }),
    };
  }

  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) {
    throw new Error('Unable to access local storage for the camera snapshot.');
  }

  const result = await FileSystem.downloadAsync(snapshotUrl, `${baseDirectory}${filename}`);
  if (result.status !== 200) {
    throw new Error('No live camera frame available.');
  }

  const base64 = await FileSystem.readAsStringAsync(result.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    uri: result.uri,
    previewUri: `data:image/jpeg;base64,${base64}`,
    name: filename,
    mimeType: 'image/jpeg',
  };
}
