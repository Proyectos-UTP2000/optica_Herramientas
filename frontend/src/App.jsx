import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomeDashboard from './pages/HomeDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<Login />} />

       
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          
          <Route index element={<HomeDashboard />} />

          
          <Route path="clientes" element={
            <div style={{ padding: '20px' }}>
              <h2>Módulo de Gestión de Clientes</h2>
              <p>Aquí podrás registrar y visualizar los clientes de la óptica.</p>
            </div>
          } />

          
          <Route path="empleados" element={
            <div style={{ padding: '20px' }}>
              <h2>Módulo de Gestión de Empleados</h2>
              <p>Panel reservado para la administración de personal.</p>
            </div>
          } />
        </Route>

     
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;