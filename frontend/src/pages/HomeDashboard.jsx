import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomeDashboard = () => {
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        totalClientes: 0,
        totalProductos: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Error cargando estadísticas:", error);
            }
        };
        fetchDashboardData();
    }, []);

    // Estilos constantes
    const styles = {
        container: {
            padding: '30px',
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        header: {
            marginBottom: '30px',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '15px'
        },
        title: {
            fontSize: '28px',
            color: '#1e293b',
            margin: 0,
            fontWeight: '600'
        },
        subtitle: {
            color: '#64748b',
            fontSize: '14px',
            marginTop: '5px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px',
            marginTop: '20px'
        },
        card: (color) => ({
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderLeft: `8px solid ${color}`,
            transition: 'transform 0.2s ease',
            cursor: 'default'
        }),
        iconCircle: (color) => ({
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: `${color}15`, // Color con 15% de opacidad
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: color
        }),
        cardData: {
            display: 'flex',
            flexDirection: 'column'
        },
        cardLabel: {
            fontSize: '13px',
            color: '#64748b',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        cardValue: {
            fontSize: '36px',
            fontWeight: '800',
            color: '#1e293b',
            marginTop: '5px'
        },
        tipBox: {
            marginTop: '40px',
            padding: '15px 25px',
            backgroundColor: '#eff6ff',
            borderRadius: '12px',
            borderLeft: '4px solid #3b82f6',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Dashboard</h2>
                <p style={styles.subtitle}></p>
            </div>
            
            <div style={styles.grid}>
                {/* Tarjeta de Usuarios */}
                <div style={styles.card('#3b82f6')}>
                    <div style={styles.cardData}>
                        <span style={styles.cardLabel}>Usuarios</span>
                        <span style={styles.cardValue}>{stats.totalUsuarios}</span>
                    </div>
                    <div style={styles.iconCircle('#3b82f6')}>👤</div>
                </div>

                {/* Tarjeta de Clientes */}
                <div style={styles.card('#10b981')}>
                    <div style={styles.cardData}>
                        <span style={styles.cardLabel}>Clientes</span>
                        <span style={styles.cardValue}>{stats.totalClientes}</span>
                    </div>
                    <div style={styles.iconCircle('#10b981')}>👥</div>
                </div>

                {/* Tarjeta de Productos */}
                <div style={styles.card('#f59e0b')}>
                    <div style={styles.cardData}>
                        <span style={styles.cardLabel}>Inventario</span>
                        <span style={styles.cardValue}>{stats.totalProductos}</span>
                    </div>
                    <div style={styles.iconCircle('#f59e0b')}>📦</div>
                </div>
            </div>

            <div style={styles.tipBox}>
                <span style={{ marginRight: '10px', fontSize: '20px' }}>💡</span>
                <span><strong>Estado del Sistema:</strong> Los datos se están sincronizando correctamente con la base de datos centralizada.</span>
            </div>
        </div>
    );
};

export default HomeDashboard;