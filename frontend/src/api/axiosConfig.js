import axios from 'axios';

const api = axios.create({
  // Eliminamos la URL absoluta para que Vite use el proxy configurado en vite.config.js
  // Esto soluciona los problemas de CORS y las rutas duplicadas /api/api
  baseURL: '' 
});

// Este interceptor pega el token en cada petición automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;