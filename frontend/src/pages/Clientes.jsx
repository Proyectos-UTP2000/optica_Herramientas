import { useEffect, useState } from "react";
import axios from "axios";
import { EyeFill, PencilSquare, Trash3 } from "react-bootstrap-icons";

import { Toast, confirmarAccion, mostrarAlerta } from "../utils/alerts";
import ToggleEstado from "../components/ui/ToggleEstado";
import ModalCrearCliente from "./clientes/ModalCrearCliente";
import ModalEditarCliente from "./clientes/ModalEditarCliente";
import ModalVerCliente from "./clientes/ModalVerCliente";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalVer, setShowModalVer] = useState(false);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipoPersona, setFiltroTipoPersona] = useState("");
  const [filtroContacto, setFiltroContacto] = useState("");

  const filtrosActivosCount = 
    (filtroEstado ? 1 : 0) + 
    (filtroTipoPersona ? 1 : 0) + 
    (filtroContacto ? 1 : 0);

  const limpiarFiltros = () => {
    setFiltroEstado("");
    setFiltroTipoPersona("");
    setFiltroContacto("");
  };

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ───────────── CARGAR CLIENTES ─────────────
  const cargarClientes = () => {
    setLoading(true);
    axios
      .get("/api/v1/clientes", { headers })
      .then((res) => setClientes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // ───────────── ACCIONES ─────────────
  const cambiarEstado = async (id) => {
    const confirmacion = await confirmarAccion(
      "¿Cambiar estado?",
      "El cliente cambiará su disponibilidad en el sistema.",
      "Sí, cambiar",
      "info",
    );

    if (confirmacion.isConfirmed) {
      try {
        await axios.patch(`/api/v1/clientes/${id}/estado`, {}, { headers });
        cargarClientes();
        Toast.fire({ icon: "success", title: "Estado modificado" });
      } catch (e) {
        mostrarAlerta(
          "Error",
          e.response?.data?.message || "No se pudo cambiar el estado",
          "error",
        );
      }
    }
  };

  const eliminar = async (id) => {
    const confirmacion = await confirmarAccion(
      "¿Eliminar cliente?",
      "El cliente será desactivado del sistema.",
      "Sí, eliminar",
      "warning",
    );

    if (confirmacion.isConfirmed) {
      try {
        await axios.delete(`/api/v1/clientes/${id}`, { headers });
        cargarClientes();
        Toast.fire({
          icon: "success",
          title: "Cliente eliminado",
        });
      } catch (e) {
        mostrarAlerta(
          "Error",
          e.response?.data?.message || "No se pudo eliminar",
          "error",
        );
      }
    }
  };

  const abrirEditar = (c) => {
    setClienteSeleccionado(c);
    setShowModalEditar(true);
  };

  const abrirVer = (c) => {
    setClienteSeleccionado(c);
    setShowModalVer(true);
  };

  const filtrados = clientes.filter((c) => {
    const t = busqueda.toLowerCase();
    const matchesSearch =
      !busqueda ||
      c.nombreCompleto?.toLowerCase().includes(t) ||
      c.correo?.toLowerCase().includes(t) ||
      c.numeroDocumento?.includes(t);
    const matchesEstado = !filtroEstado || String(c.estado) === filtroEstado;
    
    let matchesTipoPersona = true;
    if (filtroTipoPersona === "NATURAL") {
      matchesTipoPersona = c.numeroDocumento?.trim().length === 8;
    } else if (filtroTipoPersona === "JURIDICA") {
      matchesTipoPersona = c.numeroDocumento?.trim().length === 11;
    }

    let matchesContacto = true;
    if (filtroContacto === "CORREO") {
      matchesContacto = !!c.correo?.trim();
    } else if (filtroContacto === "TELEFONO") {
      matchesContacto = !!c.telefono?.trim();
    } else if (filtroContacto === "SIN_CONTACTO") {
      matchesContacto = !c.correo?.trim() && !c.telefono?.trim();
    }

    return matchesSearch && matchesEstado && matchesTipoPersona && matchesContacto;
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / registrosPorPagina),
  );

  const inicio = (paginaActual - 1) * registrosPorPagina;
  const paginados = filtrados.slice(inicio, inicio + registrosPorPagina);

  // ───────────── UI ─────────────
  return (
    <div>
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "var(--text-main)", margin: 0 }}>
          Lista de Clientes
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className={`btn-secondary ${showFiltros ? "active" : ""}`}
            onClick={() => setShowFiltros(!showFiltros)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            {showFiltros ? "Ocultar Filtros" : "Filtros"}
            {filtrosActivosCount > 0 && (
              <span style={{
                background: "var(--primary-color, #3b82f6)",
                color: "white",
                borderRadius: "50%",
                padding: "1px 6px",
                fontSize: "11px",
                fontWeight: "bold"
              }}>
                {filtrosActivosCount}
              </span>
            )}
          </button>
          <button className="btn-primary" onClick={() => setShowModalCrear(true)}>
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Controles */}
      <div className="form-grid" style={{ marginBottom: "15px" }}>
        <div>
          <label className="label-control">Mostrar registros</label>
          <select
            className="input-control"
            value={registrosPorPagina}
            onChange={(e) => {
              setRegistrosPorPagina(Number(e.target.value));
              setPaginaActual(1);
            }}
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-control">Buscar</label>
          <input
            className="input-control"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Nombre, DNI o correo..."
          />
        </div>
      </div>

      {showFiltros && (
        <div style={{
          background: "#f8fafc",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "15px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          alignItems: "end"
        }}>
          <div>
            <label className="label-control">Estado</label>
            <select
              className="input-control"
              value={filtroEstado}
              onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}
            >
              <option value="">Todos</option>
              <option value="1">Activos</option>
              <option value="0">Inactivos</option>
            </select>
          </div>
          <div>
            <label className="label-control">Tipo de Persona</label>
            <select
              className="input-control"
              value={filtroTipoPersona}
              onChange={(e) => { setFiltroTipoPersona(e.target.value); setPaginaActual(1); }}
            >
              <option value="">Todos</option>
              <option value="NATURAL">Persona Natural (DNI)</option>
              <option value="JURIDICA">Persona Jurídica (RUC)</option>
            </select>
          </div>
          <div>
            <label className="label-control">Datos de Contacto</label>
            <select
              className="input-control"
              value={filtroContacto}
              onChange={(e) => { setFiltroContacto(e.target.value); setPaginaActual(1); }}
            >
              <option value="">Todos</option>
              <option value="CORREO">Tiene Correo Registrado</option>
              <option value="TELEFONO">Tiene Teléfono Registrado</option>
              <option value="SIN_CONTACTO">Sin Datos de Contacto</option>
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn-secondary" onClick={limpiarFiltros} style={{ width: "100%", height: "38px" }}>
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
          background: "white",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13.5px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "var(--bg-light)",
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              <th style={{ padding: "12px" }}>ID</th>
              <th style={{ padding: "12px" }}>Nombre Completo</th>
              <th style={{ padding: "12px" }}>Correo</th>
              <th style={{ padding: "12px" }}>Teléfono</th>
              <th style={{ padding: "12px" }}>Documento</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Cargando...
                </td>
              </tr>
            ) : paginados.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No hay registros.
                </td>
              </tr>
            ) : (
              paginados.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{c.id}</td>

                  <td style={{ padding: "12px", fontWeight: "500" }}>
                    {c.nombreCompleto}
                  </td>

                  <td style={{ padding: "12px", color: "var(--text-muted)" }}>
                    {c.correo || "—"}
                  </td>

                  <td style={{ padding: "12px" }}>{c.telefono || "—"}</td>

                  <td style={{ padding: "12px" }}>{c.numeroDocumento}</td>

                  <td style={{ padding: "12px" }}>
                    <label
                      className="toggle-switch"
                      onClick={(e) => {
                        e.stopPropagation();
                        cambiarEstado(c.id);
                      }}
                    >
                      <input type="checkbox" readOnly checked={c.estado === 1} />
                      <span className="toggle-track" />
                      <span className="toggle-label">
                        {c.estado === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </td>

                  <td style={{ padding: "12px", display: "flex", gap: "6px" }}>
                    <button
                      className="btn-icon view"
                      onClick={() => abrirVer(c)}
                      title="Ver"
                    >
                      <EyeFill />
                    </button>

                    <button
                      className="btn-icon edit"
                      onClick={() => abrirEditar(c)}
                      title="Editar"
                    >
                      <PencilSquare />
                    </button>

                    <button
                      className="btn-icon delete"
                      onClick={() => eliminar(c.id)}
                      title="Eliminar"
                    >
                      <Trash3 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "15px",
          fontSize: "13px",
        }}
      >
        <span>
          Mostrando del {inicio + 1} al{" "}
          {Math.min(inicio + registrosPorPagina, filtrados.length)} de{" "}
          {filtrados.length}
        </span>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            className="btn-secondary"
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>

          <button
            className="btn-secondary"
            onClick={() =>
              setPaginaActual((p) => Math.min(p + 1, totalPaginas))
            }
            disabled={paginaActual >= totalPaginas}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* MODALES */}
      {showModalCrear && (
        <ModalCrearCliente
          cerrarModal={() => setShowModalCrear(false)}
          recargarTabla={cargarClientes}
        />
      )}

      {showModalEditar && (
        <ModalEditarCliente
          cliente={clienteSeleccionado}
          cerrarModal={() => setShowModalEditar(false)}
          recargarTabla={cargarClientes}
        />
      )}

      {showModalVer && (
        <ModalVerCliente
          cliente={clienteSeleccionado}
          cerrarModal={() => setShowModalVer(false)}
        />
      )}
    </div>
  );
};

export default Clientes;
