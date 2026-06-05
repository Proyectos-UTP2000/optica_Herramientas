import { useEffect, useMemo, useState } from "react";
import { ArrowRepeat, Eye, Receipt, Search } from "react-bootstrap-icons";
import {
  listarEmpleadosReporte,
  listarProductosReporte,
  obtenerDetalleVenta,
  obtenerReporteVentas,
} from "../../api/reportesService";
import { Toast } from "../../utils/alerts";

const hoy = () => new Date().toISOString().split("T")[0];
const formatoMoneda = (valor) => Number(valor || 0).toLocaleString("es-PE", { style: "currency", currency: "PEN" });
const formatoFechaHora = (valor) => valor ? new Date(valor).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) : "--";
const mensajeBackend = (error, fallback) => error.response?.data?.message || fallback;

const ReporteVentas = () => {
  const [desde, setDesde] = useState(hoy());
  const [hasta, setHasta] = useState(hoy());
  const [empleadoId, setEmpleadoId] = useState("");
  const [texto, setTexto] = useState("");
  const [productoTexto, setProductoTexto] = useState("");
  const [numeroVenta, setNumeroVenta] = useState("");
  const [medioPago, setMedioPago] = useState("");
  const [productos, setProductos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);

  const sugerenciasProducto = useMemo(() => {
    const q = productoTexto.trim().toLowerCase();
    if (q.length < 2) return [];
    return productos
      .filter((p) => [p.codigo, p.nombre].filter(Boolean).join(" ").toLowerCase().includes(q))
      .slice(0, 8);
  }, [productoTexto, productos]);

  const cargarReporte = async () => {
    if (hasta < desde) {
      Toast.fire({ icon: "warning", title: "La fecha final no puede ser menor que la inicial" });
      return;
    }
    setCargando(true);
    try {
      setReporte(await obtenerReporteVentas({
        desde,
        hasta,
        empleadoId,
        texto,
        producto: productoTexto,
        numeroVenta,
        medioPago,
      }));
    } catch (error) {
      Toast.fire({ icon: "error", title: mensajeBackend(error, "No se pudo cargar el reporte de ventas") });
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      setDetalle(await obtenerDetalleVenta(id));
    } catch (error) {
      Toast.fire({ icon: "error", title: mensajeBackend(error, "No se pudo cargar el detalle de la venta") });
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      Promise.all([listarProductosReporte(), listarEmpleadosReporte()])
        .then(([productosData, empleadosData]) => {
          setProductos(productosData.filter((item) => item.estado === 1));
          setEmpleados(empleadosData.filter((item) => item.estado === 1));
        })
        .catch(() => Toast.fire({ icon: "error", title: "No se pudieron cargar filtros de ventas" }));
      cargarReporte();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const ventas = reporte?.ventas || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Receipt style={{ marginRight: 8 }} />Ventas</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
            Busqueda de ventas por filtros operativos.
          </p>
        </div>
      </div>

      <div className="report-filter-grid">
        <div><label className="form-label">Desde</label><input className="input-control" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></div>
        <div><label className="form-label">Hasta</label><input className="input-control" type="date" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} /></div>
        <div>
          <label className="form-label">Empleado</label>
          <select className="input-control" value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}>
            <option value="">Todos</option>
            {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombreCompleto || e.nombre || e.username}</option>)}
          </select>
        </div>
        <div><label className="form-label">Cliente/comprobante</label><input className="input-control" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Cliente, comprobante..." /></div>
        <div className="autocomplete-box">
          <label className="form-label">Producto</label>
          <input className="input-control" value={productoTexto} onChange={(e) => setProductoTexto(e.target.value)} placeholder="Codigo o nombre" />
          {sugerenciasProducto.length > 0 && (
            <div className="autocomplete-menu">
              {sugerenciasProducto.map((p) => (
                <button key={p.id} type="button" onClick={() => setProductoTexto([p.codigo, p.nombre].filter(Boolean).join(" | "))}>
                  {[p.codigo, p.nombre].filter(Boolean).join(" | ")}
                </button>
              ))}
            </div>
          )}
        </div>
        <div><label className="form-label">Nro. venta</label><input className="input-control" value={numeroVenta} onChange={(e) => setNumeroVenta(e.target.value)} placeholder="# o comprobante" /></div>
        <div>
          <label className="form-label">Medio pago</label>
          <select className="input-control" value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
            <option value="">Todos</option><option>EFECTIVO</option><option>YAPE</option><option>PLIN</option><option>TRANSFERENCIA</option><option>TARJETA</option><option>OTRO</option>
          </select>
        </div>
        <button className="btn-secondary" onClick={cargarReporte} disabled={cargando}><Search /> Buscar</button>
      </div>

      <div className="report-summary-row">
        <div className="stat-card"><span>{reporte?.cantidadVentas || 0} venta(s)</span></div>
        <div className="stat-card"><strong>{formatoMoneda(reporte?.totalVentas)}</strong><span>Total vendido</span></div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Fecha</th><th>Cliente</th><th>Empleado</th><th>Comprobante</th><th>Productos</th><th>Medio</th><th className="text-right">Total</th><th>Acciones</th></tr></thead>
          <tbody>
            {ventas.length === 0 ? <tr><td colSpan="8" className="table-empty">No hay ventas con esos filtros.</td></tr> : ventas.map((venta) => (
              <tr key={venta.ventaId}>
                <td>{formatoFechaHora(venta.fecha)}</td><td>{venta.clienteNombre || "--"}</td><td>{venta.empleadoNombre || "--"}</td><td>{venta.numeroComprobante || "--"}</td>
                <td title={venta.productosResumen}>{venta.productosResumen || "--"}</td><td>{venta.medioPago || "--"}</td><td className="text-right" style={{ fontWeight: 700 }}>{formatoMoneda(venta.total)}</td>
                <td><button className="btn-icon-table" onClick={() => verDetalle(venta.ventaId)} title="Ver detalles"><Eye /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalle && (
        <div className="modal-overlay-light" onClick={() => setDetalle(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row"><h3>Venta #{detalle.id}</h3><button className="btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button></div>
            <p><strong>Cliente:</strong> {detalle.clienteNombre} | <strong>Total:</strong> {formatoMoneda(detalle.total)}</p>
            <table className="data-table"><thead><tr><th>Producto</th><th className="text-right">Cantidad</th><th className="text-right">Precio</th><th className="text-right">Subtotal</th></tr></thead>
              <tbody>{(detalle.detalles || []).map((d) => <tr key={d.productoId}><td>{d.productoNombre}</td><td className="text-right">{d.cantidad}</td><td className="text-right">{formatoMoneda(d.precioUnitario)}</td><td className="text-right">{formatoMoneda(d.subtotal)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteVentas;
