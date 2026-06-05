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
    // El dashboard principal y la configuración de cuenta siempre están permitidos con sesión activa.
    if (location.pathname === '/' || location.pathname === '/configuracion') {
        return children;
    }

    // Verificar si el path actual coincide con alguna opción (ignorando /api/v1 de la DB)
    const hasAccess = opciones.some(op => {
        if (!op.ruta) return false;
        
        // Normalizar ruta de la DB: asegurar que empiece con / y quitar /api/v1
        let rutaDB = op.ruta.startsWith('/') ? op.ruta : `/${op.ruta}`;
        rutaDB = rutaDB.replace('/api/v1', '');
        if (rutaDB === '') rutaDB = '/';

        return location.pathname === rutaDB || location.pathname.startsWith(`${rutaDB}/`);
    });

    if (!hasAccess) {
        console.warn(`Acceso denegado a: ${location.pathname}`);
        return <Navigate to="/" />; // Redirigir al dashboard si no tiene permiso
    }
    
    return children;
};

export default ProtectedRoute;
