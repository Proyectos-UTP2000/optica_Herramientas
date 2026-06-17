import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { Toast } from "../utils/alerts";
import {
  Person,
  FileText,
  GeoAlt,
  CardChecklist,
  Eye,
  Whatsapp,
  Lock,
  CheckCircleFill,
  XCircleFill,
  EyeSlash,
} from "react-bootstrap-icons";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const MiCuenta = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil"); // "perfil", "cotizaciones" o "seguridad"
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Password Change Data
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // validation rules
  const hasMinLength = passwordNueva.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordNueva);
  const hasLowercase = /[a-z]/.test(passwordNueva);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]~;\/\\]/.test(
    passwordNueva,
  );
  const passwordsMatch =
    passwordNueva === confirmarPassword && passwordNueva !== "";

  const passwordFormValido =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasSpecialChar &&
    passwordsMatch &&
    passwordActual.trim() !== "";

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [perfilRes, cotizacionesRes] = await Promise.all([
        api.get("/api/v1/cliente-portal/perfil"),
        api.get("/api/v1/cliente-portal/cotizaciones"),
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
      Toast.fire({
        icon: "error",
        title: "No se pudieron obtener los datos de tu cuenta",
      });
    } finally {
      setLoading(false);
    }
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
      window.removeEventListener(
        "cliente-session-changed",
        handleSessionChanged,
      );
    };
  }, []);

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
        direccion,
      };
      const res = await api.put("/api/v1/cliente-portal/perfil", updatedBody);
      setPerfil(res.data);
      Toast.fire({
        icon: "success",
        title: "Perfil actualizado correctamente",
      });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Toast.fire({ icon: "error", title: "No se pudo actualizar el perfil" });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordFormValido) return;
    setUpdatingPassword(true);
    try {
      await api.put("/api/v1/cliente-portal/perfil/contrasena", {
        passwordActual,
        passwordNueva,
      });
      Toast.fire({
        icon: "success",
        title: "Contraseña actualizada correctamente",
      });
      setPasswordActual("");
      setPasswordNueva("");
      setConfirmarPassword("");
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      const msg =
        error.response?.data?.message || "No se pudo actualizar la contraseña.";
      Toast.fire({ icon: "error", title: msg });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const openWhatsAppCoti = (coti) => {
    const itemsStr = coti.detalles
      .map(
        (d) =>
          `- *${d.cantidad}x* ${d.productoNombre} (Cod: ${d.productoCodigo})`,
      )
      .join("%0A");
    const texto = `Hola, quisiera consultar sobre el estado de mi cotización N° *${coti.id}* en su tienda.%0A%0AMis datos:%0A- Nombre: ${coti.clienteNombre}%0A- Teléfono: ${coti.clienteTelefono}%0A%0AProductos:%0A${itemsStr}%0A%0AEstado Actual: *${coti.estado}*%0A%0A¡Muchas gracias!`;
    window.open(`https://api.whatsapp.com/send?text=${texto}`, "_blank");
  };

  if (loading) {
    return (
      <div className="my-account-loading">
        <h3>Cargando los datos de tu cuenta...</h3>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="my-account-restricted">
        <Lock size={48} className="my-account-restricted-icon" />
        <h2>Acceso Restringido</h2>
        <p>
          Debes iniciar sesión para ver tu perfil, actualizar tus datos de envío
          y revisar el historial de tus cotizaciones.
        </p>
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-login-modal"))
          }
          className="btn-primary"
        >
          Iniciar Sesión / Registrarse
        </button>
      </div>
    );
  }

  const getInitials = () => {
    if (!perfil) return "U";
    const n = perfil.nombre?.substring(0, 1) || "";
    const a = perfil.apellidoPaterno?.substring(0, 1) || "";
    return (n + a).toUpperCase();
  };

  return (
    <div className="my-account-container">
      <div className="my-account-grid">
        {/* Sidebar */}
        <aside className="my-account-sidebar">
          <div className="my-account-profile-summary">
            <div className="my-account-avatar">{getInitials()}</div>
            <h4 className="my-account-profile-name">
              {perfil?.nombre} {perfil?.apellidoPaterno}
            </h4>
            <p className="my-account-profile-email">{perfil?.correo}</p>
          </div>

          <nav className="my-account-nav">
            <button
              onClick={() => setActiveTab("perfil")}
              className={`my-account-nav-btn ${activeTab === "perfil" ? "active" : ""}`}
            >
              <Person size={18} />
              <span>Mis Datos</span>
            </button>
            <button
              onClick={() => setActiveTab("cotizaciones")}
              className={`my-account-nav-btn ${activeTab === "cotizaciones" ? "active" : ""}`}
            >
              <FileText size={18} />
              <span>Mis Cotizaciones</span>
            </button>
            <button
              onClick={() => setActiveTab("seguridad")}
              className={`my-account-nav-btn ${activeTab === "seguridad" ? "active" : ""}`}
            >
              <Lock size={18} />
              <span>Seguridad</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main>
          {activeTab === "perfil" ? (
            <div className="my-account-card">
              <h3 className="my-account-card-title">Información de Perfil</h3>
              <form onSubmit={handleUpdateProfile} className="my-account-form">
                <div className="my-account-form-group">
                  <label className="my-account-label">Nombres *</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>

                <div className="my-account-form-row">
                  <div className="my-account-form-group">
                    <label className="my-account-label">Apellido Paterno</label>
                    <input
                      type="text"
                      value={apellidoPaterno}
                      onChange={(e) => setApellidoPaterno(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="my-account-form-group">
                    <label className="my-account-label">Apellido Materno</label>
                    <input
                      type="text"
                      value={apellidoMaterno}
                      onChange={(e) => setApellidoMaterno(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="my-account-form-row">
                  <div className="my-account-form-group">
                    <label className="my-account-label">
                      Tipo de Documento
                    </label>
                    <input
                      type="text"
                      value={perfil?.tipoDocumento?.nombre || ""}
                      disabled
                      className="form-control"
                    />
                  </div>
                  <div className="my-account-form-group">
                    <label className="my-account-label">
                      Número de Documento
                    </label>
                    <input
                      type="text"
                      value={perfil?.numeroDocumento || ""}
                      disabled
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="my-account-form-group">
                  <label className="my-account-label">
                    Dirección Predeterminada *
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>

                <div className="my-account-form-group">
                  <label className="my-account-label">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>

                <div className="my-account-form-group">
                  <label className="my-account-label">
                    Correo Electrónico (Solo Lectura)
                  </label>
                  <input
                    type="email"
                    value={perfil?.correo || ""}
                    disabled
                    className="form-control"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "fit-content", marginTop: "8px" }}
                  disabled={updating}
                >
                  {updating ? "Guardando..." : "Actualizar Datos"}
                </button>
              </form>
            </div>
          ) : activeTab === "cotizaciones" ? (
            <div className="my-account-card">
              <h3 className="my-account-card-title">
                Historial de Cotizaciones
              </h3>

              {cotizaciones.length === 0 ? (
                <div className="my-account-empty-state">
                  <CardChecklist size={40} className="my-account-empty-icon" />
                  <p>Aún no has registrado solicitudes de cotización.</p>
                </div>
              ) : (
                <div className="my-account-table-container">
                  <table className="my-account-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Total Est.</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotizaciones.map((c) => {
                        return (
                          <tr key={c.id}>
                            <td style={{ fontWeight: "600" }}>#{c.id}</td>
                            <td>
                              {new Date(c.fechaCreacion).toLocaleDateString(
                                "es-PE",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                },
                              )}
                            </td>
                            <td
                              style={{
                                fontWeight: "700",
                                color: "var(--color-primary)",
                              }}
                            >
                              {formatoMoneda(c.totalEstimado)}
                            </td>
                            <td>
                              <span
                                className={`my-account-badge badge-${c.estado.toLowerCase()}`}
                              >
                                {c.estado}
                              </span>
                            </td>
                            <td>
                              <div className="my-account-actions-cell">
                                <button
                                  onClick={() => setDetalleCotizacion(c)}
                                  className="my-account-action-btn"
                                  title="Ver Detalle"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => openWhatsAppCoti(c)}
                                  className="my-account-action-btn btn-whatsapp"
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
          ) : activeTab === "seguridad" ? (
            <div className="my-account-card">
              <h3 className="my-account-card-title">Cambiar Contraseña</h3>
              <form onSubmit={handleChangePassword} className="my-account-form">
                <div className="my-account-form-group">
                  <label className="my-account-label">
                    Contraseña Actual *
                  </label>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type={showActual ? "text" : "password"}
                      value={passwordActual}
                      onChange={(e) => setPasswordActual(e.target.value)}
                      required
                      className="form-control"
                      style={{ paddingRight: "40px", width: "100%" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowActual(!showActual)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        background: "none",
                        border: "none",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showActual ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="my-account-form-group">
                  <label className="my-account-label">Nueva Contraseña *</label>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type={showNueva ? "text" : "password"}
                      value={passwordNueva}
                      onChange={(e) => setPasswordNueva(e.target.value)}
                      required
                      className="form-control"
                      style={{ paddingRight: "40px", width: "100%" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNueva(!showNueva)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        background: "none",
                        border: "none",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showNueva ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="my-account-form-group">
                  <label className="my-account-label">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type={showConfirmar ? "text" : "password"}
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      required
                      className="form-control"
                      style={{ paddingRight: "40px", width: "100%" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        background: "none",
                        border: "none",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showConfirmar ? (
                        <EyeSlash size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    padding: "16px",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--color-text-main)",
                      marginBottom: "10px",
                    }}
                  >
                    Requisitos de la contraseña:
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: hasMinLength ? "#10b981" : "#ef4444",
                      marginBottom: "6px",
                    }}
                  >
                    {hasMinLength ? (
                      <CheckCircleFill size={14} />
                    ) : (
                      <XCircleFill size={14} />
                    )}
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: hasUppercase ? "#10b981" : "#ef4444",
                      marginBottom: "6px",
                    }}
                  >
                    {hasUppercase ? (
                      <CheckCircleFill size={14} />
                    ) : (
                      <XCircleFill size={14} />
                    )}
                    <span>Al menos una letra mayúscula</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: hasLowercase ? "#10b981" : "#ef4444",
                      marginBottom: "6px",
                    }}
                  >
                    {hasLowercase ? (
                      <CheckCircleFill size={14} />
                    ) : (
                      <XCircleFill size={14} />
                    )}
                    <span>Al menos una letra minúscula</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: hasSpecialChar ? "#10b981" : "#ef4444",
                      marginBottom: "6px",
                    }}
                  >
                    {hasSpecialChar ? (
                      <CheckCircleFill size={14} />
                    ) : (
                      <XCircleFill size={14} />
                    )}
                    <span>Al menos un carácter especial (ej: !@#$%^&*)</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: passwordsMatch ? "#10b981" : "#ef4444",
                      marginBottom: "6px",
                    }}
                  >
                    {passwordsMatch ? (
                      <CheckCircleFill size={14} />
                    ) : (
                      <XCircleFill size={14} />
                    )}
                    <span>Las contraseñas coinciden</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: "fit-content",
                    marginTop: "16px",
                    opacity: !passwordFormValido || updatingPassword ? 0.6 : 1,
                    cursor:
                      !passwordFormValido || updatingPassword
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={!passwordFormValido || updatingPassword}
                >
                  {updatingPassword ? "Guardando..." : "Cambiar Contraseña"}
                </button>
              </form>
            </div>
          ) : null}
        </main>
      </div>

      {/* Sub-modal: Detalle de Cotización */}
      {detalleCotizacion && (
        <div
          className="my-account-modal-overlay animate-fade"
          onClick={() => setDetalleCotizacion(null)}
        >
          <div
            className="my-account-modal animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="my-account-modal-header">
              <h3>Detalle de Cotización #{detalleCotizacion.id}</h3>
              <button
                className="my-account-modal-close"
                onClick={() => setDetalleCotizacion(null)}
              >
                ×
              </button>
            </div>

            <div className="my-account-modal-body">
              <div className="my-account-info-grid">
                <div className="my-account-info-item">
                  <span className="my-account-info-label">
                    Nombre de contacto
                  </span>
                  <span className="my-account-info-value">
                    {detalleCotizacion.clienteNombre}
                  </span>
                </div>
                <div className="my-account-info-item">
                  <span className="my-account-info-label">Teléfono</span>
                  <span className="my-account-info-value">
                    {detalleCotizacion.clienteTelefono}
                  </span>
                </div>
                <div className="my-account-info-item">
                  <span className="my-account-info-label">Dirección</span>
                  <span className="my-account-info-value">
                    <GeoAlt size={12} /> {detalleCotizacion.direccion || "---"}
                  </span>
                </div>
                <div className="my-account-info-item">
                  <span className="my-account-info-label">Estado</span>
                  <div>
                    <span
                      className={`my-account-badge badge-${detalleCotizacion.estado.toLowerCase()}`}
                    >
                      {detalleCotizacion.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="my-account-modal-section-title">
                  Productos Solicitados
                </h5>
                <div className="my-account-table-wrapper">
                  <table className="my-account-modal-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th style={{ textAlign: "center" }}>Código</th>
                        <th style={{ textAlign: "center" }}>Cant.</th>
                        <th style={{ textAlign: "right" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleCotizacion.detalles.map((d) => (
                        <tr key={d.id}>
                          <td>{d.productoNombre}</td>
                          <td
                            style={{
                              textAlign: "center",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {d.productoCodigo}
                          </td>
                          <td
                            style={{ textAlign: "center", fontWeight: "600" }}
                          >
                            {d.cantidad}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              color: "var(--color-primary)",
                              fontWeight: "700",
                            }}
                          >
                            {formatoMoneda(d.subtotal)}
                          </td>
                        </tr>
                      ))}
                      <tr
                        style={{
                          borderTop: "2px solid var(--color-border)",
                          backgroundColor: "var(--color-background)",
                          fontWeight: "700",
                        }}
                      >
                        <td
                          colSpan="3"
                          style={{ padding: "10px", textAlign: "right" }}
                        >
                          Total Estimado:
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            textAlign: "right",
                            color: "var(--color-primary)",
                          }}
                        >
                          {formatoMoneda(detalleCotizacion.totalEstimado)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {detalleCotizacion.observaciones && (
                <div>
                  <h5 className="my-account-modal-section-title">
                    Observaciones
                  </h5>
                  <p className="my-account-observations">
                    {detalleCotizacion.observaciones}
                  </p>
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
