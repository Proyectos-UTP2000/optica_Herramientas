import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { Toast } from "../utils/alerts";
import { 
  Person, 
  FileText, 
  Calendar, 
  GeoAlt, 
  Telephone, 
  Envelope, 
  CardChecklist,
  Eye,
  Whatsapp,
  Lock
} from "react-bootstrap-icons";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const getBadgeStyles = (estado) => {
  switch (estado) {
    case "PENDIENTE":
      return { bg: "#fef3c7", color: "#d97706" };
    case "CONTACTADO":
      return { bg: "#dbeafe", color: "#2563eb" };
    case "PROCESADO":
      return { bg: "#d1fae5", color: "#059669" };
    case "ANULADO":
      return { bg: "#fee2e2", color: "#dc2626" };
    default:
      return { bg: "#f3f4f6", color: "#4b5563" };
  }
};

const MiCuenta = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil"); // "perfil" o "cotizaciones"
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Profile Data
  const [perfil, setPerfil] = useState(null);
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  // Quotes Data
  const [cotizaciones, setCotizaciones] = useState([]);
  const [detalleCotizacion, setDetalleCotizacion] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem("token_cliente");
    setIsLoggedIn(!!token);
    return !!token;
  };

  useEffect(() => {
    const auth = checkAuth();
    if (auth) {
      fetchData();
    } else {
      setLoading(false);
    }

    const handleSessionChanged = () => {
      const authenticated = checkAuth();
      if (authenticated) {
        fetchData();
      } else {
        setPerfil(null);
        setCotizaciones([]);
        setLoading(false);
      }
    };

    window.addEventListener("cliente-session-changed", handleSessionChanged);
    return () => {
      window.removeEventListener("cliente-session-changed", handleSessionChanged);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [perfilRes, cotizacionesRes] = await Promise.all([
        api.get("/api/v1/cliente-portal/perfil"),
        api.get("/api/v1/cliente-portal/cotizaciones")
      ]);

      setPerfil(perfilRes.data);
      setNombre(perfilRes.data.nombre || "");
      setApellidoPaterno(perfilRes.data.apellidoPaterno || "");
      setApellidoMaterno(perfilRes.data.apellidoMaterno || "");
      setTelefono(perfilRes.data.telefono || "");
      setDireccion(perfilRes.data.direccion || "");

      setCotizaciones(cotizacionesRes.data || []);
    } catch (error) {
      console.error("Error al cargar datos del portal de cliente:", error);
      Toast.fire({ icon: "error", title: "No se pudieron obtener los datos de tu cuenta" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updatedBody = {
        ...perfil,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        telefono,
        direccion
      };
      const res = await api.put("/api/v1/cliente-portal/perfil", updatedBody);
      setPerfil(res.data);
      Toast.fire({ icon: "success", title: "Perfil actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Toast.fire({ icon: "error", title: "No se pudo actualizar el perfil" });
    } finally {
      setUpdating(false);
    }
  };

  const openWhatsAppCoti = (coti) => {
    // Generate text message for WhatsApp
    const itemsStr = coti.detalles.map(d => `- *${d.cantidad}x* ${d.productoNombre} (Cod: ${d.productoCodigo})`).join("%0A");
    const texto = `Hola, quisiera consultar sobre el estado de mi cotización N° *${coti.id}* en su tienda.%0A%0AMis datos:%0A- Nombre: ${coti.clienteNombre}%0A- Teléfono: ${coti.clienteTelefono}%0A%0AProductos:%0A${itemsStr}%0A%0AEstado Actual: *${coti.estado}*%0A%0A¡Muchas gracias!`;
    const cleanNum = coti.clienteTelefono ? coti.clienteTelefono.replace(/[^\d]/g, "") : "";
    // We send it to a general WhatsApp or shop phone if configured, or just let them send it
    window.open(`https://api.whatsapp.com/send?text=${texto}`, "_blank");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", color: "#64748b" }}>
        <h3>Cargando los datos de tu cuenta...</h3>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", padding: "40px 24px", textAlign: "center", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <Lock size={48} style={{ color: "#64748b", marginBottom: "16px" }} />
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>Acceso Restringido</h2>
        <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>
          Debes iniciar sesión para ver tu perfil, actualizar tus datos de envío y revisar el historial de tus cotizaciones.
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("open-login-modal"))}
          style={{ padding: "12px 24px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "background-color 150ms" }}
        >
          Iniciar Sesión / Registrarse
        </button>
      </div>
    );
  }

  const styles = {
    container: { maxWidth: "1000px", margin: "40px auto", padding: "0 16px", fontFamily: "'Segoe UI', sans-serif" },
    grid: { display: "grid", gridTemplateColumns: "280px 1fr", gap: "30px" },
    sidebar: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", height: "fit-content", display: "flex", flexDirection: "column", gap: "20px" },
    profileSummary: { textAlign: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px" },
    avatar: { width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "700", margin: "0 auto 12px" },
    profileName: { fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" },
    profileEmail: { fontSize: "13px", color: "#64748b", margin: 0 },
    nav: { display: "flex", flexDirection: "column", gap: "8px" },
    navItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 14px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      border: "none",
      background: active ? "#eff6ff" : "none",
      color: active ? "#2563eb" : "#475569",
      cursor: "pointer",
      textAlign: "left",
      transition: "all 150ms"
    }),
    contentCard: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
    cardTitle: { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 20px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" },
    formGroup: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" },
    label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
    input: { padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", transition: "border-color 150ms", width: "100%" },
    submitBtn: { backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", padding: "12px 20px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", transition: "background-color 150ms", width: "fit-content" },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    
    // Table Styles
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" },
    th: { backgroundColor: "#f8fafc", padding: "12px 16px", color: "#475569", fontWeight: "600", borderBottom: "1px solid #e2e8f0" },
    td: { padding: "16px", borderBottom: "1px solid #f1f5f9", color: "#334155", verticalAlign: "middle" },
    badge: (styles) => ({ backgroundColor: styles.bg, color: styles.color, padding: "4px 8px", borderRadius: "6px", fontWeight: "700", fontSize: "11px", display: "inline-block", textTransform: "uppercase" }),
    actionBtn: { border: "1px solid #cbd5e1", background: "#ffffff", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#475569", transition: "all 150ms" },
    
    // Modal Details Styles
    modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", zIndex: 1100, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", backdropFilter: "blur(2px)" },
    modal: { backgroundColor: "#ffffff", borderRadius: "16px", width: "min(600px, 100%)", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" },
    modalHeader: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
    modalBody: { padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" },
    infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" },
    infoItem: { display: "flex", flexDirection: "column", gap: "4px" }
  };

  const getInitials = () => {
    if (!perfil) return "U";
    const n = perfil.nombre?.substring(0, 1) || "";
    const a = perfil.apellidoPaterno?.substring(0, 1) || "";
    return (n + a).toUpperCase();
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.profileSummary}>
            <div style={styles.avatar}>{getInitials()}</div>
            <h4 style={styles.profileName}>
              {perfil?.nombre} {perfil?.apellidoPaterno}
            </h4>
            <p style={styles.profileEmail}>{perfil?.correo}</p>
          </div>

          <nav style={styles.nav}>
            <button 
              style={styles.navItem(activeTab === "perfil")} 
              onClick={() => setActiveTab("perfil")}
            >
              <Person size={18} />
              <span>Mis Datos</span>
            </button>
            <button 
              style={styles.navItem(activeTab === "cotizaciones")} 
              onClick={() => setActiveTab("cotizaciones")}
            >
              <FileText size={18} />
              <span>Mis Cotizaciones</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main>
          {activeTab === "perfil" ? (
            <div style={styles.contentCard}>
              <h3 style={styles.cardTitle}>Información de Perfil</h3>
              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombres *</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Apellido Paterno</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={apellidoPaterno}
                      onChange={(e) => setApellidoPaterno(e.target.value)}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Apellido Materno</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={apellidoMaterno}
                      onChange={(e) => setApellidoMaterno(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Tipo de Documento</label>
                    <input
                      type="text"
                      style={{ ...styles.input, backgroundColor: "#f8fafc" }}
                      value={perfil?.tipoDocumento?.nombre || ""}
                      disabled
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Número de Documento</label>
                    <input
                      type="text"
                      style={{ ...styles.input, backgroundColor: "#f8fafc" }}
                      value={perfil?.numeroDocumento || ""}
                      disabled
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Dirección Predeterminada *</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono de Contacto *</label>
                  <input
                    type="tel"
                    style={styles.input}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Correo Electrónico (Solo Lectura)</label>
                  <input
                    type="email"
                    style={{ ...styles.input, backgroundColor: "#f8fafc" }}
                    value={perfil?.correo || ""}
                    disabled
                  />
                </div>

                <button type="submit" style={styles.submitBtn} disabled={updating}>
                  {updating ? "Guardando..." : "Actualizar Datos"}
                </button>
              </form>
            </div>
          ) : (
            <div style={styles.contentCard}>
              <h3 style={styles.cardTitle}>Historial de Cotizaciones</h3>
              
              {cotizaciones.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>
                  <CardChecklist size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
                  <p style={{ margin: 0 }}>Aún no has registrado solicitudes de cotización.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Fecha</th>
                        <th style={styles.th}>Total Est.</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.th}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotizaciones.map(c => {
                        const badgeStyle = getBadgeStyles(c.estado);
                        return (
                          <tr key={c.id}>
                            <td style={styles.td}>#{c.id}</td>
                            <td style={styles.td}>
                              {new Date(c.fechaCreacion).toLocaleDateString("es-PE", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit"
                              })}
                            </td>
                            <td style={styles.td}>{formatoMoneda(c.totalEstimado)}</td>
                            <td style={styles.td}>
                              <span style={styles.badge(badgeStyle)}>{c.estado}</span>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button 
                                  style={styles.actionBtn}
                                  onClick={() => setDetalleCotizacion(c)}
                                  title="Ver Detalle"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  style={{ ...styles.actionBtn, borderColor: "#25d366", color: "#25d366" }}
                                  onClick={() => openWhatsAppCoti(c)}
                                  title="Consultar por WhatsApp"
                                >
                                  <Whatsapp size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Sub-modal: Detalle de Cotización */}
      {detalleCotizacion && (
        <div style={styles.modalOverlay} onMouseDown={() => setDetalleCotizacion(null)}>
          <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Detalle de Cotización #{detalleCotizacion.id}</h3>
              <button 
                style={{ background: "none", border: "none", fontSize: "20px", color: "#64748b", cursor: "pointer" }}
                onClick={() => setDetalleCotizacion(null)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Nombre de contacto</span>
                  <span style={{ fontSize: "13px", color: "#0f172a", fontWeight: "600" }}>{detalleCotizacion.clienteNombre}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Teléfono</span>
                  <span style={{ fontSize: "13px", color: "#0f172a", fontWeight: "600" }}>{detalleCotizacion.clienteTelefono}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Dirección</span>
                  <span style={{ fontSize: "13px", color: "#0f172a", fontWeight: "600" }}><GeoAlt size={12} /> {detalleCotizacion.direccion || "---"}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Estado</span>
                  <span style={styles.badge(getBadgeStyles(detalleCotizacion.estado))}>{detalleCotizacion.estado}</span>
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: "13px", fontWeight: "700", color: "#475569", margin: "0 0 10px 0" }}>Productos Solicitados</h5>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc" }}>
                        <th style={{ padding: "10px", textAlign: "left", color: "#475569", fontWeight: "600" }}>Producto</th>
                        <th style={{ padding: "10px", textAlign: "center", color: "#475569", fontWeight: "600" }}>Código</th>
                        <th style={{ padding: "10px", textAlign: "center", color: "#475569", fontWeight: "600" }}>Cant.</th>
                        <th style={{ padding: "10px", textAlign: "right", color: "#475569", fontWeight: "600" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleCotizacion.detalles.map(d => (
                        <tr key={d.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px", color: "#0f172a" }}>{d.productoNombre}</td>
                          <td style={{ padding: "10px", textAlign: "center", color: "#64748b" }}>{d.productoCodigo}</td>
                          <td style={{ padding: "10px", textAlign: "center", fontWeight: "600" }}>{d.cantidad}</td>
                          <td style={{ padding: "10px", textAlign: "right", color: "#2563eb", fontWeight: "600" }}>{formatoMoneda(d.subtotal)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: "2px solid #e2e8f0", backgroundColor: "#f8fafc", fontWeight: "700" }}>
                        <td colSpan="3" style={{ padding: "10px", textAlign: "right" }}>Total Estimado:</td>
                        <td style={{ padding: "10px", textAlign: "right", color: "#2563eb", fontSize: "13px" }}>{formatoMoneda(detalleCotizacion.totalEstimado)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {detalleCotizacion.observaciones && (
                <div>
                  <h5 style={{ fontSize: "13px", fontWeight: "700", color: "#475569", margin: "0 0 6px 0" }}>Observaciones</h5>
                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>{detalleCotizacion.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiCuenta;
