import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Toast, confirmarAccion } from "../utils/alerts";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const rol = localStorage.getItem("rol");

  // Estado para controlar el menú en celulares
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Estado para saber si estamos en pantalla de celular
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cierra el menú al cambiar de ruta en móviles
  useEffect(() => {
    if (esMovil) setMenuAbierto(false);
  }, [location.pathname, esMovil]);

  const handleLogout = async () => {
    const result = await confirmarAccion(
      "¿Cerrar Sesión?",
      "Deberás ingresar tus credenciales nuevamente para acceder.",
      "Sí, salir",
      "question",
    );
    if (result.isConfirmed) {
      localStorage.clear();
      Toast.fire({ icon: "info", title: "Sesión cerrada. ¡Hasta pronto!" });
      navigate("/login");
    }
  };

  // Estilos CSS inyectados para el reset y media queries (Responsividad)
  const estilosGlobales = `
        body { margin: 0; padding: 0; overflow-x: hidden; background-color: #f8fafc; }
        * { box-sizing: border-box; }
        .layout-container { display: flex; min-height: 100vh; }
        
        .sidebar {
            width: 260px; background: #1e293b; color: white; display: flex; flex-direction: column;
            position: fixed; height: 100vh; box-shadow: 4px 0 10px rgba(0,0,0,0.1); z-index: 50;
            transition: transform 0.3s ease;
        }
        
        .main-content {
            flex: 1; display: flex; flex-direction: column; min-width: 0;
            margin-left: 260px; transition: margin-left 0.3s ease;
        }

        /* 📱 RESPONSIVIDAD PARA CELULARES */
        @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.abierto { transform: translateX(0); }
            .main-content { margin-left: 0; }
            .overlay {
                position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40;
                opacity: 1; transition: opacity 0.3s ease;
            }
        }
    `;

  const navLinkStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    color: isActive ? "#fff" : "#94a3b8",
    textDecoration: "none",
    borderRadius: "8px",
    marginBottom: "8px",
    backgroundColor: isActive ? "#3b82f6" : "transparent",
    transition: "all 0.3s ease",
    fontWeight: isActive ? "600" : "400",
  });

  return (
    <>
      <style>{estilosGlobales}</style>

      <div className="layout-container">
        {/* Fondo oscuro cuando el menú está abierto en móviles */}
        {esMovil && menuAbierto && (
          <div className="overlay" onClick={() => setMenuAbierto(false)}></div>
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${menuAbierto ? "abierto" : ""}`}>
          <div
            style={{
              padding: "30px 20px",
              textAlign: "center",
              borderBottom: "1px solid #334155",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "800",
                letterSpacing: "1px",
                color: "#3b82f6",
                margin: 0,
              }}
            >
              SISTEMA ÓPTICA
            </h2>
          </div>

          <nav style={{ flex: 1, padding: "20px 10px", overflowY: "auto" }}>
            <Link
              to="/dashboard"
              style={navLinkStyle(location.pathname === "/dashboard")}
            >
              <span style={{ marginRight: "10px" }}>🏠</span> Dashboard
            </Link>
            <Link
              to="/dashboard/clientes"
              style={navLinkStyle(location.pathname === "/dashboard/clientes")}
            >
              <span style={{ marginRight: "10px" }}>👥</span> Clientes
            </Link>

            {rol === "ADMINISTRADOR" && (
              <>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#475569",
                    textTransform: "uppercase",
                    padding: "10px 15px 4px",
                    marginTop: "8px",
                  }}
                >
                  Administración
                </p>
                <Link
                  to="/dashboard/empleados"
                  style={navLinkStyle(
                    location.pathname === "/dashboard/empleados",
                  )}
                >
                  <span style={{ marginRight: "10px" }}>👤</span> Empleados
                </Link>
                <Link
                  to="/dashboard/perfiles"
                  style={navLinkStyle(
                    location.pathname === "/dashboard/perfiles",
                  )}
                >
                  <span style={{ marginRight: "10px" }}>🛡️</span> Perfiles
                </Link>
              </>
            )}
          </nav>

          <div style={{ padding: "20px", borderTop: "1px solid #334155" }}>
            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Contenido Principal */}
        <main className="main-content">
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px 20px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            {/* Botón Hamburguesa (solo visible en móviles) */}
            {esMovil ? (
              <button
                onClick={() => setMenuAbierto(true)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ☰
              </button>
            ) : (
              <div />
            )}{" "}
            {/* Espaciador si no es móvil */}
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Usuario: <strong style={{ color: "#1e293b" }}>{username}</strong>
              <span
                style={{
                  marginLeft: "10px",
                  padding: "4px 10px",
                  background: "#dcfce7",
                  color: "#166534",
                  borderRadius: "12px",
                  fontWeight: "bold",
                }}
              >
                {rol}
              </span>
            </div>
          </header>

          <section
            style={{ padding: esMovil ? "15px" : "30px", overflowX: "hidden" }}
          >
            <Outlet />
          </section>
        </main>
      </div>
    </>
  );
};

export default MainLayout;
