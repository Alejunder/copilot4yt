import axios from 'axios';

/**
 * Auth strategy: JWT stored in localStorage, sent as Authorization: Bearer <token>.
 * This completely bypasses all cookie/SameSite/ITP/proxy issues on iOS Safari and
 * any other browser. The Authorization header is forwarded transparently by Vercel's
 * rewrite proxy, unlike Set-Cookie/Cookie headers which can be stripped.
 *
 * baseURL is '' in production (same-origin, Vercel rewrite handles routing to backend).
 * In development, the Vite proxy handles /api/* → http://localhost:3000.
 */
const api = axios.create({
  baseURL: import.meta.env.PROD ? '' : (import.meta.env.VITE_BASE_URL || ''),
  withCredentials: false,  // No cookies needed — auth is via Authorization header
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — clear it and notify AuthContext
      if (!error.config?.url?.includes('/api/auth/verify')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('auth-error', {
          detail: { message: error.response?.data?.message || 'Session expired' }
        }));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
