import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  ShieldCheck,
  ArrowLeft,
  CheckCircleFill,
  XCircleFill,
} from "react-bootstrap-icons";
import { login } from "../api/authService";
import { Toast } from "../utils/alerts";
import axios from "axios";

const Login = ({ onLoginSuccess }) => {
  const [view, setView] = useState("login"); // "login" | "forgot" | "reset"
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  // Recovery States
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password requirements checks
  const hasMinLength = nuevaContrasena.length >= 8;
  const hasUppercase = /[A-Z]/.test(nuevaContrasena);
  const hasLowercase = /[a-z]/.test(nuevaContrasena);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]~;\/\\]/.test(
    nuevaContrasena,
  );
  const passwordsMatch =
    nuevaContrasena === confirmarContrasena && nuevaContrasena !== "";

  const passwordValido =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasSpecialChar &&
    passwordsMatch;

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(credentials.username, credentials.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("rol", data.rol);
      localStorage.setItem("empleadoId", data.empleadoId);

      Toast.fire({
        icon: "success",
        title: `¡Bienvenido(a), ${data.username}!`,
      });

      if (onLoginSuccess) onLoginSuccess();
      navigate("/");
    } catch (err) {
      const mensajeError =
        err.response?.data?.message ||
        err.message ||
        "Credenciales inválidas. Intente de nuevo.";
      setError(mensajeError);
      Toast.fire({
        icon: "error",
        title: "Error de acceso",
        text: mensajeError,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) return;

    setLoading(true);
    setError("");
    try {
      await axios.post("/api/v1/auth/recuperar-contrasena", {
        correo: emailOrUsername,
      });
      Toast.fire({
        icon: "success",
        title: "Código enviado",
        text: "Se ha enviado un código de verificación de 6 dígitos a tu correo registrado.",
      });
      setView("reset");
    } catch (err) {
      const mensajeError =
        err.response?.data ||
        err.response?.data?.message ||
        err.message ||
        "No se pudo enviar el código de recuperación.";
      setError(mensajeError);
      Toast.fire({
        icon: "error",
        title: "Error",
        text:
          typeof mensajeError === "string"
            ? mensajeError
            : "No se encontró el usuario.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!passwordValido || !codigo.trim()) return;

    setLoading(true);
    setError("");
    try {
      await axios.post("/api/v1/auth/restablecer-contrasena", {
        emailOrUsername: emailOrUsername,
        codigo: codigo,
        nuevaContrasena: nuevaContrasena,
      });
      Toast.fire({
        icon: "success",
        title: "Contraseña restablecida",
        text: "Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.",
      });
      // Limpiar campos y volver al login
      setCredentials({ username: emailOrUsername, password: "" });
      setEmailOrUsername("");
      setCodigo("");
      setNuevaContrasena("");
      setConfirmarContrasena("");
      setView("login");
    } catch (err) {
      const mensajeError =
        err.response?.data ||
        err.response?.data?.message ||
        err.message ||
        "Error al restablecer contraseña.";
      setError(mensajeError);
      Toast.fire({
        icon: "error",
        title: "Error",
        text:
          typeof mensajeError === "string"
            ? mensajeError
            : "Código inválido o expirado.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRequirement = (label, met) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: met ? "#10b981" : "#ef4444",
          marginTop: "4px",
        }}
      >
        {met ? <CheckCircleFill size={12} /> : <XCircleFill size={12} />}
        <span>{label}</span>
      </div>
    );
  };

  return (
    <main className="login-shell">
      <section
        className="login-brand-panel"
        aria-label="Óptica Divino Niño Del Milagro"
      >
        <div className="login-brand-mark">
          <Eye />
        </div>
        <div>
          <p className="login-eyebrow">Sistema interno</p>
          <h1>Óptica Divino Niño Del Milagro</h1>
          <p>
            Acceso privado para administrar ventas, inventario, caja y atención
            al cliente.
          </p>
        </div>
        <div className="login-brand-strip">
          <span>Clientes</span>
          <span>Inventario</span>
          <span>Reportes</span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          {view === "login" && (
            <>
              <div className="login-card-header">
                <div className="login-security-icon">
                  <ShieldCheck />
                </div>
                <div>
                  <h2>Iniciar sesión</h2>
                  <p>Ingresa tus credenciales para continuar.</p>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleLoginSubmit} className="login-form">
                <div>
                  <label className="form-label" htmlFor="username">
                    Usuario o Correo
                  </label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    className="input-control login-input"
                    value={credentials.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="password">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    className="input-control login-input"
                    value={credentials.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "-8px",
                    marginBottom: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setView("forgot");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary login-submit"
                >
                  {loading ? "Validando..." : "Ingresar"}
                </button>
              </form>
            </>
          )}

          {view === "forgot" && (
            <>
              <div className="login-card-header">
                <div
                  className="login-security-icon"
                  style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                >
                  <ShieldCheck />
                </div>
                <div>
                  <h2>Recuperar Contraseña</h2>
                  <p>Ingresa tu correo o usuario para recibir el código.</p>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleForgotSubmit} className="login-form">
                <div>
                  <label className="form-label" htmlFor="recoveryEmail">
                    Usuario o Correo Registrado
                  </label>
                  <input
                    id="recoveryEmail"
                    type="text"
                    className="input-control login-input"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="ejemplo@correo.com o usuario123"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !emailOrUsername.trim()}
                  className="btn-primary login-submit"
                >
                  {loading ? "Enviando..." : "Enviar Código"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setView("login");
                  }}
                  className="login-submit"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "-8px",
                  }}
                >
                  <ArrowLeft size={16} /> Volver al Inicio
                </button>
              </form>
            </>
          )}

          {view === "reset" && (
            <>
              <div className="login-card-header">
                <div
                  className="login-security-icon"
                  style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}
                >
                  <ShieldCheck />
                </div>
                <div>
                  <h2>Restablecer Contraseña</h2>
                  <p>
                    Ingresa el código enviado a tu correo y tu nueva contraseña.
                  </p>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleResetSubmit} className="login-form">
                <div>
                  <label className="form-label" htmlFor="resetCode">
                    Código de 6 Dígitos
                  </label>
                  <input
                    id="resetCode"
                    type="text"
                    maxLength={6}
                    className="input-control login-input"
                    style={{
                      textAlign: "center",
                      letterSpacing: "6px",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="000000"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="newPassword">
                    Nueva Contraseña
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="input-control login-input"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="confirmNewPassword">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    className="input-control login-input"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    required
                  />
                </div>

                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {renderRequirement("Mínimo 8 caracteres", hasMinLength)}
                  {renderRequirement(
                    "Al menos una letra mayúscula",
                    hasUppercase,
                  )}
                  {renderRequirement(
                    "Al menos una letra minúscula",
                    hasLowercase,
                  )}
                  {renderRequirement(
                    "Al menos un carácter especial",
                    hasSpecialChar,
                  )}
                  {renderRequirement(
                    "Las contraseñas coinciden",
                    passwordsMatch,
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !passwordValido || !codigo}
                  className="btn-primary login-submit"
                  style={{ opacity: !passwordValido || !codigo ? 0.6 : 1 }}
                >
                  {loading ? "Procesando..." : "Restablecer Contraseña"}
                </button>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "-8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setView("forgot");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      fontSize: "13px",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Reenviar Código
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setView("login");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Volver a Iniciar Sesión
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Login;
