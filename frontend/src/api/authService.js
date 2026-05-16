import axios from 'axios';
import api from './axiosConfig';

// Rutas consistentes con el proxy de vite.config.js y el backend
const AUTH_URL = '/api/v1/auth'; 

export const login = async (username, password) => {
    try {
        // Usamos axios directamente o api, pero con la ruta correcta /api/v1/auth
        const response = await axios.post(`${AUTH_URL}/login`, { username, password });
        return response.data; 
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error de conexión");
    }
};

export const getMisOpciones = async () => {
    try {
        const response = await api.get(`${AUTH_URL}/mis-opciones`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error al obtener opciones");
    }
};