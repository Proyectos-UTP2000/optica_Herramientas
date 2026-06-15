import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { Toast } from "../utils/alerts";
import { X, Eye, EyeSlash } from "react-bootstrap-icons";

const AuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // true = login, false = register
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  // Register additional states
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [idTipoDocumento, setIdTipoDocumento] = useState("1"); // 1 = DNI, 2 = RUC
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsLogin(true);
    };
    window.addEventListener("open-login-modal", handleOpen);
    return () => {
      window.removeEventListener("open-login-modal", handleOpen);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Reset form
    setCorreo("");
    setContrasena("");
    setNombre("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setIdTipoDocumento("1");
    setNumeroDocumento("");
    setDireccion("");
    setTelefono("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // Login flow
        const response = await api.post("/api/v1/auth/cliente/login", {
          username: correo,
          password: contrasena,
        });
        const { token, username, empleadoId } = response.data;
        localStorage.setItem("token_cliente", token);
        localStorage.setItem("username_cliente", username);
        localStorage.setItem("id_cliente", empleadoId);

        Toast.fire({ icon: "success", title: "Sesión iniciada con éxito" });
        window.dispatchEvent(new Event("cliente-session-changed"));
        handleClose();
      } else {
        // Register flow
        const payload = {
          nombre,
          apellidoPaterno,
          apellidoMaterno,
          numeroDocumento,
          idTipoDocumento: parseInt(idTipoDocumento),
          direccion,
          telefono,
          correo,
          contrasena,
        };
        await api.post("/api/v1/auth/cliente/register", payload);
        Toast.fire({
          icon: "success",
          title: "Registro exitoso. Ahora puedes iniciar sesión.",
        });
        setIsLogin(true);
        setContrasena("");
      }
    } catch (error) {
      console.error("Auth error:", error);
      const errMsg =
        error.response?.data ||
        "Ocurrió un error inesperado. Inténtelo de nuevo.";
      Toast.fire({
        icon: "error",
        title: typeof errMsg === "string" ? errMsg : "Error en la operación",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)",
      padding: "20px",
    },
    modal: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      width: "min(500px, 100%)",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      overflow: "hidden",
    },
    header: {
      padding: "20px 24px",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0,
    },
    closeBtn: {
      background: "none",
      border: "none",
      color: "#64748b",
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      alignItems: "center",
    },
    body: {
      padding: "24px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#475569",
    },
    input: {
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 150ms",
      width: "100%",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
    },
    passwordWrapper: {
      position: "relative",
    },
    eyeIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#64748b",
      cursor: "pointer",
    },
    submitBtn: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      padding: "12px",
      fontWeight: "700",
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "background-color 150ms",
      marginTop: "10px",
    },
    toggleText: {
      textAlign: "center",
      fontSize: "13px",
      color: "#64748b",
      marginTop: "10px",
    },
    toggleLink: {
      color: "#2563eb",
      fontWeight: "600",
      textDecoration: "underline",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.overlay} onMouseDown={handleClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            {isLogin ? "Iniciar Sesión" : "Crear una Cuenta"}
          </h3>
          <button style={styles.closeBtn} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.body}>
          {!isLogin && (
            <>
              {/* Register Fields */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombres *</label>
                <input
                  type="text"
                  placeholder="Ingresa tus nombres"
                  style={styles.input}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Apellido Paterno</label>
                  <input
                    type="text"
                    placeholder="Apellido Paterno"
                    style={styles.input}
                    value={apellidoPaterno}
                    onChange={(e) => setApellidoPaterno(e.target.value)}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Apellido Materno</label>
                  <input
                    type="text"
                    placeholder="Apellido Materno"
                    style={styles.input}
                    value={apellidoMaterno}
                    onChange={(e) => setApellidoMaterno(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tipo de Documento *</label>
                  <select
                    style={{ ...styles.input, appearance: "auto" }}
                    value={idTipoDocumento}
                    onChange={(e) => setIdTipoDocumento(e.target.value)}
                    required
                  >
                    <option value="1">DNI</option>
                    <option value="2">RUC</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Número de Documento *</label>
                  <input
                    type="text"
                    placeholder="Número de Documento"
                    style={styles.input}
                    value={numeroDocumento}
                    onChange={(e) =>
                      setNumeroDocumento(e.target.value.replace(/\D/g, ""))
                    }
                    required
                    maxLength={idTipoDocumento === "1" ? 8 : 11}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Dirección *</label>
                <input
                  type="text"
                  placeholder="Dirección física de domicilio"
                  style={styles.input}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Teléfono / Celular *</label>
                <input
                  type="tel"
                  placeholder="Ej: 999999999"
                  style={styles.input}
                  value={telefono}
                  onChange={(e) =>
                    setTelefono(e.target.value.replace(/[^\d+]/g, ""))
                  }
                  required
                />
              </div>
            </>
          )}

          {/* Email / Username field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico *</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              style={styles.input}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          {/* Password field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña *</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder={
                  isLogin ? "Ingresa tu contraseña" : "Mínimo 6 caracteres"
                }
                style={{ ...styles.input, paddingRight: "40px" }}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                minLength={isLogin ? undefined : 6}
              />
              <div
                style={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Procesando..." : isLogin ? "Ingresar" : "Registrarse"}
          </button>

          <p style={styles.toggleText}>
            {isLogin ? "¿No tienes una cuenta aún?" : "¿Ya tienes una cuenta?"}{" "}
            <span
              style={styles.toggleLink}
              onClick={() => {
                setIsLogin(!isLogin);
                setShowPassword(false);
              }}
            >
              {isLogin ? "Regístrate" : "Inicia Sesión"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
