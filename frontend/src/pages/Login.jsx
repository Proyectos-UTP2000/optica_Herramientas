import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authService';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Estado para feedback visual
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await login(credentials.username, credentials.password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('rol', data.rol);
            navigate('/dashboard');
        } catch (err) {
            setError('Credenciales inválidas. Intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Estilos modernos en objetos
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5', // Fondo gris claro moderno
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        },
        card: {
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center'
        },
        title: {
            margin: '0 0 10px 0',
            color: '#1a73e8',
            fontSize: '28px',
            fontWeight: 'bold'
        },
        subtitle: {
            color: '#5f6368',
            marginBottom: '30px',
            fontSize: '14px'
        },
        inputGroup: {
            marginBottom: '20px',
            textAlign: 'left'
        },
        input: {
            width: '100%',
            padding: '12px 15px',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            fontSize: '16px',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border 0.3s'
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            marginTop: '10px'
        },
        errorMsg: {
            backgroundColor: '#fce8e6',
            color: '#d93025',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '20px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>SISTEMA GESTION DE ÓPTICA</h2>
                <p style={styles.subtitle}>Gestión de Usuarios y Clientes</p>
                
                {error && <div style={styles.errorMsg}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="Usuario" 
                            style={styles.input}
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Contraseña" 
                            style={styles.input}
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            ...styles.button,
                            backgroundColor: loading ? '#80b1f3' : '#1a73e8'
                        }}
                    >
                        {loading ? 'Cargando...' : 'Ingresar al Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;