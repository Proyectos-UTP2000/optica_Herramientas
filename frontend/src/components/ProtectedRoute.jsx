import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, opciones = [], loading }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();
    
    // 1. Si no hay token, al login
    if (!token) {
        return <Navigate to="/login" />;
    }

    // 2. Si estamos cargando los permisos, podemos mostrar un splash o nada
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
                <p>Cargando permisos...</p>
            </div>
        );
    }

    // 3. Validar si la ruta actual está permitida
    // El dashboard principal (/) siempre está permitido
    if (location.pathname === '/') {
        return children;
    }

    // Verificar si el path actual coincide con alguna opción (ignorando la barra inicial si es necesario)
    const hasAccess = opciones.some(op => {
        const rutaLimpia = op.ruta.startsWith('/') ? op.ruta : `/${op.ruta}`;
        return location.pathname === rutaLimpia || location.pathname.startsWith(`${rutaLimpia}/`);
    });

    if (!hasAccess) {
        console.warn(`Acceso denegado a: ${location.pathname}`);
        return <Navigate to="/" />; // Redirigir al dashboard si no tiene permiso
    }
    
    return children;
};

export default ProtectedRoute;