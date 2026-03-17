import axios from 'axios';
import { getLocale, translateBackendError } from '../utils/i18n';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '' : (import.meta.env.VITE_BASE_URL || ''),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  config.headers['Accept-Language'] = getLocale();

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorCode: string | undefined = error.response?.data?.errorCode;
    if (errorCode) {
      error.localizedMessage = translateBackendError(errorCode);
    }

    if (error.response?.status === 401) {
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
