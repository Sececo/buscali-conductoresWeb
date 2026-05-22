import axios from 'axios';

function normalizeOrigin(url: string | undefined): string {
  let trimmed = (url ?? '').trim().replace(/\/$/, '');
  // Evita /api/v1/api/v1 si en .env pusieron la URL con prefijo duplicado
  trimmed = trimmed.replace(/\/api\/v1$/i, '');
  return trimmed || 'http://localhost:3000';
}

/**
 * Origen del backend (host, sin /api/v1).
 * Con VITE_USE_PROXY=true las peticiones van al mismo host (proxy Vite → backend).
 */
const useProxy = import.meta.env.VITE_USE_PROXY === 'true';
export const API_ORIGIN = useProxy
  ? ''
  : normalizeOrigin(import.meta.env.VITE_API_URL);

/** Prefijo global de la API; todos los endpoints son relativos a esto. */
export const API_BASE = useProxy ? '/api/v1' : `${API_ORIGIN}/api/v1`;

/** Rutas bajo /api/v1/conductores */
export const API_CONDUCTORES = {
  base: '/conductores',
  login: '/conductores/login',
  logout: '/conductores/logout',
  forgotPassword: '/conductores/forgot-password',
  resetPassword: '/conductores/reset-password',
  resetPasswordValidate: (token: string) =>
    `/conductores/reset-password/validate/${encodeURIComponent(token)}`,
} as const;

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
axios.defaults.baseURL = API_BASE;
axios.interceptors.request.use(attachAuthHeader);
