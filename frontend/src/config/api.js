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
        try {
          // Don't force refresh - use cached token if available
          // Only refresh if token is expired or about to expire
          const token = await user.getIdToken(false);
          config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          // If getting token fails (e.g., quota exceeded), try to use cached token
          if (error.code === 'auth/quota-exceeded') {
            console.warn('Firebase quota exceeded, using cached token if available');
            // Try to get token without refresh
            try {
              const cachedToken = await user.getIdToken(false);
              if (cachedToken) {
                config.headers.Authorization = `Bearer ${cachedToken}`;
              }
            } catch (cachedError) {
              console.warn('Could not get cached token either:', cachedError.message);
              // Continue without token - backend will return 401 if auth is required
            }
          } else {
            console.error('Error getting auth token:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in auth interceptor:', error);
      // Don't block the request if token fetch fails - let the server handle it
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors - try to refresh token if possible
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, try to refresh (but don't force if quota exceeded)
      const user = auth.currentUser;
      if (user) {
        try {
          // Try to get fresh token without forcing refresh first
          let token = await user.getIdToken(false);
          
          // Check if we should retry the request
          if (token) {
            error.config.headers.Authorization = `Bearer ${token}`;
            // Retry the request with the token
            return api.request(error.config);
          }
        } catch (tokenError) {
          if (tokenError.code === 'auth/quota-exceeded') {
            console.warn('Firebase quota exceeded, cannot refresh token');
            // Don't redirect - user might still have a valid session
            // Just return the error
            return Promise.reject(error);
          }
          
          // Try force refresh as last resort (only if not quota error)
          try {
            const token = await user.getIdToken(true);
            error.config.headers.Authorization = `Bearer ${token}`;
            return api.request(error.config);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Only redirect if it's a real auth error, not quota
            if (refreshError.code !== 'auth/quota-exceeded') {
              // Redirect to login if refresh fails
              window.location.href = '/login';
            }
          }
        }
      } else {
        // No user, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

