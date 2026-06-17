import { useState, useEffect, createContext, useContext } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
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
import Recetas from "./pages/Recetas";
import OrdenesLaboratorio from "./pages/OrdenesLaboratorio";
import ReporteDiarioCaja from "./pages/caja/ReporteDiarioCaja";
import Compras from "./pages/Compras";
import ReporteKardex from "./pages/reportes/ReporteKardex";
import ReporteVentas from "./pages/reportes/ReporteVentas";
import ReporteCompras from "./pages/reportes/ReporteCompras";
import ReporteCajas from "./pages/reportes/ReporteCajas";
import EnProceso from "./pages/EnProceso";
import Configuracion from "./pages/Configuracion";

import CatalogoWeb from "./pages/CatalogoWeb";
import Etiquetas from "./pages/Etiquetas";
import ContenidoWeb from "./pages/ContenidoWeb";
import CotizacionesAdmin from "./pages/CotizacionesAdmin";

const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

const LoginRoute = () => {
  const { setToken } = useApp();
  return (
    <Login onLoginSuccess={() => setToken(localStorage.getItem("token"))} />
  );
};

const ProtectedRouteElement = () => {
  const { opciones, loading, setToken } = useApp();
  return (
    <ProtectedRoute opciones={opciones} loading={loading}>
      <MainLayout opciones={opciones} setToken={setToken} />
    </ProtectedRoute>
  );
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/",
    element: <ProtectedRouteElement />,
    children: [
      { index: true, element: <HomeDashboard /> },
      { path: "clientes", element: <Clientes /> },
      { path: "empleados", element: <Empleados /> },
      { path: "perfiles", element: <Perfiles /> },
      { path: "productos", element: <Productos /> },
      { path: "configuracion-menu", element: <ConfiguracionMenu /> },
      { path: "marcas", element: <Marcas /> },
      { path: "categorias", element: <Categorias /> },
      { path: "unidades", element: <Unidades /> },
      { path: "etiquetas", element: <Etiquetas /> },
      { path: "inventario/etiquetas", element: <Etiquetas /> },
      { path: "inventario", element: <Inventario /> },
      { path: "proveedores", element: <Proveedores /> },
      { path: "ventas", element: <Ventas /> },
      { path: "recetas", element: <Recetas /> },
      { path: "ordenes-laboratorio", element: <OrdenesLaboratorio /> },
      { path: "reportes/caja", element: <ReporteCajas /> },
      {
        path: "reportes/caja-diaria",
        element: <Navigate to="/reportes/caja" replace />,
      },
      { path: "reportes/kardex", element: <ReporteKardex /> },
      { path: "reportes/ventas", element: <ReporteVentas /> },
      { path: "reportes/compras", element: <ReporteCompras /> },
      { path: "reportes/cajas", element: <ReporteCajas /> },
      {
        path: "configuracion",
        element: <Configuracion />,
      },
      { path: "catalogo-web", element: <CatalogoWeb /> },
      { path: "gestion-web/catalogo-web", element: <CatalogoWeb /> },
      { path: "cotizaciones", element: <CotizacionesAdmin /> },
      { path: "gestion-web/cotizaciones", element: <CotizacionesAdmin /> },
      { path: "contenido-web", element: <ContenidoWeb /> },
      { path: "gestion-web/contenido", element: <ContenidoWeb /> },
      { path: "cajas/reporte-diario", element: <ReporteDiarioCaja /> },
      { path: "compras", element: <Compras /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" />,
  },
]);

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
    <AppContext.Provider value={{ opciones, token, loading, setToken }}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}

export default App;
