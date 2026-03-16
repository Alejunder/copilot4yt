import axios from 'axios';
import { getLocale, translateBackendError } from '../utils/i18n';

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

// Request interceptor: attach JWT and Accept-Language to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Tell the server which language the user prefers so it can log/pick locale.
  // The server never returns translated text — it returns error codes — but the
  // header lets the backend attach locale context for logging and future use.
  config.headers['Accept-Language'] = getLocale();

  return config;
});

// Response interceptor: translate backend error codes and handle auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the API returned a machine-readable error code, translate it here so
    // every call-site can simply read `error.localizedMessage` without
    // needing to call translateBackendError() themselves.
    const errorCode: string | undefined = error.response?.data?.errorCode;
    if (errorCode) {
      error.localizedMessage = translateBackendError(errorCode);
    }

    if (error.response?.status === 401) {
      // Token is invalid or expired — clear it and notify AuthContext
      if (!error.config?.url?.includes('/api/auth/verify')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('auth-error', {
          detail: { message: error.localizedMessage || error.response?.data?.message || 'Session expired' }
        }));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
