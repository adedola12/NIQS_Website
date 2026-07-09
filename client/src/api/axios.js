import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In dev, Vite's proxy forwards /api → localhost:5000, so we keep '/api'.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Retry idempotent GETs that fail with a network error or 5xx — the Render
   backend cold-starts after idle and early requests can fail while it wakes.
   Without this, every public page silently keeps its placeholder fallback. */
const RETRY_DELAYS = [2000, 6000];
API.interceptors.response.use(null, async (error) => {
  const config = error.config;
  const status = error.response?.status;
  const retriable = !error.response || (status >= 500 && status !== 501);
  if (!config || config.method !== 'get' || !retriable) throw error;
  config.__retryCount = config.__retryCount || 0;
  if (config.__retryCount >= RETRY_DELAYS.length) throw error;
  await new Promise((r) => setTimeout(r, RETRY_DELAYS[config.__retryCount]));
  config.__retryCount += 1;
  return API(config);
});

export default API;
