import { useState } from "react";
import axios from "axios";
import { Search, ExclamationTriangle } from "react-bootstrap-icons";
import { Toast, confirmarAccion, mostrarAlerta } from "../../utils/alerts";
import {
  ModalShell,
  SeccionLabel,
  Divider,
} from "../../components/ui/ModalShell";

const ModalCrearCliente = ({ cerrarModal, recargarTabla }) => {
  const [dni, setDni] = useState("");
  const [datosDni, setDatosDni] = useState(null);
  const [loadingDni, setLoadingDni] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apePaterno, setApePaterno] = useState("");
  const [apeMaterno, setApeMaterno] = useState("");

  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // 🎯 Helpers UI
  const inputError = (campo) =>
    `input-control ${errores[campo] ? "border-red-500" : ""}`;

  const msgError = (campo) =>
    errores[campo] && (
      <span style={{ color: "var(--danger)", fontSize: "11px" }}>
        {errores[campo]}
      </span>
    );

  // 🔎 CONSULTAR DNI
  const consultarDni = async () => {
    if (!dni || dni.length !== 8) {
      setErrores({ dni: "Debe tener 8 dígitos." });
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
        Toast.fire({ icon: "error", title: "DNI no encontrado" });
      }
    } catch {
      Toast.fire({ icon: "error", title: "Error al consultar DNI" });
    } finally {
      setLoadingDni(false);
    }
  };

  // 🧪 VALIDAR
  const validar = () => {
    const err = {};

    if (!dni || dni.length !== 8) err.dni = "DNI inválido";
    if (!datosDni) err.general = "Debe consultar el DNI";
    if (!correo.includes("@")) err.correo = "Correo inválido";
    if (telefono && telefono.length !== 9)
      err.telefono = "Debe tener 9 dígitos";
    if (!direccion.trim()) err.direccion = "Dirección obligatoria";

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  // 💾 GUARDAR
  const handleGuardar = async () => {
    if (!validar()) return;

    setGuardando(true);

    try {
      await axios.post(
        "/api/v1/clientes",
        {
          numeroDocumento: dni,
          correo,
          telefono,
          direccion,
          idTipoDocumento: 1,
        },
        { headers },
      );

      Toast.fire({ icon: "success", title: "Cliente registrado" });
      recargarTabla();
      cerrarModal();
    } catch (e) {
      const msg = e.response?.data?.message || "";

      if (msg.includes("reactivarlo")) {
        const confirmacion = await confirmarAccion(
          "Cliente eliminado",
          msg,
          "Reactivar",
          "warning",
        );

        if (confirmacion.isConfirmed) {
          await axios.patch(
            `/api/v1/clientes/reactivar/${dni}`,
            {},
            { headers },
          );
          Toast.fire({ icon: "success", title: "Cliente reactivado" });
          recargarTabla();
          cerrarModal();
        }
      } else {
        mostrarAlerta("Error", msg, "error");
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalShell
      titulo="Registrar Cliente"
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
            {guardando ? "Guardando..." : "Guardar Cliente"}
          </button>
        </>
      }
    >
      {/* ERROR GENERAL */}
      {errores.general && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
            color: "#dc2626",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          <ExclamationTriangle /> {errores.general}
        </div>
      )}

      {/* IDENTIFICACIÓN */}
      <SeccionLabel text="Identificación" />

      <div className="form-grid">
        <div>
          <label className="label-control">Nº Documento *</label>

          <div style={{ display: "flex", gap: "6px" }}>
            <input
              className={inputError("dni")}
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
              {loadingDni ? "..." : <Search />}
            </button>
          </div>

          {msgError("dni")}
        </div>
      </div>

      {/* DNI OK */}
      {datosDni && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "10px",
            borderRadius: "6px",
            color: "#166534",
            fontSize: "12px",
            marginBottom: "10px",
            fontWeight: "600",
          }}
        >
          ✅ {nombre} {apePaterno} {apeMaterno}
        </div>
      )}

      {/* DATOS PERSONALES */}
      <div className="form-grid">
        <div>
          <label className="label-control">Nombre</label>
          <input className="input-control" value={nombre} disabled />
        </div>

        <div>
          <label className="label-control">Apellido Paterno</label>
          <input className="input-control" value={apePaterno} disabled />
        </div>

        <div>
          <label className="label-control">Apellido Materno</label>
          <input className="input-control" value={apeMaterno} disabled />
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
            placeholder="ejemplo@correo.com"
          />
          {msgError("correo")}
        </div>

        <div>
          <label className="label-control">Teléfono</label>
          <input
            className={inputError("telefono")}
            value={telefono}
            onChange={(e) =>
              setTelefono(e.target.value.replace(/\D/g, "").slice(0, 9))
            }
            placeholder="987654321"
          />
          {msgError("telefono")}
        </div>

        <div>
          <label className="label-control">Dirección *</label>
          <input
            className={inputError("direccion")}
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          {msgError("direccion")}
        </div>
      </div>
    </ModalShell>
  );
};

export default ModalCrearCliente;
