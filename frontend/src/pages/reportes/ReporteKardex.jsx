import { useEffect, useMemo, useState } from "react";
import { Boxes, ListColumns, Search } from "react-bootstrap-icons";
import {
  listarProductosReporte,
  obtenerReporteKardex,
} from "../../api/reportesService";
import { Toast } from "../../utils/alerts";

const hoy = () => new Date().toISOString().split("T")[0];
const formatoFechaHora = (valor) =>
  valor
    ? new Date(valor).toLocaleString("es-PE", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "--";
const formatoCantidad = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
const mensajeBackend = (error, fallback) =>
  error.response?.data?.message || fallback;

const ReporteKardex = () => {
  const [desde, setDesde] = useState(hoy());
  const [hasta, setHasta] = useState(hoy());
  const [productoTexto, setProductoTexto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);

  const sugerenciasProducto = useMemo(() => {
    const q = productoTexto.trim().toLowerCase();
    if (q.length < 2) return [];
    return productos
      .filter((p) =>
        [p.codigo, p.nombre]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [productoTexto, productos]);

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setProductoTexto(
      [producto.codigo, producto.nombre].filter(Boolean).join(" | "),
    );
  };

  const cargarKardex = async () => {
    if (!productoSeleccionado) {
      Toast.fire({
        icon: "warning",
        title: "Seleccione un producto de la lista",
      });
      return;
    }
    if (hasta < desde) {
      Toast.fire({
        icon: "warning",
        title: "La fecha final no puede ser menor que la inicial",
      });
      return;
    }
    setCargando(true);
    try {
      setReporte(
        await obtenerReporteKardex({
          productoId: productoSeleccionado.id,
          desde,
          hasta,
        }),
      );
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: mensajeBackend(error, "No se pudo cargar el kardex"),
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      listarProductosReporte()
        .then((data) => setProductos(data.filter((item) => item.estado === 1)))
        .catch(() =>
          Toast.fire({
            icon: "error",
            title: "No se pudieron cargar los productos",
          }),
        );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const movimientos = reporte?.movimientos || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ListColumns style={{ marginRight: 8 }} />
            Kardex
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            Historial de movimientos por producto.
          </p>
        </div>
      </div>

      <div className="report-filter-grid">
        <div className="autocomplete-box wide-filter">
          <label className="form-label">Producto</label>
          <input
            className="input-control"
            value={productoTexto}
            onChange={(e) => {
              setProductoTexto(e.target.value);
              setProductoSeleccionado(null);
            }}
            placeholder="Escriba codigo o nombre"
          />
          {sugerenciasProducto.length > 0 && (
            <div className="autocomplete-menu">
              {sugerenciasProducto.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => seleccionarProducto(p)}
                >
                  {[p.codigo, p.nombre].filter(Boolean).join(" | ")}
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
          onClick={cargarKardex}
          disabled={cargando}
        >
          <Search /> Buscar
        </button>
      </div>

      <div className="report-summary-row">
        <div className="stat-card">
          <Boxes />
          <span>{reporte?.productoNombre || "Producto no seleccionado"}</span>
        </div>
        <div className="stat-card">
          <strong>{formatoCantidad(reporte?.stockFinal)}</strong>
          <span>Stock final del rango</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th className="text-right">Cantidad</th>
              <th className="text-right">Stock previo</th>
              <th className="text-right">Stock nuevo</th>
              <th>Referencia</th>
              <th>Empleado</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty">
                  Seleccione un producto o cambie el rango de fechas.
                </td>
              </tr>
            ) : (
              movimientos.map((mov) => (
                <tr key={mov.movimientoId}>
                  <td>{formatoFechaHora(mov.fecha)}</td>
                  <td>{mov.tipo}</td>
                  <td className="text-right">
                    {formatoCantidad(mov.cantidad)}
                  </td>
                  <td className="text-right">
                    {formatoCantidad(mov.stockPrevio)}
                  </td>
                  <td className="text-right" style={{ fontWeight: 700 }}>
                    {formatoCantidad(mov.stockNuevo)}
                  </td>
                  <td>
                    {[
                      mov.referenciaTipo,
                      mov.referenciaId && `#${mov.referenciaId}`,
                    ]
                      .filter(Boolean)
                      .join(" ") || "--"}
                  </td>
                  <td>{mov.empleadoNombre || "--"}</td>
                  <td>{mov.motivo || "--"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReporteKardex;
