import { useState, useEffect } from "react";
import axios from "axios";
import { Toast, mostrarAlerta } from "../../utils/alerts";
import {
  ModalShell,
  SeccionLabel,
  Divider,
} from "../../components/ui/ModalShell";

const ModalEditarEmpleado = ({
  empleado,
  cerrarModal,
  recargarTabla,
  perfiles,
}) => {
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [idPerfil, setIdPerfil] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Cargar los datos del empleado seleccionado al abrir el modal
  useEffect(() => {
    if (empleado) {
      setCorreo(empleado.correo || "");
      setTelefono(empleado.telefono || "");
      setDireccion(empleado.direccion || "");

      const perfilEncontrado = perfiles.find(
        (p) => p.nombre === empleado.perfilNombre,
      );
      if (perfilEncontrado) setIdPerfil(perfilEncontrado.id);
    }
  }, [empleado, perfiles]);

  const validarFormulario = () => {
    const nuevosErrores = {};
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correo || !regexCorreo.test(correo))
      nuevosErrores.correo = "Formato de correo inválido.";
    if (!telefono || telefono.length !== 9)
      nuevosErrores.telefono = "Debe tener exactamente 9 dígitos.";
    if (!direccion || !direccion.trim())
      nuevosErrores.direccion = "La dirección es obligatoria.";
    if (!idPerfil) nuevosErrores.idPerfil = "Seleccione un perfil de acceso.";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleActualizar = async () => {
    if (!validarFormulario()) {
      Toast.fire({
        icon: "warning",
        title: "Por favor, revise los campos marcados",
      });
      return;
    }

    setGuardando(true);
    try {
      await axios.put(
        `/api/v1/empleados/${empleado.id}`,
        {
          dni: empleado.dni,
          correo,
          telefono,
          direccion,
          idPerfil: Number(idPerfil),
        },
        { headers },
      );

      Toast.fire({
        icon: "success",
        title: "Datos actualizados correctamente",
      });
      recargarTabla();
      cerrarModal();
    } catch (e) {
      mostrarAlerta(
        "Error de Actualización",
        e.response?.data?.message || "No se pudo actualizar",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

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
      titulo="Editar Empleado"
      onClose={cerrarModal}
      footer={
        <>
          <button className="btn-secondary" onClick={cerrarModal}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleActualizar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </>
      }
    >
      <SeccionLabel text="Datos No Editables" />
      <div className="form-grid">
        <div>
          <label className="label-control">Nombre Completo</label>
          <input
            className="input-control"
            value={`${empleado.nombres} ${empleado.apellidos}`}
            disabled
            style={{
              background: "var(--bg-light)",
              color: "var(--text-muted)",
            }}
          />
        </div>
        <div>
          <label className="label-control">Nº Documento</label>
          <input
            className="input-control"
            value={empleado.dni}
            disabled
            style={{
              background: "var(--bg-light)",
              color: "var(--text-muted)",
            }}
          />
        </div>
      </div>

      <Divider />

      <SeccionLabel text="Datos de Contacto y Rol" />
      <div className="form-grid">
        <div>
          <label className="label-control">Correo Electrónico *</label>
          <input
            className={inputEstilo("correo")}
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
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
          />
          {msgError("direccion")}
        </div>
      </div>
    </ModalShell>
  );
};

export default ModalEditarEmpleado;
