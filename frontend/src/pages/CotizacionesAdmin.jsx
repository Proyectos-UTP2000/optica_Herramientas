import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { Toast } from "../utils/alerts";
import { 
  FileText, 
  Search, 
  Eye, 
  Whatsapp, 
  CheckCircleFill, 
  XCircleFill, 
  CalendarDate, 
  Person, 
  Cash, 
  ChatLeftTextFill 
} from "react-bootstrap-icons";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const CotizacionesAdmin = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  // Detail Modal State
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  const cargarCotizaciones = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/v1/cotizaciones", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCotizaciones(response.data || []);
    } catch (error) {
      console.error("Error al cargar cotizaciones:", error);
      Toast.fire({ icon: "error", title: "No se pudieron obtener las cotizaciones" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    setGuardandoEstado(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.patch(`/api/v1/cotizaciones/${id}/estado`, { estado: nuevoEstado }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Toast.fire({ icon: "success", title: `Cotización marcada como ${nuevoEstado}` });
      setSeleccionada(res.data);
      cargarCotizaciones();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Toast.fire({ icon: "error", title: "No se pudo cambiar el estado" });
    } finally {
      setGuardandoEstado(false);
    }
  };

  const handleAbrirDetalle = (coti) => {
    setSeleccionada(coti);
    setModalAbierto(true);
  };

  const cleanPhone = (phone) => {
    if (!phone) return "";
    // Remove non-digit chars except plus
    let cleaned = phone.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) {
      // Assume local Peru if length is 9 digits and doesn't start with country code
      if (cleaned.length === 9) {
        cleaned = "51" + cleaned;
      }
    } else {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  const handleContactarWhatsapp = (coti) => {
    const telefono = cleanPhone(coti.clienteTelefono);
    if (!telefono) {
      Toast.fire({ icon: "warning", title: "El cliente no registró un número telefónico válido" });
      return;
    }

    const itemsStr = coti.detalles.map(d => `- ${d.cantidad}x ${d.productoNombre}`).join("%0A");
    const texto = `Hola *${coti.clienteNombre}*, te saludamos de la Óptica. Hemos recibido tu solicitud de cotización web N° *${coti.id}* por los siguientes productos:%0A${itemsStr}%0APor un total estimado de *${formatoMoneda(coti.totalEstimado)}*. %0A¿Te gustaría coordinar la compra o recibir asesoría con la medida de tus lunas?`;

    const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${texto}`;
    window.open(url, "_blank");

    // Auto-update status to CONTACTADO if it was PENDIENTE
    if (coti.estado === "PENDIENTE") {
      handleCambiarEstado(coti.id, "CONTACTADO");
    }
  };

  const cotizacionesFiltradas = cotizaciones.filter((c) => {
    const cotiCliente = c.clienteNombre?.toLowerCase() || "";
    const cotiDoc = c.clienteDocumento || "";
    const cotiTel = c.clienteTelefono || "";
    const query = busqueda.toLowerCase();

    const coincideBusqueda = cotiCliente.includes(query) || cotiDoc.includes(query) || cotiTel.includes(query);
    const coincideEstado = filtroEstado === "TODOS" || c.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const getBadgeStyle = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return { backgroundColor: "#fef3c7", color: "#d97706" }; // Yellow
      case "CONTACTADO":
        return { backgroundColor: "#dbeafe", color: "#2563eb" }; // Blue
      case "PROCESADO":
        return { backgroundColor: "#d1e7dd", color: "#0f5132" }; // Green
      case "ANULADO":
        return { backgroundColor: "#f8d7da", color: "#842029" }; // Red
      default:
        return { backgroundColor: "#f1f5f9", color: "#475569" };
    }
  };

  const styles = {
    container: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "2px solid #e2e8f0", paddingBottom: "15px" },
    title: { fontSize: "26px", color: "#1e293b", margin: 0, fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" },
    filtersContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", marginBottom: "20px", flexWrap: "wrap" },
    searchBarContainer: { position: "relative", minWidth: "300px" },
    searchInput: { width: "100%", padding: "10px 15px 10px 40px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", backgroundColor: "#fff" },
    searchIcon: { position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" },
    select: { padding: "10px 15px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#475569", backgroundColor: "#fff", cursor: "pointer" },
    tableContainer: { backgroundColor: "#ffffff", borderRadius: "14px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" },
    th: { backgroundColor: "#f1f5f9", color: "#475569", padding: "15px 20px", fontWeight: "600", borderBottom: "2px solid #e2e8f0" },
    td: { padding: "15px 20px", borderBottom: "1px solid #e2e8f0", color: "#334155", verticalAlign: "middle" },
    badge: (estado) => ({
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      display: "inline-block",
      textTransform: "uppercase",
      ...getBadgeStyle(estado)
    }),
    btnAction: (bgColor) => ({ backgroundColor: bgColor, color: "#ffffff", border: "none", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 150ms" }),
    
    // Modal Styles
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.45)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
    modal: { width: "min(700px, 100%)", backgroundColor: "#fff", borderRadius: "14px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", border: "1px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" },
    modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" },
    modalTitle: { margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "600" },
    btnClose: { border: "none", background: "none", color: "#64748b", fontSize: "20px", cursor: "pointer" },
    modalBody: { padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" },
    gridInfo: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
    infoItem: { backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "8px", padding: "12px" },
    infoLabel: { fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" },
    infoValue: { fontSize: "14px", color: "#0f172a", fontWeight: "600", margin: 0, display: "flex", alignItems: "center", gap: "6px" },
    tableDetail: { width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "10px" },
    thDetail: { padding: "10px", backgroundColor: "#f8fafc", color: "#64748b", fontWeight: "600", borderBottom: "1px solid #e2e8f0" },
    tdDetail: { padding: "10px", borderBottom: "1px solid #f1f5f9", color: "#475569" },
    modalFooter: { padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", backgroundColor: "#f8fafc" },
    btnGroup: { display: "flex", gap: "8px" },
    btnCerrar: { padding: "9px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#475569", fontWeight: "600", fontSize: "13px", cursor: "pointer" },
    btnWhatsapp: { padding: "9px 16px", borderRadius: "8px", border: "none", backgroundColor: "#25d366", color: "#fff", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <FileText /> Gestión de Cotizaciones Web
        </h2>
      </div>

      <div style={styles.filtersContainer}>
        <div style={styles.searchBarContainer}>
          <Search style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por cliente, RUC/DNI, teléfono..."
            style={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Filtrar Estado:</span>
          <select
            style={styles.select}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONTACTADO">Contactados</option>
            <option value="PROCESADO">Procesados</option>
            <option value="ANULADO">Anulados</option>
          </select>
        </div>
      </div>

      {cargando ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Cargando cotizaciones web...</div>
      ) : cotizacionesFiltradas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No se encontraron cotizaciones.</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>N°</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Contacto</th>
                <th style={styles.th}>Total Estimado</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.map((coti) => (
                <tr key={coti.id}>
                  <td style={{ ...styles.td, fontWeight: "700", color: "#1e293b" }}>#{coti.id}</td>
                  <td style={styles.td}>
                    {new Date(coti.fechaCreacion).toLocaleDateString("es-PE")}
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {new Date(coti.fechaCreacion).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "600", color: "#0f172a" }}>{coti.clienteNombre}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{coti.clienteDocumento || "Sin Documento"}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{coti.clienteTelefono || "---"}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{coti.clienteCorreo || "---"}</div>
                  </td>
                  <td style={{ ...styles.td, fontWeight: "700", color: "#0f172a" }}>
                    {formatoMoneda(coti.totalEstimado)}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge(coti.estado)}>{coti.estado}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        title="Ver detalles"
                        style={styles.btnAction("#2563eb")}
                        onClick={() => handleAbrirDetalle(coti)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Contactar vía WhatsApp"
                        style={styles.btnAction("#25d366")}
                        onClick={() => handleContactarWhatsapp(coti)}
                      >
                        <Whatsapp size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {modalAbierto && seleccionada && (
        <div style={styles.overlay} onMouseDown={() => setModalAbierto(false)}>
          <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Detalle de Cotización #{seleccionada.id}</h3>
              <button style={styles.btnClose} onClick={() => setModalAbierto(false)}>×</button>
            </div>

            <div style={styles.modalBody}>
              {/* Información del Cliente */}
              <div style={styles.gridInfo}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Cliente</div>
                  <p style={styles.infoValue}><Person /> {seleccionada.clienteNombre}</p>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Documento (DNI/RUC)</div>
                  <p style={styles.infoValue}>{seleccionada.clienteDocumento || "No Registrado"}</p>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Teléfono</div>
                  <p style={styles.infoValue}><TelephoneFill size={12} /> {seleccionada.clienteTelefono || "No Registrado"}</p>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Fecha de Solicitud</div>
                  <p style={styles.infoValue}><CalendarDate /> {new Date(seleccionada.fechaCreacion).toLocaleString("es-PE")}</p>
                </div>
              </div>

              {/* Detalle de Productos */}
              <div>
                <h4 style={{ fontSize: "14px", color: "#334155", fontWeight: "600", margin: "0 0 10px 0" }}>Productos Solicitados</h4>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                  <table style={styles.tableDetail}>
                    <thead>
                      <tr>
                        <th style={styles.thDetail}>Código</th>
                        <th style={styles.thDetail}>Producto</th>
                        <th style={styles.thDetail}>Cant.</th>
                        <th style={styles.thDetail}>P. Unitario</th>
                        <th style={styles.thDetail}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seleccionada.detalles.map((det) => (
                        <tr key={det.id}>
                          <td style={styles.tdDetail}>{det.productoCodigo}</td>
                          <td style={{ ...styles.tdDetail, fontWeight: "600" }}>{det.productoNombre}</td>
                          <td style={styles.tdDetail}>{det.cantidad}</td>
                          <td style={styles.tdDetail}>{formatoMoneda(det.precioLista)}</td>
                          <td style={{ ...styles.tdDetail, fontWeight: "600", color: "#0f172a" }}>{formatoMoneda(det.subtotal)}</td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: "#f8fafc" }}>
                        <td colSpan="4" style={{ ...styles.tdDetail, textAlign: "right", fontWeight: "700", color: "#475569" }}>Total Estimado:</td>
                        <td style={{ ...styles.tdDetail, fontWeight: "800", color: "#2563eb", fontSize: "14px" }}>{formatoMoneda(seleccionada.totalEstimado)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observaciones */}
              {seleccionada.observaciones && (
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}><ChatLeftTextFill size={10} /> Notas / Observaciones del Cliente</div>
                  <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#475569", whiteSpace: "pre-line" }}>{seleccionada.observaciones}</p>
                </div>
              )}

              {/* Estado Actual */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <span style={{ fontSize: "13px", color: "#475569", fontWeight: "600" }}>Estado de la Solicitud:</span>
                <span style={styles.badge(seleccionada.estado)}>{seleccionada.estado}</span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCerrar} onClick={() => setModalAbierto(false)}>Cerrar</button>
              
              <div style={styles.btnGroup}>
                <button 
                  style={styles.btnWhatsapp}
                  onClick={() => handleContactarWhatsapp(seleccionada)}
                >
                  <Whatsapp /> Contactar WhatsApp
                </button>

                {seleccionada.estado === "PENDIENTE" && (
                  <button 
                    style={{ ...styles.btnCerrar, backgroundColor: "#3b82f6", color: "#fff", border: "none" }}
                    onClick={() => handleCambiarEstado(seleccionada.id, "CONTACTADO")}
                    disabled={guardandoEstado}
                  >
                    Marcar Contactado
                  </button>
                )}

                {(seleccionada.estado === "PENDIENTE" || seleccionada.estado === "CONTACTADO") && (
                  <>
                    <button 
                      style={{ ...styles.btnCerrar, backgroundColor: "#198754", color: "#fff", border: "none" }}
                      onClick={() => handleCambiarEstado(seleccionada.id, "PROCESADO")}
                      disabled={guardandoEstado}
                    >
                      Procesar
                    </button>
                    <button 
                      style={{ ...styles.btnCerrar, backgroundColor: "#dc3545", color: "#fff", border: "none" }}
                      onClick={() => handleCambiarEstado(seleccionada.id, "ANULADO")}
                      disabled={guardandoEstado}
                    >
                      Anular
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CotizacionesAdmin;
