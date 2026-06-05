import { useEffect, useState } from "react";
import { CashCoin, Eye, Search } from "react-bootstrap-icons";
import { listarEmpleadosReporte, obtenerDetalleCaja, obtenerReporteCajas } from "../../api/reportesService";
import { Toast } from "../../utils/alerts";

const hoy = () => new Date().toISOString().split("T")[0];
const formatoMoneda = (valor) => Number(valor || 0).toLocaleString("es-PE", { style: "currency", currency: "PEN" });
const formatoFechaHora = (valor) => valor ? new Date(valor).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) : "--";
const mensajeBackend = (error, fallback) => error.response?.data?.message || fallback;

const ReporteCajas = () => {
  const [desde, setDesde] = useState(hoy());
  const [hasta, setHasta] = useState(hoy());
  const [empleadoId, setEmpleadoId] = useState("");
  const [estado, setEstado] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarReporte = async () => {
    if (hasta < desde) {
      Toast.fire({ icon: "warning", title: "La fecha final no puede ser menor que la inicial" });
      return;
    }
    setCargando(true);
    try {
      setReporte(await obtenerReporteCajas({ desde, hasta, empleadoId, estado }));
    } catch (error) {
      Toast.fire({ icon: "error", title: mensajeBackend(error, "No se pudo cargar el historial de cajas") });
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      setDetalle(await obtenerDetalleCaja(id));
    } catch (error) {
      Toast.fire({ icon: "error", title: mensajeBackend(error, "No se pudo cargar el detalle de caja") });
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      listarEmpleadosReporte()
        .then((data) => setEmpleados(data.filter((item) => item.estado === 1)))
        .catch(() => Toast.fire({ icon: "error", title: "No se pudieron cargar los empleados" }));
      cargarReporte();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const cajas = reporte?.cajas || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><CashCoin style={{ marginRight: 8 }} />Caja</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
            Historial de aperturas, cierres y movimientos de caja.
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
        <div>
          <label className="form-label">Estado</label>
          <select className="input-control" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option><option value="ABIERTA">Abierta</option><option value="CERRADA">Cerrada</option>
          </select>
        </div>
        <button className="btn-secondary" onClick={cargarReporte} disabled={cargando}><Search /> Buscar</button>
      </div>

      <div className="report-summary-row">
        <div className="stat-card"><span>{reporte?.cantidadCajas || 0} caja(s)</span></div>
        <div className="stat-card"><strong>{formatoMoneda(reporte?.totalIngresos)}</strong><span>Ingresos</span></div>
        <div className="stat-card"><strong>{formatoMoneda(reporte?.totalEgresos)}</strong><span>Egresos</span></div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Caja</th><th>Empleado</th><th>Apertura</th><th>Cierre</th><th>Estado</th><th className="text-right">Inicial</th><th className="text-right">Ingresos</th><th className="text-right">Egresos</th><th className="text-right">Diferencia</th><th>Acciones</th></tr></thead>
          <tbody>
            {cajas.length === 0 ? <tr><td colSpan="10" className="table-empty">No hay cajas con esos filtros.</td></tr> : cajas.map((caja) => (
              <tr key={caja.cajaId}>
                <td>#{caja.cajaId}</td><td>{caja.empleadoNombre}</td><td>{formatoFechaHora(caja.fechaApertura)}</td><td>{formatoFechaHora(caja.fechaCierre)}</td><td>{caja.estado}</td>
                <td className="text-right">{formatoMoneda(caja.montoInicial)}</td><td className="text-right">{formatoMoneda(caja.totalIngresos)}</td><td className="text-right">{formatoMoneda(caja.totalEgresos)}</td><td className="text-right">{formatoMoneda(caja.diferencia)}</td>
                <td><button className="btn-icon-table" onClick={() => verDetalle(caja.cajaId)} title="Ver detalle"><Eye /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalle && (
        <div className="modal-overlay-light" onClick={() => setDetalle(null)}>
          <div className="detail-modal detail-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row"><h3>Caja #{detalle.caja?.id}</h3><button className="btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button></div>
            <p><strong>Empleado:</strong> {detalle.caja?.empleadoNombre} | <strong>Estado:</strong> {detalle.caja?.estado} | <strong>Esperado:</strong> {formatoMoneda(detalle.caja?.montoEsperado)}</p>
            <h4>Movimientos</h4>
            <table className="data-table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Origen</th><th>Metodo</th><th>Descripcion</th><th className="text-right">Monto</th></tr></thead>
              <tbody>{(detalle.movimientos || []).length === 0 ? <tr><td colSpan="6" className="table-empty">Sin movimientos.</td></tr> : detalle.movimientos.map((m) => <tr key={m.id}><td>{formatoFechaHora(m.fecha)}</td><td>{m.tipo}</td><td>{m.origen}</td><td>{m.metodoPago}</td><td>{m.descripcion}</td><td className="text-right">{formatoMoneda(m.monto)}</td></tr>)}</tbody>
            </table>
            <h4>Ventas asociadas</h4>
            <table className="data-table"><thead><tr><th>Fecha</th><th>Cliente</th><th>Comprobante</th><th>Medio</th><th className="text-right">Total</th></tr></thead>
              <tbody>{(detalle.ventas || []).length === 0 ? <tr><td colSpan="5" className="table-empty">Sin ventas.</td></tr> : detalle.ventas.map((v) => <tr key={v.ventaId}><td>{formatoFechaHora(v.fecha)}</td><td>{v.clienteNombre}</td><td>{v.numeroComprobante}</td><td>{v.medioPago}</td><td className="text-right">{formatoMoneda(v.total)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteCajas;
