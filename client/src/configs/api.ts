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
  // In production, ALWAYS use '' (same-origin) so the Vercel rewrite proxy is used.
  // This ignores any VITE_BASE_URL env var that might still be set in Vercel's dashboard,
  // which would otherwise bypass the proxy and break SameSite=Lax cookies on mobile.
  // In development, use VITE_BASE_URL if set, otherwise '' to use the Vite proxy.
  baseURL: import.meta.env.PROD ? '' : (import.meta.env.VITE_BASE_URL || ''),
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