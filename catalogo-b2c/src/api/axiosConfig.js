import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Interceptor to inject bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token_cliente");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
