import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ShieldCheck } from "react-bootstrap-icons";
import { login } from "../api/authService";
import { Toast } from "../utils/alerts";

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
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
        err.response?.data?.message || err.message || "Credenciales inválidas. Intente de nuevo.";
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

  return (
    <main className="login-shell">
      <section className="login-brand-panel" aria-label="Óptica Divino Niño Del Milagro">
        <div className="login-brand-mark">
          <Eye />
        </div>
        <div>
          <p className="login-eyebrow">Sistema interno</p>
          <h1>Óptica Divino Niño Del Milagro</h1>
          <p>
            Acceso privado para administrar ventas, inventario, caja y atención al cliente.
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

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="form-label" htmlFor="username">Usuario</label>
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
              <label className="form-label" htmlFor="password">Contraseña</label>
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

            <button type="submit" disabled={loading} className="btn-primary login-submit">
              {loading ? "Validando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;
