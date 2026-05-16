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

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_ORIGIN;
