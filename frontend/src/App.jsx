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
import Inventario from "./pages/Inventario";
import Proveedores from "./pages/Proveedores";
import Ventas from "./pages/Ventas";
import ReporteDiarioCaja from "./pages/caja/ReporteDiarioCaja";
import Compras from "./pages/Compras";
import ReporteKardex from "./pages/reportes/ReporteKardex";
import ReporteVentas from "./pages/reportes/ReporteVentas";
import ReporteCompras from "./pages/reportes/ReporteCompras";
import ReporteCajas from "./pages/reportes/ReporteCajas";
import EnProceso from "./pages/EnProceso";

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
    const timer = window.setTimeout(() => {
      if (token) {
        cargarOpciones();
      } else {
        setOpciones([]);
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
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
          <Route path="inventario" element={<Inventario />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="reportes/caja" element={<ReporteCajas />} />
          <Route path="reportes/caja-diaria" element={<Navigate to="/reportes/caja" replace />} />
          <Route path="reportes/kardex" element={<ReporteKardex />} />
          <Route path="reportes/ventas" element={<ReporteVentas />} />
          <Route path="reportes/compras" element={<ReporteCompras />} />
          <Route
            path="configuracion"
            element={
              <EnProceso
                titulo="Configuración"
                descripcion="Aquí se gestionará el cambio de contraseña y otros ajustes de cuenta."
              />
            }
          />
          <Route
            path="catalogo-web"
            element={
              <EnProceso
                titulo="Catálogo Web"
                descripcion="La gestión del catálogo público se habilitará cuando el módulo web esté listo."
              />
            }
          />
          <Route
            path="gestion-web/catalogo-web"
            element={
              <EnProceso
                titulo="Catálogo Web"
                descripcion="La gestión del catálogo público se habilitará cuando el módulo web esté listo."
              />
            }
          />
          <Route
            path="cotizaciones"
            element={
              <EnProceso
                titulo="Cotización"
                descripcion="Esta pantalla mostrará las solicitudes y cotizaciones web cuando el flujo esté implementado."
              />
            }
          />
          <Route
            path="gestion-web/cotizaciones"
            element={
              <EnProceso
                titulo="Cotización"
                descripcion="Esta pantalla mostrará las solicitudes y cotizaciones web cuando el flujo esté implementado."
              />
            }
          />
          <Route path="cajas/reporte-diario" element={<ReporteDiarioCaja />} />
          <Route path="compras" element={<Compras />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
