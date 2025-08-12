/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;