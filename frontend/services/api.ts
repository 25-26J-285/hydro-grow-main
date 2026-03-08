import axios from 'axios';

// Create axios instance with FastAPI backend URL
// localhost when testing from browser on same machine
// Use your LAN IP (e.g. http://192.168.x.x:8000) for real phone on WiFi
// Use http://10.0.2.2:8000 for Android emulator
export const API_BASE_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
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
