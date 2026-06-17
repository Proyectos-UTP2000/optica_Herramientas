import { useState } from "react";
import api from "../api/axiosConfig";
import { Toast } from "../utils/alerts";
import {
  LockFill,
  CheckCircleFill,
  XCircleFill,
  EyeFill,
  EyeSlashFill,
  ShieldLockFill,
} from "react-bootstrap-icons";

const Configuracion = () => {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const [cargando, setCargando] = useState(false);

  // Requisitos de contraseña
  const hasMinLength = passwordNueva.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordNueva);
  const hasLowercase = /[a-z]/.test(passwordNueva);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]~;\/\\]/.test(
    passwordNueva,
  );
  const passwordsMatch =
    passwordNueva === confirmarPassword && passwordNueva !== "";

  const formValido =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasSpecialChar &&
    passwordsMatch &&
    passwordActual.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValido) return;

    setCargando(true);
    try {
      await api.put("/api/v1/empleados/perfil/contrasena", {
        passwordActual,
        passwordNueva,
      });
      Toast.fire({
        icon: "success",
        title: "Contraseña actualizada exitosamente",
      });
      setPasswordActual("");
      setPasswordNueva("");
      setConfirmarPassword("");
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        "Ocurrió un error al cambiar la contraseña.";
      Toast.fire({
        icon: "error",
        title: msg,
      });
    } finally {
      setCargando(false);
    }
  };

  const renderRequirement = (label, met) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: met ? "#10b981" : "#ef4444",
          marginBottom: "6px",
        }}
      >
        {met ? <CheckCircleFill size={14} /> : <XCircleFill size={14} />}
        <span>{label}</span>
      </div>
    );
  };

  const styles = {
    container: {
      padding: "30px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      borderBottom: "2px solid #e2e8f0",
      paddingBottom: "15px",
    },
    title: {
      fontSize: "26px",
      color: "#1e293b",
      margin: 0,
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "28px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e2e8f0",
      maxWidth: "600px",
      margin: "0 auto",
    },
    cardTitle: {
      fontSize: "18px",
      color: "#334155",
      fontWeight: "600",
      marginBottom: "20px",
      borderBottom: "1px solid #f1f5f9",
      paddingBottom: "10px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      color: "#475569",
      fontWeight: "600",
      marginBottom: "8px",
    },
    inputGroup: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      marginBottom: "20px",
    },
    inputIcon: {
      position: "absolute",
      left: "12px",
      color: "#94a3b8",
    },
    input: {
      width: "100%",
      padding: "10px 40px 10px 38px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      color: "#334155",
      outline: "none",
      transition: "border-color 0.2s",
    },
    eyeBtn: {
      position: "absolute",
      right: "12px",
      background: "none",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      padding: 0,
      display: "flex",
      alignItems: "center",
    },
    requirementsCard: {
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "24px",
    },
    reqTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#475569",
      marginBottom: "10px",
    },
    btnSubmit: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "15px",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <ShieldLockFill /> Seguridad y Cuenta
        </h2>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Cambiar Contraseña</h3>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Contraseña Actual</label>
          <div style={styles.inputGroup}>
            <LockFill style={styles.inputIcon} />
            <input
              type={showActual ? "text" : "password"}
              placeholder="Introduce tu contraseña actual"
              style={styles.input}
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              required
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowActual(!showActual)}
            >
              {showActual ? <EyeSlashFill size={16} /> : <EyeFill size={16} />}
            </button>
          </div>

          <label style={styles.label}>Nueva Contraseña</label>
          <div style={styles.inputGroup}>
            <LockFill style={styles.inputIcon} />
            <input
              type={showNueva ? "text" : "password"}
              placeholder="Introduce tu nueva contraseña"
              style={styles.input}
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              required
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowNueva(!showNueva)}
            >
              {showNueva ? <EyeSlashFill size={16} /> : <EyeFill size={16} />}
            </button>
          </div>

          <label style={styles.label}>Confirmar Nueva Contraseña</label>
          <div style={styles.inputGroup}>
            <LockFill style={styles.inputIcon} />
            <input
              type={showConfirmar ? "text" : "password"}
              placeholder="Repite tu nueva contraseña"
              style={styles.input}
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowConfirmar(!showConfirmar)}
            >
              {showConfirmar ? (
                <EyeSlashFill size={16} />
              ) : (
                <EyeFill size={16} />
              )}
            </button>
          </div>

          <div style={styles.requirementsCard}>
            <div style={styles.reqTitle}>Requisitos de la contraseña:</div>
            {renderRequirement("Mínimo 8 caracteres", hasMinLength)}
            {renderRequirement("Al menos una letra mayúscula", hasUppercase)}
            {renderRequirement("Al menos una letra minúscula", hasLowercase)}
            {renderRequirement(
              "Al menos un carácter especial (ej: !@#$%^&*)",
              hasSpecialChar,
            )}
            {renderRequirement("Las contraseñas coinciden", passwordsMatch)}
          </div>

          <button
            type="submit"
            style={{
              ...styles.btnSubmit,
              opacity: !formValido || cargando ? 0.6 : 1,
              cursor: !formValido || cargando ? "not-allowed" : "pointer",
            }}
            disabled={!formValido || cargando}
          >
            {cargando ? "Guardando..." : "Cambiar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Configuracion;
