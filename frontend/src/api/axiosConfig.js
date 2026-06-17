import axios from "axios";
import { mostrarAlerta } from "../utils/alerts";

const api = axios.create({
  baseURL: "",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globales de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expirado o inválido -> Logout forzado
        localStorage.clear();
        window.location.href = "/login";
      } else if (status === 403) {
        // Sin permisos para la acción -> Alerta y mantener sesión
        mostrarAlerta(
          "Acceso Denegado",
          data.message || "No tienes permisos para realizar esta acción.",
          "error",
        );
      }
    }
    return Promise.reject(error);
  },
);

export default api;
