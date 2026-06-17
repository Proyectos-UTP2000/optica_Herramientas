import { useState } from "react";
import axios from "axios";
import { Search, ExclamationTriangle } from "react-bootstrap-icons";
import { Toast, confirmarAccion, mostrarAlerta } from "../../utils/alerts";
import {
  ModalShell,
  SeccionLabel,
  Divider,
} from "../../components/ui/ModalShell";

const TIPOS_DOCUMENTO = {
  DNI: { id: 1, label: "DNI", longitud: 8, endpoint: "dni" },
  RUC: { id: 2, label: "RUC", longitud: 11, endpoint: "ruc" },
};

const ModalCrearCliente = ({ cerrarModal, recargarTabla }) => {
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [datosConsultados, setDatosConsultados] = useState(null);
  const [loadingDocumento, setLoadingDocumento] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apePaterno, setApePaterno] = useState("");
  const [apeMaterno, setApeMaterno] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccionFiscal, setDireccionFiscal] = useState("");

  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const configTipo = TIPOS_DOCUMENTO[tipoDocumento];
  const esRuc = tipoDocumento === "RUC";

  const inputError = (campo) =>
    `input-control ${errores[campo] ? "border-red-500" : ""}`;

  const msgError = (campo) =>
    errores[campo] && (
      <span style={{ color: "var(--danger)", fontSize: "11px" }}>
        {errores[campo]}
      </span>
    );

  const limpiarIdentificacion = (nuevoTipo) => {
    setTipoDocumento(nuevoTipo);
    setNumeroDocumento("");
    setDatosConsultados(null);
    setNombre("");
    setApePaterno("");
    setApeMaterno("");
    setRazonSocial("");
    setDireccionFiscal("");
    setDireccion("");
    setErrores({});
  };

  const consultarDocumento = async () => {
    if (!numeroDocumento || numeroDocumento.length !== configTipo.longitud) {
      setErrores({
        numeroDocumento: `${configTipo.label} debe tener ${configTipo.longitud} dígitos.`,
      });
      return;
    }

    setErrores({});
    setLoadingDocumento(true);

    try {
      const res = await axios.get(
        `/api/v1/${configTipo.endpoint}/${numeroDocumento}`,
        { headers },
      );

      if (!res.data?.success || !res.data?.datos) {
        Toast.fire({
          icon: "error",
          title: `${configTipo.label} no encontrado`,
        });
        return;
      }

      const datos = res.data.datos;
      setDatosConsultados(datos);

      if (esRuc) {
        const razon = datos.razon_social || datos.razonSocial || "";
        const direccionSunat = datos.domiciliado?.direccion || "";
        setRazonSocial(razon);
        setDireccionFiscal(direccionSunat);
        setDireccion(direccionSunat);
      } else {
        setNombre(datos.nombres || "");
        setApePaterno(datos.ape_paterno || datos.apePaterno || "");
        setApeMaterno(datos.ape_materno || datos.apeMaterno || "");
        setDireccion(datos.domiciliado?.direccion || "");
      }
    } catch {
      Toast.fire({
        icon: "error",
        title: `Error al consultar ${configTipo.label}`,
      });
    } finally {
      setLoadingDocumento(false);
    }
  };

  const validar = () => {
    const err = {};

    if (!numeroDocumento || numeroDocumento.length !== configTipo.longitud) {
      err.numeroDocumento = `${configTipo.label} inválido`;
    }
    if (!datosConsultados)
      err.general = `Debe consultar el ${configTipo.label}`;
    if (correo && !correo.includes("@")) {
      err.correo = "Correo inválido";
    }
    if (telefono && telefono.length !== 9) {
      err.telefono = "Debe tener 9 dígitos";
    }
    if (!direccion.trim()) err.direccion = "Dirección obligatoria";

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;

    setGuardando(true);

    try {
      await axios.post(
        "/api/v1/clientes",
        {
          numeroDocumento,
          correo,
          telefono,
          direccion,
          idTipoDocumento: configTipo.id,
        },
        { headers },
      );

      Toast.fire({ icon: "success", title: "Cliente registrado" });
      recargarTabla();
      cerrarModal();
    } catch (e) {
      const msg = e.response?.data?.message || "";

      if (msg.toLowerCase().includes("reactivarlo")) {
        const confirmacion = await confirmarAccion(
          "Cliente eliminado",
          "Este cliente se encuentra registrado pero con estado Eliminado. ¿Desea reactivarlo?",
          "Sí, reactivar",
          "warning",
        );

        if (confirmacion.isConfirmed) {
          try {
            await axios.patch(
              `/api/v1/clientes/reactivar/${numeroDocumento}`,
              {},
              { headers },
            );
            Toast.fire({
              icon: "success",
              title: "Cliente reactivado correctamente",
            });
            recargarTabla();
            cerrarModal();
          } catch (err2) {
            mostrarAlerta(
              "Error",
              err2.response?.data?.message || "No se pudo reactivar",
              "error",
            );
          }
        }
      } else if (msg.toLowerCase().includes("ya se encuentra registrado")) {
        mostrarAlerta("Cliente ya registrado", msg, "info");
      } else {
        mostrarAlerta("Error", msg || "No se pudo crear el cliente", "error");
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

      <SeccionLabel text="Identificación" />

      <div className="form-grid">
        <div>
          <label className="label-control">Tipo Documento *</label>
          <select
            className="input-control"
            value={tipoDocumento}
            onChange={(e) => limpiarIdentificacion(e.target.value)}
          >
            <option value="DNI">DNI</option>
            <option value="RUC">RUC</option>
          </select>
        </div>

        <div>
          <label className="label-control">Nº Documento *</label>

          <div style={{ display: "flex", gap: "6px" }}>
            <input
              className={inputError("numeroDocumento")}
              value={numeroDocumento}
              onChange={(e) => {
                setNumeroDocumento(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, configTipo.longitud),
                );
                setDatosConsultados(null);
              }}
              placeholder={esRuc ? "20601234567" : "12345678"}
            />

            <button
              className="btn-secondary"
              onClick={consultarDocumento}
              disabled={loadingDocumento}
            >
              {loadingDocumento ? "..." : <Search />}
            </button>
          </div>

          {msgError("numeroDocumento")}
        </div>
      </div>

      {datosConsultados && (
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
          {esRuc ? razonSocial : `${nombre} ${apePaterno} ${apeMaterno}`}
        </div>
      )}

      {esRuc ? (
        <div className="form-grid">
          <div style={{ gridColumn: "span 2" }}>
            <label className="label-control">Razón Social</label>
            <input className="input-control" value={razonSocial} disabled />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label className="label-control">Dirección Fiscal</label>
            <input className="input-control" value={direccionFiscal} disabled />
          </div>
        </div>
      ) : (
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
      )}

      <Divider />

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
