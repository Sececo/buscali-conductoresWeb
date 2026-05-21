import axios from 'axios';

function normalizeOrigin(url: string | undefined): string {
  const trimmed = (url ?? '').trim().replace(/\/$/, '');
  return trimmed || 'http://localhost:3000';
}

/**
 * Origen del backend (sin barra final).
 * Si no defines VITE_API_URL, se usa http://localhost:3000 (PORT por defecto del backend).
 */
export const API_ORIGIN = normalizeOrigin(import.meta.env.VITE_API_URL);

function getStoredAuthToken(): string | null {
  return (
    localStorage.getItem('authToken') ?? sessionStorage.getItem('authToken')
  );
}

function attachAuthHeader(config: import('axios').InternalAxiosRequestConfig) {
  const token = getStoredAuthToken();
  if (token && token !== 'cookie-session') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_ORIGIN;
axios.interceptors.request.use(attachAuthHeader);
