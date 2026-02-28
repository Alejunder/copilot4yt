import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
  withCredentials: true,
  // iOS Safari compatibility: Ensure proper headers
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, the session is invalid
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || 'Session expired';
      
      // Only show the error if it's not a verify endpoint
      // (verify is used to check session status, so 401 is expected when logged out)
      if (!error.config?.url?.includes('/api/auth/verify')) {
        console.error('Authentication error:', errorMessage);
        
        // Dispatch custom event that AuthContext can listen to
        window.dispatchEvent(new CustomEvent('auth-error', { 
          detail: { message: errorMessage } 
        }));
      }
    }
    return Promise.reject(error);
  }
);

export default api;