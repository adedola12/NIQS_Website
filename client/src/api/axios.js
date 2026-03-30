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

export default API;
