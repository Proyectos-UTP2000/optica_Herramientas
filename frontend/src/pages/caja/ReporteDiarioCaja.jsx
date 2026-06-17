import { useCallback, useEffect, useState } from "react";
import { ArrowRepeat, CashCoin, FileText } from "react-bootstrap-icons";
import api from "../../api/axiosConfig";
import { Toast } from "../../utils/alerts";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const formatoFechaHora = (valor) => {
  if (!valor) return "--";
  return new Date(valor).toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const formatoHora = (valor) => {
  if (!valor) return "--";
  return new Date(valor).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mensajeBackend = (error, fallback) =>
  error.response?.data?.message || fallback;

const ReporteDiarioCaja = () => {
  const empleadoId = localStorage.getItem("empleadoId");
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sinCaja, setSinCaja] = useState(false);

  const cargarReporte = useCallback(async () => {
    setCargando(true);
    setSinCaja(false);
    try {
      if (!empleadoId) {
        setSinCaja(true);
        return;
      }
      const reporteResponse = await api.get(
        `/api/v1/reportes/caja-diaria/actual?empleadoId=${empleadoId}`,
      );
      setReporte(reporteResponse.data);
    } catch (error) {
      setReporte(null);
      if (error.response?.status === 404) {
        setSinCaja(true);
      } else {
        Toast.fire({
          icon: "error",
          title: mensajeBackend(error, "No se pudo cargar el reporte diario"),
        });
      }
    } finally {
      setCargando(false);
    }
  }, [empleadoId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      cargarReporte();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cargarReporte]);

  const totalesPorMedio = Object.entries(reporte?.totalPorMedioPago || {});

  return (
    <div style={{ padding: "10px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            <FileText style={{ marginRight: 10, verticalAlign: "middle" }} />
            Reporte diario de caja
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            Resumen de ventas registradas en la caja abierta del usuario.
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={cargarReporte}
          disabled={cargando}
        >
          <ArrowRepeat className={cargando ? "spin-animation" : ""} />{" "}
          Actualizar
        </button>
      </div>

      {cargando && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 32,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Cargando reporte...
        </div>
      )}

      {!cargando && sinCaja && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 32,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          <CashCoin
            style={{ fontSize: 28, color: "#94a3b8", marginBottom: 8 }}
          />
          <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>
            No hay caja abierta
          </h3>
          <p style={{ margin: 0 }}>
            Abre una caja desde el boton superior para generar el reporte
            diario.
          </p>
        </div>
      )}

      {!cargando && reporte && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
              gap: 14,
              marginBottom: 16,
            }}
          >
            {[
              ["Caja", `#${reporte.cajaId}`],
              ["Apertura", formatoFechaHora(reporte.fechaApertura)],
              ["Monto inicial", formatoMoneda(reporte.montoInicial)],
              ["Total ventas", formatoMoneda(reporte.totalVentas)],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </div>
                <strong style={{ color: "#0f172a", fontSize: 16 }}>
                  {value}
                </strong>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(260px, 0.45fr) minmax(420px, 1fr)",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 18,
              }}
            >
              <h3
                style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}
              >
                Totales por medio
              </h3>
              {totalesPorMedio.length === 0 ? (
                <p style={{ margin: 0, color: "#94a3b8" }}>
                  Sin ventas registradas.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {totalesPorMedio.map(([medio, total]) => (
                    <div
                      key={medio}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "10px 0",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span style={{ color: "#475569", fontWeight: 600 }}>
                        {medio}
                      </span>
                      <strong style={{ color: "#166534" }}>
                        {formatoMoneda(total)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  gap: 12,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
                  Ventas del dia
                </h3>
                <span style={{ color: "#64748b", fontSize: 13 }}>
                  {reporte.cantidadVentas || 0} venta(s)
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table
                  className="table-custom"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid #e2e8f0",
                        color: "#475569",
                      }}
                    >
                      <th style={{ textAlign: "left", padding: 10 }}>Hora</th>
                      <th style={{ textAlign: "left", padding: 10 }}>
                        Cliente
                      </th>
                      <th style={{ textAlign: "left", padding: 10 }}>
                        Comprobante
                      </th>
                      <th style={{ textAlign: "left", padding: 10 }}>Pago</th>
                      <th style={{ textAlign: "right", padding: 10 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reporte.ventas || []).length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            padding: 28,
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          Sin ventas en esta caja.
                        </td>
                      </tr>
                    ) : (
                      reporte.ventas.map((venta) => (
                        <tr
                          key={venta.ventaId}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td style={{ padding: 10 }}>
                            {formatoHora(venta.fecha)}
                          </td>
                          <td style={{ padding: 10, fontWeight: 600 }}>
                            {venta.clienteNombre || "---"}
                          </td>
                          <td style={{ padding: 10 }}>
                            {venta.numeroComprobante || "---"}
                          </td>
                          <td style={{ padding: 10 }}>
                            {venta.medioPago || "---"}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              textAlign: "right",
                              fontWeight: 700,
                            }}
                          >
                            {formatoMoneda(venta.total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteDiarioCaja;
