import Constants from 'expo-constants';
import axios from 'axios';
import { Platform } from 'react-native';

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitUrl) {
    return normalizeBaseUrl(explicitUrl);
  }

  const expoGoDebuggerHost = (
    Constants.expoGoConfig as { debuggerHost?: string } | null
  )?.debuggerHost;

  const runtimeHost =
    Constants.expoConfig?.hostUri ??
    Constants.platform?.hostUri ??
    expoGoDebuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (runtimeHost) {
    const host = runtimeHost.split(':')[0];
    if (host) {
      return `http://${host}:8000`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
};

export const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Export common API endpoints
export const authAPI = {
  register: (email: string, password: string, fullname?: string) =>
    api.post('/api/register', { email, password, fullname }),
  login: (email: string, password: string) =>
    api.post('/api/login', { email, password }),
  getProfile: () => api.get('/api/me'),
  getItems: () => api.get('/api/items'),
};

export const sensorAPI = {
  getAll: () => api.get('/api/sensors/all'),
  getEnergy: () => api.get('/api/sensor/energy'),
  getDeviceStatus: () => api.get('/api/devices/status'),
};

export const actuatorAPI = {
  controlPump: (action: 'ON' | 'OFF') =>
    api.post(`/api/actuator/pump?action=${action}`),
  controlFan: (action: 'ON' | 'OFF') =>
    api.post(`/api/actuator/fan?action=${action}`),
  controlLED: (action: 'ON' | 'OFF' | 'SET_BRIGHTNESS', brightness?: number) =>
    api.post(`/api/actuator/led_strip?action=${action}${brightness !== undefined ? `&brightness=${brightness}` : ''}`),
  getStatus: () => api.get('/api/actuators/status'),
};

export default api;
