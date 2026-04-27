import { useState } from "react";
import axios from "axios";
import { Toast, mostrarAlerta } from "../../utils/alerts";
import {
  ModalShell,
  SeccionLabel,
  Divider,
} from "../../components/ui/ModalShell";

const ModalCrearEmpleado = ({ cerrarModal, recargarTabla, perfiles }) => {
  const [dni, setDni] = useState("");
  const [datosDni, setDatosDni] = useState(null);
  const [loadingDni, setLoadingDni] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apePaterno, setApePaterno] = useState("");
  const [apeMaterno, setApeMaterno] = useState("");

  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [idPerfil, setIdPerfil] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const consultarDni = async () => {
    if (!dni || dni.length !== 8) {
      setErrores({ dni: "El DNI debe tener 8 dígitos" });
      return;
    }
    setErrores({});
    setLoadingDni(true);
    try {
      const res = await axios.get(`/api/v1/dni/${dni}`, { headers });
      if (res.data?.success) {
        const d = res.data.datos;
        setDatosDni(d);
        setNombre(d.nombres);
        setApePaterno(d.ape_paterno);
        setApeMaterno(d.ape_materno);
        setDireccion(d.domiciliado?.direccion || "");
      } else {
        Toast.fire({ icon: "error", title: "DNI no encontrado en RENIEC" });
        setDatosDni(null);
      }
    } catch {
      Toast.fire({ icon: "error", title: "Error de conexión con la API" });
    } finally {
      setLoadingDni(false);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!dni || dni.length !== 8)
      nuevosErrores.dni = "Debe tener exactamente 8 dígitos.";
    if (!datosDni)
      nuevosErrores.general = "Debe consultar el DNI para obtener los nombres.";
    if (!correo || !regexCorreo.test(correo))
      nuevosErrores.correo = "Formato de correo inválido.";
    if (!telefono || telefono.length !== 9)
      nuevosErrores.telefono = "Debe tener exactamente 9 dígitos.";
    if (!direccion || !direccion.trim())
      nuevosErrores.direccion = "La dirección es obligatoria.";
    if (!idPerfil) nuevosErrores.idPerfil = "Seleccione un perfil de acceso.";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0; // Retorna true si no hay errores
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      Toast.fire({
        icon: "warning",
        title: "Por favor, revise los campos marcados",
      });
      return;
    }

    setGuardando(true);
    try {
      await axios.post(
        "/api/v1/empleados",
        {
          dni,
          correo,
          telefono,
          direccion,
          idPerfil: Number(idPerfil),
        },
        { headers },
      );

      Toast.fire({
        icon: "success",
        title: "Empleado registrado exitosamente",
      });
      recargarTabla();
      cerrarModal();
    } catch (e) {
      mostrarAlerta(
        "Error de Registro",
        e.response?.data?.message || "Hubo un error al guardar",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  // Helper para pintar el borde rojo si hay error
  const inputEstilo = (campo) =>
    `input-control ${errores[campo] ? "border-red-500" : ""}`;
  const msgError = (campo) =>
    errores[campo] && (
      <span
        style={{
          color: "var(--danger)",
          fontSize: "11px",
          marginTop: "4px",
          display: "block",
        }}
      >
        {errores[campo]}
      </span>
    );

  return (
    <ModalShell
      titulo="Registrar Nuevo Empleado"
      onClose={cerrarModal}
      footer={
        <>
          <button className="btn-secondary" onClick={cerrarModal}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Empleado"}
          </button>
        </>
      }
    >
      {errores.general && (
        <div
          style={{
            background: "#fef2f2",
            color: "#dc2626",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
            fontSize: "13px",
            fontWeight: "bold",
            border: "1px solid #fecaca",
          }}
        >
          ⚠ {errores.general}
        </div>
      )}

      <SeccionLabel text="Identificación" />
      <div className="form-grid">
        <div>
          <label className="label-control">Nº Documento (DNI) *</label>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              className={inputEstilo("dni")}
              value={dni}
              onChange={(e) =>
                setDni(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              placeholder="12345678"
            />
            <button
              className="btn-secondary"
              onClick={consultarDni}
              disabled={loadingDni}
            >
              {loadingDni ? "⏳" : "🔍"}
            </button>
          </div>
          {msgError("dni")}
        </div>
      </div>

      {datosDni && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "10px",
            borderRadius: "6px",
            color: "#15803d",
            fontSize: "12px",
            marginBottom: "15px",
            fontWeight: "bold",
          }}
        >
          ✅ {nombre} {apePaterno} {apeMaterno}
        </div>
      )}

      <Divider />

      <SeccionLabel text="Contacto y Acceso" />
      <div className="form-grid">
        <div>
          <label className="label-control">Correo Electrónico *</label>
          <input
            className={inputEstilo("correo")}
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@correo.com"
          />
          {msgError("correo")}
        </div>
        <div>
          <label className="label-control">Teléfono Celular *</label>
          <input
            className={inputEstilo("telefono")}
            value={telefono}
            onChange={(e) =>
              setTelefono(e.target.value.replace(/\D/g, "").slice(0, 9))
            }
            placeholder="987654321"
          />
          {msgError("telefono")}
        </div>
        <div>
          <label className="label-control">Perfil de Acceso *</label>
          <select
            className={inputEstilo("idPerfil")}
            value={idPerfil}
            onChange={(e) => setIdPerfil(e.target.value)}
          >
            <option value="">-- Seleccione --</option>
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          {msgError("idPerfil")}
        </div>
        <div>
          <label className="label-control">Dirección Exacta *</label>
          <input
            className={inputEstilo("direccion")}
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Av. Los Incas 123"
          />
          {msgError("direccion")}
        </div>
      </div>
    </ModalShell>
  );
};

export default ModalCrearEmpleado;
