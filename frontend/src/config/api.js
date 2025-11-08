import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Force token refresh to ensure it's valid
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      // Don't block the request if token fetch fails - let the server handle it
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors - redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, try to refresh
      const user = auth.currentUser;
      if (user) {
        try {
          await user.getIdToken(true); // Force refresh
        } catch (refreshError) {
          // If refresh fails, user needs to sign in again
          console.error('Token refresh failed:', refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

