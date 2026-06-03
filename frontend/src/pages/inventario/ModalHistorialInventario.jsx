import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowDownLeftCircle, ArrowUpRightCircle, Clock, Person, Layers, Funnel } from "react-bootstrap-icons";
import { Toast } from "../../utils/alerts";
import { ModalShell, SeccionLabel } from "../../components/ui/ModalShell";

const ModalHistorialInventario = ({ producto, cerrarModal }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  const [fechaDesdeInput, setFechaDesdeInput] = useState("");
  const [fechaHastaInput, setFechaHastaInput] = useState("");

  const [fechaDesdeAplicada, setFechaDesdeAplicada] = useState("");
  const [fechaHastaAplicada, setFechaHastaAplicada] = useState("");

  const idProducto = producto?.productoId || producto?.id;
  const hoyString = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const cargarHistorial = async () => {
      setCargando(true);
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`/api/v1/inventario/productos/${idProducto}/movimientos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMovimientos(response.data || []);
      } catch (error) {
        console.error("Error al traer el historial:", error);
        Toast.fire({ 
          icon: "error", 
          title: "No se pudo cargar el historial de movimientos" 
        });
      } finally {
        setCargando(false);
      }
    };

    if (idProducto) {
      cargarHistorial();
    } else {
      setCargando(false);
    }
  }, [idProducto]);

  const nombreProducto = producto?.productoNombre || producto?.nombre || `Artículo #${idProducto}`;

  const obtenerBadgeMovimiento = (tipo) => {
    const normalizado = String(tipo || "").toUpperCase().trim();
    
    if (normalizado.includes("INGRESO") || normalizado.includes("ENTRADA") || normalizado.includes("POSITIVO")) {
      return {
        esIngreso: true,
        texto: "INGRESO",
        colorTexto: "#0369a1",
        colorBg: "#e0f2fe",
        icono: <ArrowDownLeftCircle size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
      };
    }
    
    return {
      esIngreso: false,
      texto: "SALIDA",
      colorTexto: "#c2410c",
      colorBg: "#ffedd5",
      icono: <ArrowUpRightCircle size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
    };
  };

  const cambiarFechaDesde = (valor) => {
    if (valor > hoyString) {
      Toast.fire({ icon: "warning", title: "La fecha inicial no puede ser mayor a hoy" });
      setFechaDesdeInput(hoyString);
      return;
    }
    if (fechaHastaInput && valor > fechaHastaInput) {
      Toast.fire({ icon: "warning", title: "La fecha inicial no puede superar a la fecha final" });
      setFechaDesdeInput(fechaHastaInput);
      return;
    }
    setFechaDesdeInput(valor);
  };

  const cambiarFechaHasta = (valor) => {
    if (valor > hoyString) {
      Toast.fire({ icon: "warning", title: "La fecha final no puede ser mayor a hoy" });
      setFechaHastaInput(hoyString);
      return;
    }
    if (fechaDesdeInput && valor < fechaDesdeInput) {
      Toast.fire({ icon: "warning", title: "La fecha final no puede ser menor a la fecha inicial" });
      setFechaHastaInput(fechaDesdeInput);
      return;
    }
    setFechaHastaInput(valor);
  };

  const manejarFiltrarFechas = () => {
    if (fechaDesdeInput && fechaHastaInput && fechaDesdeInput > fechaHastaInput) {
      Toast.fire({
        icon: "error",
        title: "Rango inválido: La fecha 'Desde' no puede ser mayor que 'Hasta'"
      });
      return;
    }

    if (fechaDesdeInput > hoyString || fechaHastaInput > hoyString) {
      Toast.fire({
        icon: "error",
        title: "Rango inválido: No se admiten búsquedas en fechas futuras"
      });
      return;
    }

    setFechaDesdeAplicada(fechaDesdeInput);
    setFechaHastaAplicada(fechaHastaInput);
  };

  const manejarLimpiarFiltros = () => {
    setFiltroTipo("TODOS");
    setFechaDesdeInput("");
    setFechaHastaInput("");
    setFechaDesdeAplicada("");
    setFechaHastaAplicada("");
  };

  const movimientosFiltrados = movimientos.filter((mov) => {
    const badge = obtenerBadgeMovimiento(mov.tipo);
    
    if (filtroTipo === "INGRESO" && !badge.esIngreso) return false;
    if (filtroTipo === "SALIDA" && badge.esIngreso) return false;

    if (mov.fecha) {
      const fechaMovimiento = mov.fecha.split("T")[0];
      
      if (fechaDesdeAplicada && fechaMovimiento < fechaDesdeAplicada) return false;
      if (fechaHastaAplicada && fechaMovimiento > fechaHastaAplicada) return false;
    } else if (fechaDesdeAplicada || fechaHastaAplicada) {
      return false; 
    }

    return true;
  });

  return (
    <ModalShell
      titulo="Historial de Movimientos (Kárdex)"
      onClose={cerrarModal}
      footer={
        <button className="btn-secondary" onClick={cerrarModal}>
          Cerrar Historial
        </button>
      }
    >
      <SeccionLabel text="Información del Artículo" />
      <div style={{ fontSize: "14px", color: "var(--text-main)", background: "var(--bg-light)", padding: "12px", borderRadius: "6px", marginBottom: "15px" }}>
        Producto: <strong>{nombreProducto}</strong> <br />
        {producto?.productoCodigo && <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>SKU: <code>{producto.productoCodigo}</code> | </span>}
        Stock actual en tienda: <strong>{producto?.stockActual ?? 0} uds</strong>
      </div>

      <SeccionLabel text="Filtros de Búsqueda" />
      <div 
        style={{ 
          background: "#f8fafc", 
          padding: "12px", 
          borderRadius: "6px", 
          border: "1px solid #e2e8f0", 
          marginBottom: "15px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px"
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>
            TIPO DE OPERACIÓN
          </label>
          <select 
            className="input-control" 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{ padding: "4px 8px", fontSize: "12px", height: "32px" }}
          >
            <option value="TODOS">Todos los movimientos</option>
            <option value="INGRESO">Solo Ingresos</option>
            <option value="SALIDA">Solo Salidas</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>
            DESDE
          </label>
          <input 
            type="date" 
            className="input-control"
            value={fechaDesdeInput}
            max={fechaHastaInput || hoyString}
            onChange={(e) => cambiarFechaDesde(e.target.value)} 
            style={{ padding: "4px 8px", fontSize: "12px", height: "32px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>
            HASTA
          </label>
          <input 
            type="date" 
            className="input-control"
            value={fechaHastaInput}
            min={fechaDesdeInput}
            max={hoyString}
            onChange={(e) => cambiarFechaHasta(e.target.value)} 
            style={{ padding: "4px 8px", fontSize: "12px", height: "32px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
          <button
            type="button"
            className="btn-primary"
            onClick={manejarFiltrarFechas}
            style={{ 
              flex: 1,
              height: "32px", 
              fontSize: "11px", 
              padding: "0", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "4px",
              backgroundColor: "var(--primary-color, #2563eb)"
            }}
          >
            <Funnel size={12} />
            Filtrar
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={manejarLimpiarFiltros}
            style={{ height: "32px", fontSize: "11px", padding: "0 10px" }}
          >
            Limpiar
          </button>
        </div>
      </div>

      <SeccionLabel text={`Línea de Tiempo de Auditoría (${movimientosFiltrados.length})`} />
      <div style={{ maxHeight: "280px", overflowY: "auto", paddingRight: "5px" }}>
        {cargando ? (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "13px" }}>
            Consultando auditoría de movimientos...
          </div>
        ) : movimientosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "13px", background: "#f8fafc", borderRadius: "6px", border: "1px dashed #e2e8f0" }}>
            No se encontraron variaciones que coincidan con los filtros aplicados.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {movimientosFiltrados.map((mov) => {
              const badge = obtenerBadgeMovimiento(mov.tipo);
              return (
                <div 
                  key={mov.id} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start", 
                    background: "#fff", 
                    padding: "12px", 
                    borderRadius: "6px", 
                    border: "1px solid var(--border-color, #e2e8f0)", 
                    fontSize: "12px" 
                  }}
                >
                  <div>
                    <div style={{ marginBottom: "6px" }}>
                      <span 
                        style={{ 
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 8px", 
                          borderRadius: "4px", 
                          fontWeight: 600, 
                          fontSize: "10px", 
                          backgroundColor: badge.colorBg, 
                          color: badge.colorTexto 
                        }}
                      >
                        {badge.icono}
                        {badge.texto}
                      </span>
                      
                      <span style={{ color: "var(--text-main)", fontSize: "13px", marginLeft: "10px" }}>
                        Cantidad: <strong>{mov.cantidad} uds.</strong>
                      </span>
                    </div>

                    <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <Layers size={12} />
                      <span>Stock: {mov.stockPrevio} uds. → <strong>{mov.stockNuevo} uds.</strong></span>
                    </div>

                    {mov.empleadoNombre && (
                      <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <Person size={12} />
                        <span>Realizado por: <span>{mov.empleadoNombre}</span></span>
                      </div>
                    )}

                    <span style={{ color: "var(--text-muted)", fontStyle: "italic", display: "inline-block", marginTop: "4px", fontSize: "12px" }}>
                      "{mov.motivo || "Sin justificación registrada"}"
                    </span>
                  </div>

                  <div style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                    <Clock size={12} />
                    {mov.fecha ? new Date(mov.fecha).toLocaleString() : "Reciente"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default ModalHistorialInventario;