import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { PencilSquare, Trash3 } from "react-bootstrap-icons";
import { Toast, confirmarAccion, mostrarAlerta } from "../utils/alerts";

// ── Iconos SVG para el árbol (Copied from MainLayout for consistency) ──
const IconDashboard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);
const IconClientes = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const IconEmpleados = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const IconPerfiles = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

const iconMap = {
  IconDashboard: <IconDashboard />,
  IconClientes: <IconClientes />,
  IconEmpleados: <IconEmpleados />,
  IconPerfiles: <IconPerfiles />,
};

const Perfiles = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [opciones, setOpciones] = useState([]); // Flat list from API
  const [arbolOpciones, setArbolOpciones] = useState([]); // Hierarchical list
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
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resPerfiles, resOpciones] = await Promise.all([
        api.get("/api/v1/perfiles"),
        api.get("/api/v1/opciones"),
      ]);
      setPerfiles(resPerfiles.data);
      setOpciones(resOpciones.data);
      setArbolOpciones(construirArbol(resOpciones.data));
    } catch (err) {
      mostrarAlerta("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const construirArbol = (lista) => {
    const mapa = {};
    lista.forEach((op) => {
      mapa[op.id] = { ...op, hijos: [] };
    });
    const arbol = [];
    lista.forEach((op) => {
      const idPadre = op.padre?.id || op.idPadre; // Soporta ambos formatos
      if (idPadre && mapa[idPadre]) {
        mapa[idPadre].hijos.push(mapa[op.id]);
      } else if (!idPadre) {
        arbol.push(mapa[op.id]);
      }
    });
    return arbol;
  };

  // ── LOGICA DE SELECCION EN CASCADA ───────────────────────────

  const obtenerDescendientes = (opcion) => {
    let ids = [];
    if (opcion.hijos) {
      opcion.hijos.forEach((hijo) => {
        ids.push(hijo.id);
        ids = [...ids, ...obtenerDescendientes(hijo)];
      });
    }
    return ids;
  };

  const toggleOpcion = (opcion) => {
    const estaSeleccionado = opcionesSeleccionadas.includes(opcion.id);
    const descendientes = obtenerDescendientes(opcion);
    
    setOpcionesSeleccionadas((prev) => {
      if (estaSeleccionado) {
        // Desmarcar opción y todos sus hijos
        const aQuitar = [opcion.id, ...descendientes];
        return prev.filter((id) => !aQuitar.includes(id));
      } else {
        // Marcar opción y todos sus hijos
        const aAgregar = [opcion.id, ...descendientes];
        // Evitar duplicados
        const nuevoSet = new Set([...prev, ...aAgregar]);
        return Array.from(nuevoSet);
      }
    });
  };

  // Componente recursivo para renderizar el árbol
  const OpcionItem = ({ opcion, nivel = 0 }) => {
    const tieneHijos = opcion.hijos && opcion.hijos.length > 0;
    const seleccionado = opcionesSeleccionadas.includes(opcion.id);

    return (
      <div key={opcion.id} style={{ marginLeft: `${nivel * 20}px`, marginBottom: "4px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13.5px",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: "6px",
            backgroundColor: tieneHijos ? "#f1f5f9" : "transparent",
            fontWeight: tieneHijos ? "600" : "400",
            color: tieneHijos ? "var(--text-main)" : "var(--text-muted)",
            border: tieneHijos ? "1px solid #e2e8f0" : "none",
          }}
        >
          <input
            type="checkbox"
            checked={seleccionado}
            onChange={() => toggleOpcion(opcion)}
            style={{ width: "15px", height: "15px" }}
          />
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {iconMap[opcion.icono] || (tieneHijos ? iconMap.IconPerfiles : null)}
            {opcion.nombre}
          </span>
        </label>
        {opcion.hijos &&
          opcion.hijos.map((hijo) => (
            <OpcionItem key={hijo.id} opcion={hijo} nivel={nivel + 1} />
          ))}
      </div>
    );
  };

  // ── CRUD ─────────────────────────────────────────────────────

  const handleCrear = async () => {
    if (!nombre.trim()) {
      Toast.fire({ icon: "warning", title: "El nombre es obligatorio" });
      return;
    }

    setGuardando(true);
    try {
      await api.post("/api/v1/perfiles", {
        nombre,
        descripcion,
        idsOpciones: opcionesSeleccionadas,
      });

      setShowModalCrear(false);
      cargarDatos();
      Toast.fire({ icon: "success", title: "Perfil creado exitosamente" });
      limpiarFormulario();
    } catch (e) {
      mostrarAlerta("Error", e.response?.data?.message || "Hubo un error al crear", "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizarOpciones = async () => {
    setGuardando(true);
    try {
      await api.put(`/api/v1/perfiles/${perfilSeleccionado.id}/opciones`, opcionesSeleccionadas);
      setShowModalEditar(false);
      cargarDatos();
      Toast.fire({ icon: "success", title: "Permisos actualizados" });
    } catch (e) {
      mostrarAlerta("Error", e.response?.data?.message || "Hubo un error al actualizar", "error");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (id, nombrePerfil) => {
    const conf = await confirmarAccion(
      "¿Modificar estado?",
      `Vas a cambiar el acceso al sistema para todos los usuarios con rol ${nombrePerfil}.`,
      "Sí, cambiar",
      "warning"
    );
    if (conf.isConfirmed) {
      try {
        await api.patch(`/api/v1/perfiles/${id}/estado`, {});
        cargarDatos();
        Toast.fire({ icon: "success", title: "Estado modificado" });
      } catch (e) {
        mostrarAlerta("Acción denegada", e.response?.data?.message || "Error de estado", "error");
      }
    }
  };

  const eliminar = async (id, nombrePerfil) => {
    const conf = await confirmarAccion(
      "¿Eliminar Perfil?",
      `Estás a punto de borrar el perfil "${nombrePerfil}". Esta acción es irreversible.`,
      "Sí, eliminar",
      "error"
    );
    if (conf.isConfirmed) {
      try {
        await api.delete(`/api/v1/perfiles/${id}`);
        cargarDatos();
        Toast.fire({ icon: "success", title: "Perfil eliminado correctamente" });
      } catch (e) {
        mostrarAlerta("Error al eliminar", e.response?.data?.message || "No se puede eliminar", "error");
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
    const idsActuales = perfil.opciones ? perfil.opciones.map((o) => o.id) : [];
    setOpcionesSeleccionadas(idsActuales);
    setShowModalEditar(true);
  };

  const filtrados = perfiles.filter((p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const paginados = filtrados.slice(inicio, inicio + registrosPorPagina);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "var(--text-main)", margin: 0 }}>Gestión de Perfiles</h2>
        <button className="btn-primary" onClick={() => { limpiarFormulario(); setShowModalCrear(true); }}>
          + Nuevo Perfil
        </button>
      </div>

      <div className="form-grid" style={{ marginBottom: "15px" }}>
        <div>
          <label className="label-control">Buscar Rol:</label>
          <input className="input-control" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Ej. Administrador" />
        </div>
      </div>

      <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid var(--border-color)", background: "white" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-light)", textAlign: "left", borderBottom: "2px solid var(--border-color)" }}>
              <th style={{ padding: "12px" }}>ID</th>
              <th style={{ padding: "12px" }}>Nombre</th>
              <th style={{ padding: "12px" }}>Descripción</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>Cargando...</td></tr>
            ) : (
              paginados.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{p.id}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "var(--text-main)" }}>{p.nombre}</td>
                  <td style={{ padding: "12px", color: "var(--text-muted)" }}>{p.descripcion}</td>
                  <td style={{ padding: "12px" }}>
                    <label className="toggle-switch" onClick={(e) => { e.stopPropagation(); cambiarEstado(p.id, p.nombre); }}>
                      <input type="checkbox" readOnly checked={p.estado === 1} />
                      <span className="toggle-track" />
                      <span className="toggle-label">{p.estado === 1 ? "Activo" : "Inactivo"}</span>
                    </label>
                  </td>
                  <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                    <button className="btn-icon edit" onClick={() => abrirEditar(p)} title="Editar Accesos"><PencilSquare /></button>
                    <button className="btn-icon delete" onClick={() => eliminar(p.id, p.nombre)} title="Eliminar Perfil"><Trash3 /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR PERFIL */}
      {showModalCrear && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Registrar Nuevo Perfil</h3>
              <button className="btn-icon" onClick={() => setShowModalCrear(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div>
                  <label className="label-control">Nombre del Rol *</label>
                  <input className="input-control" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. CAJERO" />
                </div>
                <div>
                  <label className="label-control">Descripción</label>
                  <input className="input-control" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Breve detalle" />
                </div>
              </div>

              <h4 style={{ fontSize: "14px", color: "var(--text-main)", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginTop: "20px" }}>
                Asignar Permisos Iniciales
              </h4>
              <div style={{ maxHeight: "300px", overflowY: "auto", padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                {arbolOpciones.map((op) => (
                  <OpcionItem key={op.id} opcion={op} />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModalCrear(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCrear} disabled={guardando}>{guardando ? "Guardando..." : "Crear Perfil"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PERMISOS */}
      {showModalEditar && perfilSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Gestionar Accesos: {perfilSeleccionado.nombre}</h3>
              <button className="btn-icon" onClick={() => setShowModalEditar(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "15px" }}>
                Selecciona los módulos a los que los usuarios con este rol tendrán acceso.
              </p>
              <div style={{ maxHeight: "350px", overflowY: "auto", padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                {arbolOpciones.map((op) => (
                  <OpcionItem key={op.id} opcion={op} />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModalEditar(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleActualizarOpciones} disabled={guardando}>{guardando ? "Actualizando..." : "Guardar Accesos"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfiles;
