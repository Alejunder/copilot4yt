import axios from 'axios';

/**
 * Architecture note — same-origin proxy:
 * In production, all /api/* requests go to the same origin (this Vercel deployment).
 * Vercel's vercel.json rewrites them transparently to the backend service.
 * This makes all cookies first-party (same-site), bypassing Safari ITP entirely.
 *
 * In development, VITE_BASE_URL is set in .env.local to http://localhost:3000
 * so requests go directly to the local backend server.
 */
const api = axios.create({
  // Production → empty string = same-origin (Vercel proxy handles routing to backend)
  // Development → http://localhost:3000 (set via VITE_BASE_URL in .env.local)
  baseURL: import.meta.env.VITE_BASE_URL || '',
  withCredentials: true,
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