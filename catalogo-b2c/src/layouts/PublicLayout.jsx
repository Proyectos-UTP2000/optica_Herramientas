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

  const styles = {
    layout: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#f8fafc",
    },
    topbar: {
      backgroundColor: "#0f172a",
      color: "#e2e8f0",
      fontSize: "12px",
      padding: "6px 24px",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "10px",
    },
    topbarItem: { display: "flex", alignItems: "center", gap: "6px" },
    navbar: {
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      padding: "14px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      textDecoration: "none",
    },
    logoImg: { height: "40px", width: "auto", objectFit: "contain" },
    logoText: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0,
    },
    navbarActions: { display: "flex", gap: "16px", alignItems: "center" },
    socials: { display: "flex", gap: "12px", alignItems: "center" },
    socialLink: {
      color: "#475569",
      transition: "color 150ms",
      display: "flex",
      alignItems: "center",
    },
    main: { flex: 1, display: "flex", flexDirection: "column" },
    footer: {
      backgroundColor: "#0f172a",
      color: "#94a3b8",
      padding: "40px 24px 20px",
      marginTop: "auto",
      borderTop: "1px solid #1e293b",
      fontSize: "14px",
    },
    footerGrid: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "30px",
      marginBottom: "30px",
    },
    footerTitle: {
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "16px",
    },
    footerText: { lineHeight: "1.6", margin: "0 0 10px 0" },
    copyright: {
      textAlign: "center",
      borderTop: "1px solid #1e293b",
      paddingTop: "20px",
      fontSize: "12px",
    },
    userMenu: { position: "relative" },
    userButton: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      border: "1px solid #cbd5e1",
      borderRadius: "20px",
      padding: "6px 12px",
      backgroundColor: "#fff",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      color: "#334155",
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      right: 0,
      marginTop: "8px",
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      display: menuOpen ? "block" : "none",
      minWidth: "160px",
      zIndex: 200,
    },
    dropdownLink: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "10px 16px",
      border: "none",
      background: "none",
      color: "#334155",
      textDecoration: "none",
      fontSize: "14px",
      cursor: "pointer",
      transition: "background-color 100ms",
    },
    authLink: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#2563eb",
      textDecoration: "none",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.layout}>
      {/* Topbar Informativa */}
      <div style={styles.topbar}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {config?.horarioAtencion && (
            <div style={styles.topbarItem}>
              <Clock size={13} /> {config.horarioAtencion}
            </div>
          )}
          {config?.direccion && (
            <div style={styles.topbarItem}>
              <GeoAlt size={13} /> {config.direccion}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {config?.telefonoContacto && (
            <div style={styles.topbarItem}>
              <Telephone size={13} /> {config.telefonoContacto}
            </div>
          )}
        </div>
      </div>

      {/* Navbar Principal */}
      <header style={styles.navbar}>
        <Link to="/" style={styles.logoContainer}>
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" style={styles.logoImg} />
          ) : (
            <Globe size={28} style={{ color: "#2563eb" }} />
          )}
          <span style={styles.logoText}>Nuestra Óptica</span>
        </Link>

        {/* Acciones del Navbar (User + Socials) */}
        <div style={styles.navbarActions}>
          <div style={styles.socials}>
            {config?.enlaceFacebook && (
              <a
                href={config.enlaceFacebook}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialLink}
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
                style={styles.socialLink}
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
                style={styles.socialLink}
                title="Tiktok"
              >
                <Tiktok size={18} />
              </a>
            )}
          </div>

          <div
            style={{ width: "1px", height: "20px", backgroundColor: "#cbd5e1" }}
          ></div>

          {/* Menú de Sesión Cliente */}
          {usuario ? (
            <div style={styles.userMenu}>
              <button
                style={styles.userButton}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <PersonCircle size={18} style={{ color: "#2563eb" }} />
                <span>{usuario.split("@")[0]}</span>
              </button>
              <div
                style={styles.dropdown}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  to="/mi-cuenta"
                  style={styles.dropdownLink}
                  onClick={() => setMenuOpen(false)}
                >
                  Mi Perfil / Pedidos
                </Link>
                <div
                  style={{ height: "1px", backgroundColor: "#e2e8f0" }}
                ></div>
                <button style={styles.dropdownLink} onClick={handleLogout}>
                  <BoxArrowRight size={14} style={{ marginRight: "6px" }} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-login-modal"))
                }
                style={{
                  ...styles.dropdownLink,
                  color: "#2563eb",
                  fontWeight: "600",
                  padding: "6px 12px",
                }}
              >
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Contenido de la Página */}
      <main style={styles.main}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <h4 style={styles.footerTitle}>Sobre Nosotros</h4>
            <p style={styles.footerText}>
              Cuidamos tu salud visual con los mejores profesionales, monturas
              de calidad y la última tecnología en cristales ópticos.
            </p>
          </div>
          <div>
            <h4 style={styles.footerTitle}>Contacto</h4>
            {config?.telefonoContacto && (
              <p style={styles.topbarItem}>
                <Telephone size={14} /> {config.telefonoContacto}
              </p>
            )}
            {config?.correoContacto && (
              <p style={styles.topbarItem}>
                <Envelope size={14} /> {config.correoContacto}
              </p>
            )}
            {config?.direccion && (
              <p style={styles.topbarItem}>
                <GeoAlt size={14} /> {config.direccion}
              </p>
            )}
          </div>
          <div>
            <h4 style={styles.footerTitle}>Horario Comercial</h4>
            {config?.horarioAtencion ? (
              <p style={styles.topbarItem}>
                <Clock size={14} /> {config.horarioAtencion}
              </p>
            ) : (
              <p style={styles.footerText}>Lunes a Sábado: 9:00 AM - 8:00 PM</p>
            )}
          </div>
        </div>
        <div style={styles.copyright}>
          &copy; {new Date().getFullYear()} Nuestra Óptica. Todos los derechos
          reservados.
        </div>
      </footer>
      <AuthModal />
    </div>
  );
};

export default PublicLayout;
