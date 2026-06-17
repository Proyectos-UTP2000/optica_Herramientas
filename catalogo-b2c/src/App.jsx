import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import CatalogoPublico from "./pages/public/CatalogoPublico";
import DetalleProductoPublico from "./pages/public/DetalleProductoPublico";
import MiCuenta from "./pages/MiCuenta";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Navbar and Footer */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<CatalogoPublico />} />
          <Route path="mi-cuenta" element={<MiCuenta />} />
          <Route path="producto/:slug" element={<DetalleProductoPublico />} />
        </Route>
        {/* Redirect any other route to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
