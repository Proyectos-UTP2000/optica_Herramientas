import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Para saber qué menú resaltar
    const username = localStorage.getItem('username');
    const rol = localStorage.getItem('rol');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Estilos para reutilizar
    const styles = {
        sidebar: {
            width: '260px',
            background: '#1e293b', // Azul oscuro elegante
            color: 'white',
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100vh',
            boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
        },
        logoContainer: {
            padding: '30px 20px',
            textAlign: 'center',
            borderBottom: '1px solid #334155'
        },
        logoText: {
            fontSize: '24px',
            fontWeight: '800',
            letterSpacing: '2px',
            color: '#3b82f6',
            margin: 0
        },
        nav: {
            flex: 1,
            padding: '20px 10px'
        },
        navLink: (isActive) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            color: isActive ? '#fff' : '#94a3b8',
            textDecoration: 'none',
            borderRadius: '8px',
            marginBottom: '8px',
            backgroundColor: isActive ? '#3b82f6' : 'transparent',
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '600' : '400'
        }),
        header: {
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '15px 30px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 10
        },
        logoutBtn: {
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            marginLeft: '20px',
            fontSize: '13px'
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Sidebar Fijo */}
            <aside style={styles.sidebar}>
                <div style={styles.logoContainer}>
                    <h2 style={styles.logoText}>SISTEMA GESTION DE ÓPTICA</h2>
                </div>
                
                <nav style={styles.nav}>
                    <Link to="/dashboard" style={styles.navLink(location.pathname === '/dashboard')}>
                        <span style={{ marginRight: '10px' }}>🏠</span> Dashboard
                    </Link>
                    
                    <Link to="/dashboard/clientes" style={styles.navLink(location.pathname === '/dashboard/clientes')}>
                        <span style={{ marginRight: '10px' }}>👥</span> Clientes
                    </Link>
                    
                    {rol === 'ADMINISTRADOR' && (
                        <Link to="/dashboard/empleados" style={styles.navLink(location.pathname === '/dashboard/empleados')}>
                            <span style={{ marginRight: '10px' }}>👤</span> Empleados
                        </Link>
                    )}
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Dinámico */}
            <main style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
                <header style={styles.header}>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                        Usuario: <strong style={{ color: '#1e293b' }}>{username}</strong> | 
                        Rol: <span style={{ 
                            marginLeft: '5px', 
                            padding: '3px 8px', 
                            background: '#dcfce7', 
                            color: '#166534', 
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}>{rol}</span>
                    </div>
                </header>
                
                <section style={{ padding: '30px' }}>
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default MainLayout;