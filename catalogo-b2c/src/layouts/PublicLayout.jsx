import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import {
  Globe,
  Telephone,
  Envelope,
  GeoAlt,
  Clock,
  Facebook,
  Instagram,
  Tiktok,
  BoxArrowRight,
  PersonCircle,
} from "react-bootstrap-icons";
import AuthModal from "../components/AuthModal";

const PublicLayout = () => {
  const [config, setConfig] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const checkSession = () => {
    const username = localStorage.getItem("username_cliente");
    const token = localStorage.getItem("token_cliente");
    if (username && token) {
      setUsuario(username);
    } else {
      setUsuario(null);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/api/v1/public/web-config");
        setConfig(res.data);
      } catch (error) {
        console.error("No se pudo cargar la configuración de cabecera:", error);
      }
    };
    fetchConfig();
    checkSession();

    // Listen to storage events to keep session in sync
    window.addEventListener("storage", checkSession);
    // Custom event for same-window updates
    window.addEventListener("cliente-session-changed", checkSession);

    return () => {
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("cliente-session-changed", checkSession);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token_cliente");
    localStorage.removeItem("username_cliente");
    localStorage.removeItem("id_cliente");
    setUsuario(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event("cliente-session-changed"));
    navigate("/");
  };

  return (
    <div className="public-layout">
      {/* Topbar Informativa */}
      <div className="public-topbar">
        <div className="public-topbar-group">
          {config?.horarioAtencion && (
            <div className="public-topbar-item">
              <Clock size={13} /> <span>{config.horarioAtencion}</span>
            </div>
          )}
          {config?.direccion && (
            <div className="public-topbar-item">
              <GeoAlt size={13} /> <span>{config.direccion}</span>
            </div>
          )}
        </div>
        <div className="public-topbar-group">
          {config?.telefonoContacto && (
            <div className="public-topbar-item">
              <Telephone size={13} /> <span>{config.telefonoContacto}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navbar Principal */}
      <header className="public-navbar">
        <Link to="/" className="public-navbar-brand">
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="public-logo-img" />
          ) : (
            <div className="public-logo-fallback">
              <Globe size={28} />
            </div>
          )}
          <span className="public-logo-text">Nuestra Óptica</span>
        </Link>

        {/* Acciones del Navbar (User + Socials) */}
        <div className="public-navbar-actions">
          <div className="public-socials">
            {config?.enlaceFacebook && (
              <a
                href={config.enlaceFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="public-social-link"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
            )}
            {config?.enlaceInstagram && (
              <a
                href={config.enlaceInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="public-social-link"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
            )}
            {config?.enlaceTiktok && (
              <a
                href={config.enlaceTiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="public-social-link"
                title="Tiktok"
              >
                <Tiktok size={18} />
              </a>
            )}
          </div>

          <div className="public-divider"></div>

          {/* Menú de Sesión Cliente */}
          {usuario ? (
            <div className="public-user-menu">
              <button
                className="public-user-button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <PersonCircle size={18} />
                <span>{usuario.split("@")[0]}</span>
              </button>
              {menuOpen && (
                <div
                  className="public-user-dropdown"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    to="/mi-cuenta"
                    className="public-dropdown-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mi Perfil / Pedidos
                  </Link>
                  <div className="public-dropdown-divider"></div>
                  <button
                    className="public-dropdown-link"
                    onClick={handleLogout}
                  >
                    <BoxArrowRight size={14} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-login-modal"))
              }
              className="public-login-btn"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      {/* Contenido de la Página */}
      <main className="public-main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <div className="public-footer-grid">
          <div>
            <h4 className="public-footer-title">Sobre Nosotros</h4>
            <p className="public-footer-text">
              Cuidamos tu salud visual con los mejores profesionales, monturas
              de calidad y la última tecnología en cristales ópticos.
            </p>
          </div>
          <div>
            <h4 className="public-footer-title">Contacto</h4>
            {config?.telefonoContacto && (
              <div className="public-footer-item">
                <Telephone size={14} /> <span>{config.telefonoContacto}</span>
              </div>
            )}
            {config?.correoContacto && (
              <div className="public-footer-item">
                <Envelope size={14} /> <span>{config.correoContacto}</span>
              </div>
            )}
            {config?.direccion && (
              <div className="public-footer-item">
                <GeoAlt size={14} /> <span>{config.direccion}</span>
              </div>
            )}
          </div>
          <div>
            <h4 className="public-footer-title">Horario Comercial</h4>
            {config?.horarioAtencion ? (
              <div className="public-footer-item">
                <Clock size={14} /> <span>{config.horarioAtencion}</span>
              </div>
            ) : (
              <p className="public-footer-text">
                Lunes a Sábado: 9:00 AM - 8:00 PM
              </p>
            )}
          </div>
        </div>
        <div className="public-footer-copyright">
          &copy; {new Date().getFullYear()} Nuestra Óptica. Todos los derechos
          reservados.
        </div>
      </footer>
      <AuthModal />
    </div>
  );
};

export default PublicLayout;
