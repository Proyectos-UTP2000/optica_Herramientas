import { useEffect, useMemo, useState } from "react";
import { BoxArrowInDown, Eye, Search } from "react-bootstrap-icons";
import {
  listarProveedoresReporte,
  obtenerDetalleCompra,
  obtenerReporteCompras,
} from "../../api/reportesService";
import { Toast } from "../../utils/alerts";

const hoy = () => new Date().toISOString().split("T")[0];
const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });
const formatoFechaHora = (valor) =>
  valor
    ? new Date(valor).toLocaleString("es-PE", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "--";
const mensajeBackend = (error, fallback) =>
  error.response?.data?.message || fallback;

const ReporteCompras = () => {
  const [desde, setDesde] = useState(hoy());
  const [hasta, setHasta] = useState(hoy());
  const [proveedor, setProveedor] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);

  const sugerenciasProveedor = useMemo(() => {
    const q = proveedor.trim().toLowerCase();
    if (q.length < 2) return [];
    return proveedores
      .filter((p) =>
        [p.numeroDocumento, p.razonSocial, p.nombreComercial]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [proveedor, proveedores]);

  const cargarReporte = async () => {
    if (hasta < desde) {
      Toast.fire({
        icon: "warning",
        title: "La fecha final no puede ser menor que la inicial",
      });
      return;
    }
    setCargando(true);
    try {
      setReporte(await obtenerReporteCompras({ proveedor, desde, hasta }));
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: mensajeBackend(error, "No se pudo cargar el reporte de compras"),
      });
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      setDetalle(await obtenerDetalleCompra(id));
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: mensajeBackend(
          error,
          "No se pudo cargar el detalle de la compra",
        ),
      });
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      listarProveedoresReporte()
        .then((data) =>
          setProveedores(data.filter((item) => item.estado === 1)),
        )
        .catch(() =>
          Toast.fire({
            icon: "error",
            title: "No se pudieron cargar los proveedores",
          }),
        );
      cargarReporte();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const compras = reporte?.compras || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BoxArrowInDown style={{ marginRight: 8 }} />
            Compras por Proveedor
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            Busqueda de compras por proveedor y rango de fechas.
          </p>
        </div>
      </div>

      <div className="report-filter-grid">
        <div className="autocomplete-box wide-filter">
          <label className="form-label">Proveedor</label>
          <input
            className="input-control"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            placeholder="RUC, razon social o nombre comercial"
          />
          {sugerenciasProveedor.length > 0 && (
            <div className="autocomplete-menu">
              {sugerenciasProveedor.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setProveedor(
                      [p.numeroDocumento, p.razonSocial || p.nombreComercial]
                        .filter(Boolean)
                        .join(" | "),
                    )
                  }
                >
                  {[p.numeroDocumento, p.razonSocial || p.nombreComercial]
                    .filter(Boolean)
                    .join(" | ")}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="form-label">Desde</label>
          <input
            className="input-control"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Hasta</label>
          <input
            className="input-control"
            type="date"
            value={hasta}
            min={desde}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        <button
          className="btn-secondary"
          onClick={cargarReporte}
          disabled={cargando}
        >
          <Search /> Buscar
        </button>
      </div>

      <div className="report-summary-row">
        <div className="stat-card">
          <span>{reporte?.cantidadCompras || 0} compra(s)</span>
        </div>
        <div className="stat-card">
          <strong>{formatoMoneda(reporte?.totalCompras)}</strong>
          <span>Total comprado</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Empleado</th>
              <th>Comprobante</th>
              <th>Medio</th>
              <th>Estado</th>
              <th className="text-right">Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty">
                  No hay compras con esos filtros.
                </td>
              </tr>
            ) : (
              compras.map((compra) => (
                <tr key={compra.compraId}>
                  <td>{formatoFechaHora(compra.fecha)}</td>
                  <td>{compra.proveedorNombre || "--"}</td>
                  <td>{compra.empleadoNombre || "--"}</td>
                  <td>{compra.numeroComprobante || "--"}</td>
                  <td>{compra.medioPago || "--"}</td>
                  <td>{compra.estado || "--"}</td>
                  <td className="text-right" style={{ fontWeight: 700 }}>
                    {formatoMoneda(compra.total)}
                  </td>
                  <td>
                    <button
                      className="btn-icon-table"
                      onClick={() => verDetalle(compra.compraId)}
                      title="Ver detalles"
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detalle && (
        <div className="modal-overlay-light" onClick={() => setDetalle(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Compra #{detalle.id}</h3>
              <button
                className="btn-secondary"
                onClick={() => setDetalle(null)}
              >
                Cerrar
              </button>
            </div>
            <p>
              <strong>Proveedor:</strong> {detalle.proveedorNombre} |{" "}
              <strong>Total:</strong> {formatoMoneda(detalle.total)}
            </p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-right">Cant. compra</th>
                  <th className="text-right">Cant. inventario</th>
                  <th className="text-right">Costo</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(detalle.detalles || []).map((d) => (
                  <tr key={d.productoId}>
                    <td>{d.productoNombre}</td>
                    <td className="text-right">{d.cantidadCompra}</td>
                    <td className="text-right">{d.cantidadInventario}</td>
                    <td className="text-right">
                      {formatoMoneda(d.costoUnitario)}
                    </td>
                    <td className="text-right">{formatoMoneda(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteCompras;
