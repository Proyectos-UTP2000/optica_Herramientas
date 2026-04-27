import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomeDashboard from './pages/HomeDashboard';
import Empleados from './pages/Empleados';
import Perfiles from './pages/Perfiles';
import Clientes from './pages/Clientes';

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

          {/* ← REEMPLAZAR el div inline por el componente */}
          <Route path="clientes" element={<Clientes />} />

          <Route path="empleados" element={<Empleados />} />
          <Route path="perfiles" element={<Perfiles />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;