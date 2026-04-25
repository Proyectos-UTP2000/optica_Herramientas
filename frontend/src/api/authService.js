import axios from 'axios';

// Usamos la ruta simplificada gracias al proxy de vite.config.js
// Esto evita errores de CORS y facilita el trabajo en equipo
const API_URL = '/api/v1/auth'; 

export const login = async (username, password) => {
    try {
        // Enviamos username y password como espera el backend en Java
        const response = await axios.post(`${API_URL}/login`, { username, password });
        
        // Retornamos la respuesta (que debería traer el token y el rol)
        return response.data; 
    } catch (error) {
        // Si el backend responde con un error (ej: 401 Unauthorized), lo capturamos aquí
        throw error.response ? error.response.data : new Error("Error de conexión");
    }
};