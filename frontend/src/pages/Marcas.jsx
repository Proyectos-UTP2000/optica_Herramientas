import { useEffect, useState } from "react";
import axios from "axios";
import { PencilSquare, Trash3 } from "react-bootstrap-icons";
import { Toast, confirmarAccion, mostrarAlerta } from "../utils/alerts";
import ModalCrearMarca from "./marcas/ModalCrearMarca";
import ModalEditarMarca from "./marcas/ModalEditarMarca";
import ModalVerMarca from "./marcas/ModalVerMarca";

const Marcas = () => {
    const [marcas, setMarcas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [paginaActual, setPaginaActual] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showModalCrear, setShowModalCrear] = useState(false);
    const [showModalEditar, setShowModalEditar] = useState(false);
    const [showModalVer, setShowModalVer] = useState(false);
    const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const cargarMarcas = () => {
        setLoading(true);
        axios
            .get("/api/v1/marcas", { headers })
            .then((res) => setMarcas(res.data))
            .catch(() => mostrarAlerta("Error", "No se pudo cargar la lista de marcas.", "error"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargarMarcas(); }, []);

    const construirMensajeCambioEstado = (item, entidad = "marca") => {
        const cantidad = item?.cantidadProductosRelacionados ?? 0;
        if (cantidad > 0) {
            return `¿Está realmente seguro que desea cambiar de estado? Esta ${entidad} está relacionada a ${cantidad} producto(s). Pasará a estado "En Desuso".`;
        }
        return `¿Está seguro que desea cambiar el estado de "${item.nombre}"?`;
    };

    const cambiarEstado = async (marca) => {
        const confirmacion = await confirmarAccion(
            "¿Cambiar estado?",
            construirMensajeCambioEstado(marca),
            "Sí, cambiar",
            "warning",
        );
        if (!confirmacion.isConfirmed) return;

        try {
            await axios.patch(`/api/v1/marcas/${marca.id}/estado`, {}, { headers });
            Toast.fire({ icon: "success", title: "Estado actualizado correctamente" });
            cargarMarcas();
        } catch (e) {
            mostrarAlerta("Error", e.response?.data?.message || "No se pudo cambiar el estado.", "error");
        }
    };

    const eliminar = async (marca) => {
        const confirmacion = await confirmarAccion(
            "¿Eliminar marca?",
            `¿Está seguro de eliminar "${marca.nombre}"? No se puede eliminar si tiene productos asociados.`,
            "Sí, eliminar",
            "warning",
        );
        if (!confirmacion.isConfirmed) return;

        try {
            await axios.delete(`/api/v1/marcas/${marca.id}`, { headers });
            Toast.fire({ icon: "success", title: "Marca eliminada" });
            cargarMarcas();
        } catch (e) {
            mostrarAlerta("No se puede eliminar", e.response?.data?.message || "Error al eliminar.", "error");
        }
    };

    const abrirVer = (marca) => { setMarcaSeleccionada(marca); setShowModalVer(true); };
    const abrirEditar = (marca) => { setMarcaSeleccionada(marca); setShowModalEditar(true); };

    const filtradas = marcas.filter((m) =>
        m.nombre?.toLowerCase().includes(busqueda.toLowerCase()),
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
                <h2 style={{ color: "var(--text-main)", margin: 0 }}>Lista de Marcas</h2>
                <button className="btn-primary" onClick={() => setShowModalCrear(true)}>+ Nueva Marca</button>
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
                    <input className="input-control" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }} placeholder="Nombre de marca..." />
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
                            paginados.map((m) => (
                                <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "12px", color: "#64748b" }}>{m.id}</td>
                                    <td style={{ padding: "12px", fontWeight: "500" }}>{m.nombre}</td>
                                    <td style={{ padding: "12px", color: "#64748b" }}>
                                        {m.cantidadProductosRelacionados ?? 0} producto(s)
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        <label
                                            className="toggle-switch"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                cambiarEstado(m);
                                            }}
                                        >
                                            <input type="checkbox" readOnly checked={m.estado === 1} />
                                            <span className="toggle-track" />
                                            <span className="toggle-label">
                                                {m.estado === 1 ? "Activo" : m.estado === 2 ? "En Desuso" : "Inactivo"}
                                            </span>
                                        </label>
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button className="btn-icon view" onClick={() => abrirVer(m)} title="Ver detalle">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                            </button>
                                            <button className="btn-icon edit" onClick={() => abrirEditar(m)} title="Editar"><PencilSquare /></button>
                                            <button className="btn-icon delete" onClick={() => eliminar(m)} title="Eliminar"><Trash3 /></button>
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

            {showModalCrear && <ModalCrearMarca cerrarModal={() => setShowModalCrear(false)} recargarTabla={cargarMarcas} />}
            {showModalEditar && <ModalEditarMarca marca={marcaSeleccionada} cerrarModal={() => setShowModalEditar(false)} recargarTabla={cargarMarcas} />}
            {showModalVer && <ModalVerMarca marca={marcaSeleccionada} cerrarModal={() => setShowModalVer(false)} />}
        </div>
    );
};

export default Marcas;