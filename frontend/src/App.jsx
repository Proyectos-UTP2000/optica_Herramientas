import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeDashboard from "./pages/HomeDashboard";
import Empleados from "./pages/Empleados";
import Perfiles from "./pages/Perfiles";
import Clientes from "./pages/Clientes";
import ConfiguracionMenu from "./pages/ConfiguracionMenu";
import { getMisOpciones } from "./api/authService";
import Productos from "./pages/Productos";
import Marcas from "./pages/Marcas";
import Categorias from "./pages/Categorias";
import Unidades from "./pages/Unidades";

function App() {
  const [opciones, setOpciones] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  const cargarOpciones = async () => {
    setLoading(true);
    try {
      const data = await getMisOpciones();
      setOpciones(data);
    } catch (error) {
      console.error("Error al cargar opciones:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarOpciones();
    } else {
      setOpciones([]);
      setLoading(false);
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={() => setToken(localStorage.getItem("token"))}
            />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute opciones={opciones} loading={loading}>
              <MainLayout opciones={opciones} setToken={setToken} />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeDashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="perfiles" element={<Perfiles />} />
          <Route path="productos" element={<Productos />} />
          <Route path="configuracion-menu" element={<ConfiguracionMenu />} />
          <Route path="marcas" element={<Marcas />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="unidades" element={<Unidades />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
