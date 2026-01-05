import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, setAuthToken } from './api';

const TOKEN_KEY = 'hydro_grow_token';
const USER_KEY = 'hydro_grow_user';

export const authService = {
  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token, user } = response.data;

      // Save token and user data
      await AsyncStorage.setItem(TOKEN_KEY, access_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      // Set token for future requests
      setAuthToken(access_token);

      return { token: access_token, user };
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  register: async (email: string, password: string, fullname?: string) => {
    try {
      const response = await authAPI.register(email, password, fullname);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get stored token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Get stored user
  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setAuthToken(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    const token = await authService.getToken();
    return !!token;
  },

  // Initialize auth (restore token on app start)
  initialize: async () => {
    const token = await authService.getToken();
    if (token) {
      setAuthToken(token);
    }
  },
};

export default authService;
