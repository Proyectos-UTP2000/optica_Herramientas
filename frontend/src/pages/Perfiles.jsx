import { useEffect, useState } from "react";
import axios from "axios";
import { PencilSquare, Trash3, Arrow90degLeft } from "react-bootstrap-icons";
import { Toast, confirmarAccion, mostrarAlerta } from "../utils/alerts";
import ToggleEstado from "../components/ui/ToggleEstado";
const Perfiles = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modales y Formularios
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Datos del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  8;
  // Simularemos algunas opciones base para asignar (Esto idealmente vendría de una tabla Opciones en BD)
  const opcionesDisponibles = [
    { id: 1, nombre: "Dashboard" },
    { id: 5, nombre: "Clientes" },
    { id: 3, nombre: "Listar Usuarios" },
    { id: 4, nombre: "Perfiles" },
  ];
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const cargarPerfiles = () => {
    setLoading(true);
    axios
      .get("/api/v1/perfiles", { headers })
      .then((res) => setPerfiles(res.data))
      .catch((err) =>
        mostrarAlerta("Error", "No se pudieron cargar los perfiles", "error"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarPerfiles();
  }, []);

  // ── CRUD CON ALERTAS ─────────────────────────────────────────

  const handleCrear = async () => {
    if (!nombre.trim()) {
      Toast.fire({ icon: "warning", title: "El nombre es obligatorio" });
      return;
    }

    setGuardando(true);
    try {
      await axios.post(
        "/api/v1/perfiles",
        {
          nombre,
          descripcion,
          idsOpciones: opcionesSeleccionadas,
        },
        { headers },
      );

      setShowModalCrear(false);
      cargarPerfiles();
      Toast.fire({ icon: "success", title: "Perfil creado exitosamente" });
      limpiarFormulario();
    } catch (e) {
      mostrarAlerta(
        "Error",
        e.response?.data?.message || "Hubo un error al crear",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizarOpciones = async () => {
    setGuardando(true);
    try {
      await axios.put(
        `/api/v1/perfiles/${perfilSeleccionado.id}/opciones`,
        opcionesSeleccionadas,
        { headers },
      );
      setShowModalEditar(false);
      cargarPerfiles();
      Toast.fire({ icon: "success", title: "Permisos actualizados" });
    } catch (e) {
      mostrarAlerta(
        "Error",
        e.response?.data?.message || "Hubo un error al actualizar",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (id, nombrePerfil) => {
    const conf = await confirmarAccion(
      "¿Modificar estado?",
      `Vas a cambiar el acceso al sistema para todos los usuarios con rol ${nombrePerfil}.`,
      "Sí, cambiar",
      "warning",
    );
    if (conf.isConfirmed) {
      try {
        await axios.patch(`/api/v1/perfiles/${id}/estado`, {}, { headers });
        cargarPerfiles();
        Toast.fire({ icon: "success", title: "Estado modificado" });
      } catch (e) {
        mostrarAlerta(
          "Acción denegada",
          e.response?.data?.message || "Error de estado",
          "error",
        );
      }
    }
  };

  const eliminar = async (id, nombrePerfil) => {
    const conf = await confirmarAccion(
      "¿Eliminar Perfil?",
      `Estás a punto de borrar el perfil "${nombrePerfil}". Esta acción es irreversible.`,
      "Sí, eliminar",
      "error",
    );
    if (conf.isConfirmed) {
      try {
        await axios.delete(`/api/v1/perfiles/${id}`, { headers });
        cargarPerfiles();
        Toast.fire({
          icon: "success",
          title: "Perfil eliminado correctamente",
        });
      } catch (e) {
        mostrarAlerta(
          "Error al eliminar",
          e.response?.data?.message || "No se puede eliminar",
          "error",
        );
      }
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setOpcionesSeleccionadas([]);
  };

  const abrirEditar = (perfil) => {
    setPerfilSeleccionado(perfil);
    // Extraemos solo los IDs de las opciones que ya tiene
    const idsActuales = perfil.opciones ? perfil.opciones.map((o) => o.id) : [];
    setOpcionesSeleccionadas(idsActuales);
    setShowModalEditar(true);
  };

  const toggleOpcion = (id) => {
    setOpcionesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // ── PAGINACIÓN Y FILTRO (Idéntico a Empleados) ──
  const filtrados = perfiles.filter((p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()),
  );
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const paginados = filtrados.slice(inicio, inicio + registrosPorPagina);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "var(--text-main)", margin: 0 }}>
          Gestión de Perfiles
        </h2>
        <button
          className="btn-primary"
          onClick={() => {
            limpiarFormulario();
            setShowModalCrear(true);
          }}
        >
          + Nuevo Perfil
        </button>
      </div>

      {/* Controles de Tabla (Buscar / Mostrar) */}
      <div className="form-grid" style={{ marginBottom: "15px" }}>
        <div>
          <label className="label-control">Buscar Rol:</label>
          <input
            className="input-control"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Ej. Administrador"
          />
        </div>
      </div>

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
                textAlign: "left",
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              <th style={{ padding: "12px" }}>ID</th>
              <th style={{ padding: "12px" }}>Nombre</th>
              <th style={{ padding: "12px" }}>Descripción</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Cargando...
                </td>
              </tr>
            ) : (
              paginados.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{p.id}</td>
                  <td
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      color: "var(--text-main)",
                    }}
                  >
                    {p.nombre}
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-muted)" }}>
                    {p.descripcion}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <label
                      className="toggle-switch"
                      onClick={(e) => {
                        e.stopPropagation();
                        cambiarEstado(p.id, p.nombre);
                      }}
                    >
                      <input type="checkbox" readOnly checked={p.estado === 1} />
                      <span className="toggle-track" />
                      <span className="toggle-label">
                        {p.estado === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </td>
                  <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                    <button
                      className="btn-icon edit"
                      onClick={() => abrirEditar(p)}
                      title="Editar Accesos"
                    >
                      <PencilSquare />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => eliminar(p.id, p.nombre)}
                      title="Eliminar Perfil"
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

      {/* ════════ MODAL CREAR PERFIL ════════ */}
      {showModalCrear && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Registrar Nuevo Perfil</h3>
              <button
                className="btn-icon"
                onClick={() => setShowModalCrear(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div>
                  <label className="label-control">Nombre del Rol *</label>
                  <input
                    className="input-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. CAJERO"
                  />
                </div>
                <div>
                  <label className="label-control">Descripción</label>
                  <input
                    className="input-control"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Breve detalle de las funciones"
                  />
                </div>
              </div>

              <h4
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: "5px",
                }}
              >
                Asignar Permisos Iniciales
              </h4>
              <div className="form-grid">
                {opcionesDisponibles.map((op) => (
                  <label
                    key={op.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={opcionesSeleccionadas.includes(op.id)}
                      onChange={() => toggleOpcion(op.id)}
                    />
                    {op.nombre}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowModalCrear(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleCrear}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Crear Perfil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalEditar && perfilSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>
                Gestionar Accesos: {perfilSeleccionado.nombre}
              </h3>
              <button
                className="btn-icon"
                onClick={() => setShowModalEditar(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  marginBottom: "15px",
                }}
              >
                Selecciona los módulos a los que los usuarios con este rol
                tendrán acceso.
              </p>
              <div className="form-grid">
                {opcionesDisponibles.map((op) => (
                  <label
                    key={op.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      cursor: "pointer",
                      background: "#f8fafc",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={opcionesSeleccionadas.includes(op.id)}
                      onChange={() => toggleOpcion(op.id)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    {op.nombre}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowModalEditar(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleActualizarOpciones}
                disabled={guardando}
              >
                {guardando ? "Actualizando..." : "Guardar Accesos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfiles;
