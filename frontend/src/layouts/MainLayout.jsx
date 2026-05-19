import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Toast, confirmarAccion } from "../utils/alerts";
import { IconDashboard } from "../components/ui/IconCatalog";
import { iconMap } from "../utils/iconUtils";

// ── Iconos SVG inline (Específicos de Layout) ───────────────────────
const IconLogout = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconMenu = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconChevronDown = ({ style }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MainLayout = ({ opciones = [], setToken }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const rol = localStorage.getItem("rol");

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});

  const toggleSeccion = (id) => {
    setSeccionesAbiertas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const opcionesPadre = opciones
    .filter((op) => op.idPadre === null)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const opcionesHijas = opciones.filter((op) => op.idPadre !== null);

  const getHijos = (idPadre) => {
    return opcionesHijas
      .filter((op) => op.idPadre === idPadre)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  };

  useEffect(() => {
    const handle = () => setEsMovil(window.innerWidth <= 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

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
      if (setToken) setToken(null);
      Toast.fire({ icon: "info", title: "Sesión cerrada. ¡Hasta pronto!" });
      navigate("/login");
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { margin:0; padding:0; overflow-x:hidden; background:#f8fafc; font-family:'Inter',sans-serif; }
    * { box-sizing:border-box; }
    .layout-container { display:flex; min-height:100vh; }

    .sidebar {
      width: 240px;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 50;
      transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
      border-right: 1px solid #1e293b;
    }
    .main-content {
      flex:1; display:flex; flex-direction:column; min-width:0;
      margin-left:240px; transition:margin-left 0.25s cubic-bezier(0.16,1,0.3,1);
    }
    .nav-link {
      display:flex; align-items:center; gap:10px;
      padding:9px 12px; border-radius:8px; margin-bottom:2px;
      text-decoration:none; font-size:13.5px; font-weight:500;
      color:#94a3b8; transition:all 150ms ease;
    }
    .nav-link:hover { color:#e2e8f0; background:rgba(255,255,255,0.05); }
    .nav-link.active { color:#fff; background:rgba(59,130,246,0.18); }
    .nav-link.active svg { color:#60a5fa; }

    .nav-section-label {
      font-size:10.5px; font-weight:700; color:#475569;
      text-transform:uppercase; letter-spacing:0.08em;
      padding:12px 12px 6px; margin-top:4px;
    }

    @media (max-width:768px) {
      .sidebar { transform:translateX(-100%); }
      .sidebar.abierto { transform:translateX(0); box-shadow:8px 0 30px rgba(0,0,0,0.3); }
      .main-content { margin-left:0; }
      .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:40; }
    }
  `;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{css}</style>
      <div className="layout-container">
        {esMovil && menuAbierto && (
          <div className="overlay" onClick={() => setMenuAbierto(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${menuAbierto ? "abierto" : ""}`}>
          {/* Logo */}
          <div
            style={{
              padding: "22px 16px 18px",
              borderBottom: "1px solid #1e293b",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="6" />
                  <circle cx="11" cy="11" r="2.5" />
                  <path d="M20 20l-3-3" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#f1f5f9",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Divino NiÑo Del Milagro
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>
                  Panel de Control
                </p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
            {opcionesPadre.map((op) => {
              const hijos = getHijos(op.id);
              const tieneHijos = hijos.length > 0;
              const abierto = seccionesAbiertas[op.id];
              const rutaReact = (op.ruta || "").replace("/api/v1", "") || "/";

              if (tieneHijos) {
                return (
                  <div key={op.id} style={{ marginBottom: "4px" }}>
                    <div
                      className="nav-link"
                      style={{
                        cursor: "pointer",
                        justifyContent: "space-between",
                      }}
                      onClick={() => toggleSeccion(op.id)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {iconMap[op.icono] || <IconDashboard />} {op.nombre}
                      </div>
                      <IconChevronDown
                        style={{
                          transform: abierto
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </div>
                    {abierto && (
                      <div style={{ paddingLeft: "26px", marginTop: "2px" }}>
                        {hijos.map((hijo) => {
                          const rutaHijo =
                            (hijo.ruta || "").replace("/api/v1", "") || "/";
                          return (
                            <Link
                              key={hijo.id}
                              to={rutaHijo}
                              className={`nav-link ${isActive(rutaHijo) ? "active" : ""}`}
                              style={{ padding: "7px 12px", fontSize: "13px" }}
                            >
                              {hijo.nombre}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={op.id}
                  to={rutaReact}
                  className={`nav-link ${isActive(rutaReact) ? "active" : ""}`}
                >
                  {iconMap[op.icono] || <IconDashboard />} {op.nombre}
                </Link>
              );
            })}
          </nav>

          {/* Usuario + logout */}
          <div style={{ padding: "14px 10px", borderTop: "1px solid #1e293b" }}>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#e2e8f0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {username}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "#475569",
                  marginTop: 2,
                }}
              >
                {rol}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: "#64748b",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                e.currentTarget.style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              <IconLogout /> Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* ── Contenido principal ── */}
        <main className="main-content">
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "13px 24px",
              background: "#fff",
              borderBottom: "1px solid #e2e8f0",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            {esMovil ? (
              <button
                onClick={() => setMenuAbierto(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#334155",
                  display: "flex",
                  padding: 4,
                }}
              >
                <IconMenu />
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "#1e40af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
                  {username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  {username}
                </p>
              </div>
              <span
                style={{
                  padding: "3px 9px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  border: "1px solid #bfdbfe",
                }}
              >
                {rol}
              </span>
            </div>
          </header>

          {/* Página */}
          <section
            style={{
              padding: esMovil ? "16px" : "28px 32px",
              overflowX: "hidden",
            }}
          >
            <Outlet />
          </section>
        </main>
      </div>
    </>
  );
};

export default MainLayout;