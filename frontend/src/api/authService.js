import axios from "axios";
import api from "./axiosConfig";

// Rutas consistentes con el proxy de vite.config.js y el backend
const AUTH_URL = "/api/v1/auth";

export const login = async (username, password) => {
  // Usamos axios directamente o api, pero con la ruta correcta /api/v1/auth
  const response = await axios.post(`${AUTH_URL}/login`, {
    username,
    password,
  });
  return response.data;
};

export const getMisOpciones = async () => {
  const response = await api.get(`${AUTH_URL}/mis-opciones`);
  return response.data;
};
