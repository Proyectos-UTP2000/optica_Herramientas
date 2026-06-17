import { useEffect, useState } from "react";
import {
  recibirCompra,
  anularCompra,
  getEmpleadoActual,
} from "../../api/comprasService";
import { mostrarAlerta, confirmarAccion } from "../../utils/alerts";

export default function ModalVerCompra({
  compra,
  onCerrar,
  onActionCompleted,
}) {
  const [empleadoId, setEmpleadoId] = useState(null);

  useEffect(() => {
    getEmpleadoActual()
      .then(setEmpleadoId)
      .catch((err) =>
        console.error("Error al obtener el empleado actual:", err),
      );
  }, []);

  if (!compra) return null;

  const handleRecibir = async (id) => {
    if (!empleadoId) {
      mostrarAlerta(
        "Error",
        "No se ha podido obtener el empleado actual.",
        "error",
      );
      return;
    }
    const confirmacion = await confirmarAccion(
      "¿Recibir Mercadería?",
      `¿Está seguro de marcar la compra #${id} como RECIBIDA? Esto actualizará el stock de los productos.`,
      "Sí, recibir",
      "question",
    );
    if (!confirmacion.isConfirmed) return;

    try {
      await recibirCompra(id, empleadoId);
      mostrarAlerta(
        "Éxito",
        `La compra #${id} ha sido marcada como RECIBIDA.`,
        "success",
      );
      if (onActionCompleted) onActionCompleted();
    } catch (error) {
      mostrarAlerta(
        "Error",
        error.response?.data?.message || "No se pudo recibir la compra.",
        "error",
      );
    }
  };

  const handleAnular = async (id) => {
    if (!empleadoId) {
      mostrarAlerta(
        "Error",
        "No se ha podido obtener el empleado actual.",
        "error",
      );
      return;
    }
    const confirmacion = await confirmarAccion(
      "¿Anular Compra?",
      `¿Está seguro de ANULAR la compra #${id}? Esta acción no se puede deshacer y revertirá los movimientos en stock e inventario si ya fue recibida.`,
      "Sí, anular",
      "warning",
    );
    if (!confirmacion.isConfirmed) return;

    try {
      await anularCompra(id, empleadoId);
      mostrarAlerta("Éxito", `La compra #${id} ha sido ANULADA.`, "success");
      if (onActionCompleted) onActionCompleted();
    } catch (error) {
      mostrarAlerta(
        "Error",
        error.response?.data?.message || "No se pudo anular la compra.",
        "error",
      );
    }
  };

  const detalles = Array.isArray(compra.detalles) ? compra.detalles : [];

  const claseFormaPago = (fp) => {
    const map = { CONTADO: "badge--contado", CREDITO: "badge--credito" };
    return map[(fp ?? "").toUpperCase()] ?? "badge--otro";
  };
  const claseMedioPago = (mp) => {
    const map = {
      EFECTIVO: "badge--efectivo",
      TRANSFERENCIA: "badge--transferencia",
      TARJETA: "badge--tarjeta",
      YAPE: "badge--yape",
      PLIN: "badge--plin",
      OTRO: "badge--otro",
    };
    return map[(mp ?? "").toUpperCase()] ?? "badge--otro";
  };
  const claseEstado = (est) => {
    const map = {
      REGISTRADA: "badge--registrada",
      RECIBIDA: "badge--completada",
      ANULADA: "badge--anulada",
    };
    return map[(est ?? "").toUpperCase()] ?? "badge--otro";
  };

  const subtotal = Number(compra.subtotal ?? 0);
  const descuento = Number(compra.descuento ?? 0);
  const total = Number(compra.total ?? 0);

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div
        className="modal-content"
        style={{ width: "820px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-header-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2 className="modal-header-title">Compra #{compra.id}</h2>
              <p className="modal-header-subtitle">
                {compra.fecha
                  ? new Date(compra.fecha).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
          <div className="modal-header-actions">
            <span className={`badge ${claseEstado(compra.estado)}`}>
              {compra.estado ?? "—"}
            </span>
            <button className="btn-close" onClick={onCerrar}>
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body modal-body--flush">
          {/* ── INFO GENERAL ── */}
          <div className="info-card-grid">
            <InfoCard
              label="Proveedor"
              icon={<PersonIcon />}
              value={compra.proveedorNombre ?? "—"}
            />
            <InfoCard
              label="Empleado"
              icon={<UserIcon />}
              value={compra.empleadoNombre ?? "—"}
            />
            <InfoCard
              label="Comprobante"
              icon={<HashIcon />}
              value={
                <span className="td-code">
                  {compra.compraNumeroCombrobante ??
                    compra.numeroComprobante ??
                    "—"}
                </span>
              }
            />
            <InfoCard
              label="Forma de pago"
              icon={<CardIcon />}
              value={
                <span className={`badge ${claseFormaPago(compra.formaPago)}`}>
                  {compra.formaPago ?? "—"}
                </span>
              }
            />
            <InfoCard
              label="Medio de pago"
              icon={<WalletIcon />}
              value={
                <span className={`badge ${claseMedioPago(compra.medioPago)}`}>
                  {compra.medioPago ?? "—"}
                </span>
              }
            />
            {compra.formaPago === "CREDITO" && (
              <>
                <InfoCard
                  label="Cuotas"
                  icon={<CalIcon />}
                  value={compra.cuotas ?? "—"}
                />
                <InfoCard
                  label="Vencimiento"
                  icon={<CalIcon />}
                  value={compra.fechaVencimiento ?? "—"}
                />
                <InfoCard
                  label="Deuda pendiente"
                  icon={<AlertIcon />}
                  value={
                    <span
                      className="total-row__value--descuento"
                      style={{ color: "#dc2626", fontWeight: 700 }}
                    >
                      S/ {Number(compra.deuda ?? 0).toFixed(2)}
                    </span>
                  }
                />
              </>
            )}
          </div>

          {/* ── NOTA ── */}
          {compra.notaRecepcion && (
            <div className="nota-recepcion">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                <strong>Nota:</strong> {compra.notaRecepcion}
              </span>
            </div>
          )}

          {/* ── TABLA PRODUCTOS ── */}
          <div className="section-label-wrapper">
            <p className="section-label">
              Productos comprados ({detalles.length})
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Código</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Precio Unit.</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      Sin productos en esta compra.
                    </td>
                  </tr>
                ) : (
                  detalles.map((d, i) => (
                    <tr key={i}>
                      <td className="td-num">{i + 1}</td>
                      <td className="td-name">
                        {d.productoNombre ?? `ID: ${d.productoId}`}
                      </td>
                      <td className="td-code">{d.productoCodigo ?? "—"}</td>
                      <td className="text-right">
                        <span className="qty-badge">
                          {d.cantidadCompra ?? d.cantidad}
                        </span>
                      </td>
                      <td className="text-right">
                        S/ {Number(d.costoUnitario ?? d.precio ?? 0).toFixed(2)}
                      </td>
                      <td className="text-right" style={{ fontWeight: 600 }}>
                        S/ {Number(d.subtotal ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── TOTALES ── */}
          <div className="totales-wrapper">
            <div className="totales-box">
              <div className="total-row">
                <span className="total-row__label">Subtotal</span>
                <span className="total-row__value">
                  S/ {subtotal.toFixed(2)}
                </span>
              </div>
              {descuento > 0 && (
                <div className="total-row">
                  <span className="total-row__label">Descuento</span>
                  <span className="total-row__value total-row__value--descuento">
                    - S/ {descuento.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="totales-divider">
                <span className="totales-divider__label">TOTAL</span>
                <span className="totales-divider__value">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="modal-footer">
          {compra.estado === "REGISTRADA" && (
            <button
              className="btn-primary"
              style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              onClick={() => handleRecibir(compra.id)}
            >
              Recibir Mercadería
            </button>
          )}
          {compra.estado !== "ANULADA" && (
            <button
              className="btn-danger"
              onClick={() => handleAnular(compra.id)}
            >
              Anular Compra
            </button>
          )}
          <button className="btn-secondary" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, icon, value }) {
  return (
    <div className="info-card">
      <div className="info-card__label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="info-card__value">{value}</div>
    </div>
  );
}

const PersonIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const UserIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const HashIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);
const CardIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const WalletIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16v4" />
    <path d="M22 12v4H18a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2h4z" />
  </svg>
);
const CalIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const AlertIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
