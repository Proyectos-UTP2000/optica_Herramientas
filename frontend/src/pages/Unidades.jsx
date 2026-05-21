import { useEffect, useState } from "react";
import axios from "axios";
import { PencilSquare, Trash3 } from "react-bootstrap-icons";
import { Toast, confirmarAccion, mostrarAlerta } from "../utils/alerts";
import ModalCrearUnidad from "./unidades/ModalCrearUnidad";
import ModalEditarUnidad from "./unidades/ModalEditarUnidad";
import ModalVerUnidad from "./unidades/ModalVerUnidad";

const Unidades = () => {
  const [unidades, setUnidades] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalVer, setShowModalVer] = useState(false);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const cargarUnidades = () => {
    setLoading(true);
    axios
      .get("/api/v1/unidades", { headers })
      .then((res) => setUnidades(res.data))
      .catch(() => mostrarAlerta("Error", "No se pudo cargar la lista de unidades.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarUnidades(); }, []);

  const construirMensajeCambioEstado = (item, entidad = "marca") => {
    const cantidad = item?.cantidadProductosRelacionados ?? 0;
    if (cantidad > 0) {
      return `¿Está realmente seguro que desea cambiar de estado? Esta ${entidad} está relacionada a ${cantidad} producto(s). Pasará a estado "En Desuso".`;
    }
    return `¿Está seguro que desea cambiar el estado de "${item.nombre}"?`;
  };


  const cambiarEstado = async (unidad) => {
    const confirmacion = await confirmarAccion(
      "¿Cambiar estado?",
      construirMensajeCambioEstado(unidad),
      "Sí, cambiar",
      "warning",
    );
    if (!confirmacion.isConfirmed) return;

    try {
      await axios.patch(`/api/v1/unidades/${unidad.id}/estado`, {}, { headers });
      Toast.fire({ icon: "success", title: "Estado actualizado correctamente" });
      cargarUnidades();
    } catch (e) {
      mostrarAlerta("Error", e.response?.data?.message || "No se pudo cambiar el estado.", "error");
    }
  };

  const eliminar = async (unidad) => {
    const confirmacion = await confirmarAccion(
      "¿Eliminar unidad?",
      `¿Está seguro de eliminar "${unidad.nombre}"? No se puede eliminar si tiene productos asociados.`,
      "Sí, eliminar",
      "warning",
    );
    if (!confirmacion.isConfirmed) return;

    try {
      await axios.delete(`/api/v1/unidades/${unidad.id}`, { headers });
      Toast.fire({ icon: "success", title: "Unidad eliminada" });
      cargarUnidades();
    } catch (e) {
      mostrarAlerta("No se puede eliminar", e.response?.data?.message || "Error al eliminar.", "error");
    }
  };

  const abrirVer = (unidad) => { setUnidadSeleccionada(unidad); setShowModalVer(true); };
  const abrirEditar = (unidad) => { setUnidadSeleccionada(unidad); setShowModalEditar(true); };

  const filtradas = unidades.filter((u) =>
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()),
  );
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / registrosPorPagina));
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const paginados = filtradas.slice(inicio, inicio + registrosPorPagina);

  const badgeEstado = (estado) => {
    if (estado === 1) return <span className="badge badge-active">Activo</span>;
    if (estado === 2) return <span className="badge badge-inactive" style={{ background: "#fef3c7", color: "#92400e" }}>En Desuso</span>;
    return <span className="badge badge-inactive">Inactivo</span>;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "var(--text-main)", margin: 0 }}>Lista de Unidades</h2>
        <button className="btn-primary" onClick={() => setShowModalCrear(true)}>+ Nueva Unidad</button>
      </div>

      <div className="form-grid" style={{ marginBottom: "15px" }}>
        <div>
          <label className="label-control">Mostrar registros</label>
          <select className="input-control" value={registrosPorPagina} onChange={(e) => { setRegistrosPorPagina(Number(e.target.value)); setPaginaActual(1); }}>
            {[5, 10, 25, 50].map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="label-control">Buscar</label>
          <input className="input-control" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }} placeholder="Nombre de unidad..." />
        </div>
      </div>

      <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid var(--border-color)", background: "white" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-light)", borderBottom: "2px solid var(--border-color)" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Nombre</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Productos</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Cargando...</td></tr>
            ) : paginados.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>No hay registros.</td></tr>
            ) : (
              paginados.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", color: "#64748b" }}>{u.id}</td>
                  <td style={{ padding: "12px", fontWeight: "500" }}>{u.nombre}</td>
                  <td style={{ padding: "12px", color: "#64748b" }}>
                    {u.cantidadProductosRelacionados ?? 0} producto(s)
                  </td>
                  <td style={{ padding: "12px", cursor: "pointer" }} onClick={() => cambiarEstado(u)}>
                    {badgeEstado(u.estado)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn-icon view" onClick={() => abrirVer(u)} title="Ver detalle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                      <button className="btn-icon edit" onClick={() => abrirEditar(u)} title="Editar"><PencilSquare /></button>
                      <button className="btn-icon delete" onClick={() => eliminar(u)} title="Eliminar"><Trash3 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", fontSize: "13px" }}>
        <span>Mostrando del {filtradas.length === 0 ? 0 : inicio + 1} al {Math.min(inicio + registrosPorPagina, filtradas.length)} de {filtradas.length}</span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button className="btn-secondary" onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))} disabled={paginaActual === 1}>Anterior</button>
          <button className="btn-secondary" onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))} disabled={paginaActual >= totalPaginas}>Siguiente</button>
        </div>
      </div>

      {showModalCrear && <ModalCrearUnidad cerrarModal={() => setShowModalCrear(false)} recargarTabla={cargarUnidades} />}
      {showModalEditar && <ModalEditarUnidad unidad={unidadSeleccionada} cerrarModal={() => setShowModalEditar(false)} recargarTabla={cargarUnidades} />}
      {showModalVer && <ModalVerUnidad unidad={unidadSeleccionada} cerrarModal={() => setShowModalVer(false)} />}
    </div>
  );
};

export default Unidades;