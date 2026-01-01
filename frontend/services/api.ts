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

export default api;
