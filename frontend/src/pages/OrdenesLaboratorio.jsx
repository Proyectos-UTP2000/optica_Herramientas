import { useState, useEffect } from "react";
import { Toast, mostrarAlerta } from "../utils/alerts";
import {
  getOrdenesLaboratorio,
  actualizarEstadoOrden,
} from "../api/clinicaService";
import { getRecetasPorCliente } from "../api/clinicaService";
import { EyeFill } from "react-bootstrap-icons";

const OrdenesLaboratorio = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState(""); // "" means ALL

  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mostrarModalActualizar, setMostrarModalActualizar] = useState(false);
  const [mostrarModalVerMedidas, setMostrarModalVerMedidas] = useState(false);
  const [medidaReceta, setMedidaReceta] = useState(null);
  const [loadingMedida, setLoadingMedida] = useState(false);

  // Update states
  const [nuevoEstado, setNuevoEstado] = useState("ENVIADO_LABORATORIO");
  const [laboratorioNombre, setLaboratorioNombre] = useState("");
  const [fechaPromesaEntrega, setFechaPromesaEntrega] = useState("");

  const cargarOrdenes = () => {
    setLoading(true);
    getOrdenesLaboratorio(filtroEstado || null)
      .then((data) => setOrdenes(data))
      .catch((err) => console.error("Error al cargar órdenes", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarOrdenes();
  }, [filtroEstado]);

  const abrirActualizarEstado = (orden) => {
    setOrdenSeleccionada(orden);
    setNuevoEstado(
      orden.estadoOrden === "PENDIENTE"
        ? "ENVIADO_LABORATORIO"
        : orden.estadoOrden === "ENVIADO_LABORATORIO"
        ? "RECIBIDO_TIENDA"
        : "ENTREGADO_CLIENTE"
    );
    setLaboratorioNombre(orden.laboratorioNombre || "");
    setFechaPromesaEntrega(orden.fechaPromesaEntrega || "");
    setMostrarModalActualizar(true);
  };

  const abrirVerMedidas = async (orden) => {
    setOrdenSeleccionada(orden);
    setMostrarModalVerMedidas(true);
    setLoadingMedida(true);
    try {
      // Find the specific recipe detail
      const res = await getRecetasPorCliente(1); // Wait, we can fetch by client or we can just fetch all and find, or let's use the individual recipe endpoint!
      // Since we defined `GET /api/v1/recetas/{id}`:
      const axios = require("axios");
      const token = localStorage.getItem("token");
      const r = await axios.get(`/api/v1/recetas/${orden.recetaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedidaReceta(r.data);
    } catch (e) {
      console.error(e);
      setMedidaReceta(null);
    } finally {
      setLoadingMedida(false);
    }
  };

  const handleActualizarEstado = async (e) => {
    e.preventDefault();
    if (!ordenSeleccionada) return;

    if (nuevoEstado === "ENVIADO_LABORATORIO" && !laboratorioNombre) {
      mostrarAlerta("Error", "Debe ingresar el nombre del laboratorio.", "error");
      return;
    }

    const dto = {
      estadoOrden: nuevoEstado,
      laboratorioNombre: nuevoEstado === "ENVIADO_LABORATORIO" ? laboratorioNombre : null,
      fechaPromesaEntrega: nuevoEstado === "ENVIADO_LABORATORIO" ? fechaPromesaEntrega : null,
    };

    try {
      await actualizarEstadoOrden(ordenSeleccionada.id, dto);
      Toast.fire({ icon: "success", title: "Estado de orden actualizado" });
      setMostrarModalActualizar(false);
      cargarOrdenes();
    } catch (err) {
      mostrarAlerta(
        "Error",
        err.response?.data?.message || "No se pudo actualizar el estado.",
        "error"
      );
    }
  };

  const getEstadoBadgeStyle = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return { background: "#fef3c7", color: "#d97706", border: "1px solid #f59e0b" };
      case "ENVIADO_LABORATORIO":
        return { background: "#e0f2fe", color: "#0284c7", border: "1px solid #0ea5e9" };
      case "RECIBIDO_TIENDA":
        return { background: "#dcfce7", color: "#16a34a", border: "1px solid #22c55e" };
      case "ENTREGADO_CLIENTE":
        return { background: "#f1f5f9", color: "#475569", border: "1px solid #64748b" };
      case "ANULADO":
        return { background: "#fee2e2", color: "#dc2626", border: "1px solid #ef4444" };
      default:
        return {};
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "var(--text-main)", margin: 0 }}>Órdenes de Trabajo en Laboratorio</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        {[
          { label: "Todas", value: "" },
          { label: "Pendientes", value: "PENDIENTE" },
          { label: "En Laboratorio", value: "ENVIADO_LABORATORIO" },
          { label: "En Tienda", value: "RECIBIDO_TIENDA" },
          { label: "Entregados", value: "ENTREGADO_CLIENTE" },
        ].map((tab) => (
          <button
            key={tab.label}
            className={`btn-secondary ${filtroEstado === tab.value ? "active" : ""}`}
            onClick={() => setFiltroEstado(tab.value)}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              fontWeight: filtroEstado === tab.value ? "bold" : "normal",
              fontSize: "13px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
        {loading ? (
          <p>Cargando órdenes de laboratorio...</p>
        ) : ordenes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
            <p>No se encontraron órdenes de laboratorio registradas en este estado.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid var(--border-color)", fontWeight: "600", textAlign: "left" }}>
                  <th style={{ padding: "12px 10px" }}>ID Orden</th>
                  <th style={{ padding: "12px 10px" }}>Venta</th>
                  <th style={{ padding: "12px 10px" }}>Cliente</th>
                  <th style={{ padding: "12px 10px" }}>Laboratorio</th>
                  <th style={{ padding: "12px 10px" }}>Fecha Promesa</th>
                  <th style={{ padding: "12px 10px" }}>Estado</th>
                  <th style={{ padding: "12px 10px", textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "10px", fontWeight: "600" }}>OL-{String(o.id).padStart(4, "0")}</td>
                    <td style={{ padding: "10px" }}>VT-{String(o.ventaId).padStart(4, "0")}</td>
                    <td style={{ padding: "10px" }}>{o.clienteNombre}</td>
                    <td style={{ padding: "10px" }}>{o.laboratorioNombre || "-"}</td>
                    <td style={{ padding: "10px" }}>
                      {o.fechaPromesaEntrega
                        ? new Date(o.fechaPromesaEntrega + "T00:00:00").toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          ...getEstadoBadgeStyle(o.estadoOrden),
                        }}
                      >
                        {o.estadoOrden}
                      </span>
                    </td>
                    <td style={{ padding: "10px", display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        className="btn-secondary"
                        onClick={() => abrirVerMedidas(o)}
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        <EyeFill /> Medidas
                      </button>

                      {o.estadoOrden !== "ENTREGADO_CLIENTE" && o.estadoOrden !== "ANULADO" && (
                        <button
                          className="btn-primary"
                          onClick={() => abrirActualizarEstado(o)}
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                        >
                          {o.estadoOrden === "PENDIENTE"
                            ? "Enviar Lab"
                            : o.estadoOrden === "ENVIADO_LABORATORIO"
                            ? "Recibir Tienda"
                            : "Entregar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Update status */}
      {mostrarModalActualizar && ordenSeleccionada && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "400px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ marginTop: 0, fontSize: "16px", marginBottom: "15px" }}>Actualizar Estado de Orden</h3>
            
            <form onSubmit={handleActualizarEstado}>
              <div style={{ marginBottom: "15px" }}>
                <label className="label-control">Nuevo Estado</label>
                <select
                  className="input-control"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  <option value="ENVIADO_LABORATORIO">Enviado a Laboratorio</option>
                  <option value="RECIBIDO_TIENDA">Recibido en Tienda</option>
                  <option value="ENTREGADO_CLIENTE">Entregado a Cliente</option>
                  <option value="ANULADO">Anular Orden</option>
                </select>
              </div>

              {nuevoEstado === "ENVIADO_LABORATORIO" && (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <label className="label-control">Nombre del Laboratorio</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Ej. Laboratorio Toptic"
                      value={laboratorioNombre}
                      onChange={(e) => setLaboratorioNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <label className="label-control">Fecha Promesa de Entrega</label>
                    <input
                      type="date"
                      className="input-control"
                      value={fechaPromesaEntrega}
                      onChange={(e) => setFechaPromesaEntrega(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setMostrarModalActualizar(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Refraction Details */}
      {mostrarModalVerMedidas && ordenSeleccionada && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "600px", maxWidth: "90%", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ marginTop: 0, fontSize: "16px" }}>Detalle de Medidas para Laboratorio</h3>
              <button
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-secondary)" }}
                onClick={() => setMostrarModalVerMedidas(false)}
              >
                &times;
              </button>
            </div>

            {loadingMedida ? (
              <p>Cargando medidas clínicas...</p>
            ) : !medidaReceta ? (
              <p style={{ color: "red" }}>No se pudo cargar la receta asociada a esta orden.</p>
            ) : (
              <div style={{ fontSize: "13px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div style={{ border: "1px solid #ef4444", padding: "10px", borderRadius: "6px" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#ef4444" }}>OJO DERECHO (OD)</h4>
                    <p><strong>Esfera (SPH):</strong> {medidaReceta.odEsfera || "0.00"}</p>
                    <p><strong>Cilindro (CYL):</strong> {medidaReceta.odCilindro || "0.00"}</p>
                    <p><strong>Eje (AXIS):</strong> {medidaReceta.odEje || "0"}°</p>
                    <p><strong>AV Lejos:</strong> {medidaReceta.odAvLejos || "N/A"}</p>
                  </div>
                  <div style={{ border: "1px solid #3b82f6", padding: "10px", borderRadius: "6px" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#3b82f6" }}>OJO IZQUIERDO (OI)</h4>
                    <p><strong>Esfera (SPH):</strong> {medidaReceta.oiEsfera || "0.00"}</p>
                    <p><strong>Cilindro (CYL):</strong> {medidaReceta.oiCilindro || "0.00"}</p>
                    <p><strong>Eje (AXIS):</strong> {medidaReceta.oiEje || "0"}°</p>
                    <p><strong>AV Lejos:</strong> {medidaReceta.oiAvLejos || "N/A"}</p>
                  </div>
                </div>

                <div style={{ border: "1px solid #e2e8f0", padding: "10px", borderRadius: "6px", marginBottom: "15px" }}>
                  <p><strong>Distancia Pupilar (DP):</strong> {medidaReceta.distanciaPupilar ? `${medidaReceta.distanciaPupilar} mm` : "N/A"}</p>
                  <p><strong>Adición (ADD):</strong> {medidaReceta.adicion ? `+${medidaReceta.adicion}` : "N/A"}</p>
                  <p><strong>Tipo de Luna:</strong> {medidaReceta.tipoLuna}</p>
                  <p><strong>Material sugerido:</strong> {medidaReceta.materialSugerido}</p>
                  <p><strong>Tratamientos:</strong> {medidaReceta.tratamientos && medidaReceta.tratamientos.length > 0 ? medidaReceta.tratamientos.join(", ") : "Ninguno"}</p>
                </div>

                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                  <p><strong>Observaciones:</strong> {medidaReceta.observaciones || "Sin especificaciones adicionales."}</p>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px" }}>
              <button className="btn-secondary" onClick={() => setMostrarModalVerMedidas(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenLaboratorio;
