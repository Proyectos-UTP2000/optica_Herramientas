import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    // Si no hay token, lo mandamos al login
    if (!token) {
        return <Navigate to="/login" />;
    }
    
    return children;
};

export default ProtectedRoute;