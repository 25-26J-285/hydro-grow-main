import axios from 'axios';

// Create axios instance with FastAPI backend URL
const API_BASE_URL = 'http://localhost:8000';

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

// Sensor API endpoints
export const sensorAPI = {
  getAllSensors: () => api.get('/api/sensors/all'),
  getTemperature: () => api.get('/api/sensor/temp'),
  getHumidity: () => api.get('/api/sensor/humidity'),
  getAirQuality: () => api.get('/api/sensor/air'),
  getLight: () => api.get('/api/sensor/light'),
  getDistance: () => api.get('/api/sensor/dist'),
  getPH: () => api.get('/api/sensor/ph'),
  getEnergy: () => api.get('/api/sensor/energy'),
};

// Actuator API endpoints
export const actuatorAPI = {
  getStatus: () => api.get('/api/actuators/status'),
  controlPump: (action: 'ON' | 'OFF') => 
    api.post(`/api/actuator/pump?action=${action}`),
  controlFan: (action: 'ON' | 'OFF') => 
    api.post(`/api/actuator/fan?action=${action}`),
  controlLED: (action: 'ON' | 'OFF' | 'SET_BRIGHTNESS', brightness?: number) => 
    api.post(`/api/actuator/led_strip?action=${action}${brightness ? `&brightness=${brightness}` : ''}`),
  controlRail: (action: 'MOVE_LEFT' | 'MOVE_RIGHT' | 'STOP') => 
    api.post(`/api/actuator/rail?action=${action}`),
};

// System API endpoints
export const systemAPI = {
  getHealth: () => api.get('/healthz'),
  getState: () => api.get('/api/state'),
  getDevicesStatus: () => api.get('/api/devices/status'),
  sendControlCommand: (command: any) => api.post('/api/control', command),
};

// Video feed URL
export const VIDEO_FEED_URL = `${API_BASE_URL}/video_feed`;

export default api;
