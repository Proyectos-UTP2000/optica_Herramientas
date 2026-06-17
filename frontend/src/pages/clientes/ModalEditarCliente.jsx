import { useState } from "react";
import axios from "axios";
import { Toast, mostrarAlerta } from "../../utils/alerts";
import {
  ModalShell,
  SeccionLabel,
  Divider,
} from "../../components/ui/ModalShell";

const ModalEditarCliente = ({ cliente, cerrarModal, recargarTabla }) => {
  const [correo, setCorreo] = useState(() => cliente?.correo || "");
  const [telefono, setTelefono] = useState(() => cliente?.telefono || "");
  const [direccion, setDireccion] = useState(() => cliente?.direccion || "");

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  if (!cliente) return null;

  // 🧪 VALIDACIÓN
  const validar = () => {
    const err = {};

    if (correo && !correo.includes("@")) err.correo = "Correo inválido";
    if (telefono && telefono.length !== 9)
      err.telefono = "Debe tener 9 dígitos";

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  // 💾 GUARDAR
  const handleGuardar = async () => {
    if (!validar()) return;

    setGuardando(true);

    try {
      await axios.put(
        `/api/v1/clientes/${cliente.id}`,
        {
          correo,
          telefono,
          direccion,
        },
        { headers },
      );

      Toast.fire({
        icon: "success",
        title: "Cliente actualizado",
      });

      recargarTabla();
      cerrarModal();
    } catch (e) {
      mostrarAlerta(
        "Error",
        e.response?.data?.message || "No se pudo actualizar",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  const inputError = (campo) =>
    `input-control ${errores[campo] ? "border-red-500" : ""}`;

  return (
    <ModalShell
      titulo="Editar Cliente"
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
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </>
      }
    >
      {/* INFO GENERAL */}
      <SeccionLabel text="Información del Cliente" />

      <div className="form-grid">
        <div>
          <label className="label-control">Nombre</label>
          <input
            className="input-control"
            value={cliente.nombreCompleto}
            disabled
          />
        </div>

        <div>
          <label className="label-control">Documento</label>
          <input
            className="input-control"
            value={cliente.numeroDocumento}
            disabled
          />
        </div>
      </div>

      <Divider />

      {/* CONTACTO */}
      <SeccionLabel text="Contacto" />

      <div className="form-grid">
        <div>
          <label className="label-control">Correo</label>
          <input
            className={inputError("correo")}
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          {errores.correo && (
            <span style={{ color: "red", fontSize: "11px" }}>
              {errores.correo}
            </span>
          )}
        </div>

        <div>
          <label className="label-control">Teléfono</label>
          <input
            className={inputError("telefono")}
            value={telefono}
            onChange={(e) =>
              setTelefono(e.target.value.replace(/\D/g, "").slice(0, 9))
            }
          />
          {errores.telefono && (
            <span style={{ color: "red", fontSize: "11px" }}>
              {errores.telefono}
            </span>
          )}
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label className="label-control">Dirección</label>
          <input
            className="input-control"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
        </div>
      </div>
    </ModalShell>
  );
};

export default ModalEditarCliente;
