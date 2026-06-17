import { useEffect, useState } from "react";
import { CashCoin, Clock, FileText, X } from "react-bootstrap-icons";
import api from "../../api/axiosConfig";
import { Toast } from "../../utils/alerts";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const formatoHora = (valor) => {
  if (!valor) return "--";
  return new Date(valor).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mensajeBackend = (error, fallback) => {
  const data = error.response?.data;
  if (data?.validations) {
    return Object.values(data.validations).join(" ");
  }
  return data?.message || fallback;
};

const CajaHeaderModal = ({
  abierto,
  onCerrar,
  cajaActual,
  empleadoId,
  onCajaActualizada,
  onVerReporte,
}) => {
  const [modo, setModo] = useState("resumen");
  const [montoInicial, setMontoInicial] = useState("");
  const [montoReal, setMontoReal] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return undefined;
    const timer = window.setTimeout(() => {
      setModo("resumen");
      setMontoInicial("");
      setMontoReal("");
      setObservaciones("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [abierto, cajaActual?.id]);

  if (!abierto) return null;

  const abrirCaja = async (event) => {
    event.preventDefault();
    if (!empleadoId) {
      Toast.fire({
        icon: "warning",
        title: "No se encontro el empleado de la sesion",
      });
      return;
    }
    if (Number(montoInicial) < 0 || montoInicial === "") {
      Toast.fire({ icon: "warning", title: "Ingrese un monto inicial valido" });
      return;
    }

    setGuardando(true);
    try {
      const response = await api.post("/api/v1/cajas/aperturas", {
        empleadoId: Number(empleadoId),
        montoInicial: Number(montoInicial),
        observaciones: observaciones || null,
      });
      Toast.fire({ icon: "success", title: "Caja abierta" });
      onCajaActualizada(response.data);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: mensajeBackend(error, "No se pudo abrir caja"),
      });
    } finally {
      setGuardando(false);
    }
  };

  const cerrarCaja = async (event) => {
    event.preventDefault();
    if (!cajaActual?.id) return;
    if (Number(montoReal) < 0 || montoReal === "") {
      Toast.fire({ icon: "warning", title: "Ingrese el monto real contado" });
      return;
    }

    setGuardando(true);
    try {
      await api.post(`/api/v1/cajas/${cajaActual.id}/cierres`, {
        montoReal: Number(montoReal),
        observaciones: observaciones || null,
      });
      Toast.fire({ icon: "success", title: "Caja cerrada" });
      onCajaActualizada(null);
      onCerrar();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: mensajeBackend(error, "No se pudo cerrar caja"),
      });
    } finally {
      setGuardando(false);
    }
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    zIndex: 100,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: "64px 22px 16px",
  };

  const modalStyle = {
    width: "min(420px, 100%)",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    boxShadow: "0 24px 70px rgba(15,23,42,0.22)",
    overflow: "hidden",
  };

  const campoStyle = {
    padding: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
  };

  return (
    <div style={overlayStyle} onMouseDown={onCerrar}>
      <div
        style={modalStyle}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CashCoin style={{ color: "#1d4ed8" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
                Caja
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                {cajaActual ? "Caja abierta" : "Apertura de caja"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCerrar}
            title="Cerrar"
          >
            <X />
          </button>
        </div>

        {!cajaActual && (
          <form onSubmit={abrirCaja} style={{ padding: 16 }}>
            <label className="label-control">Monto inicial</label>
            <input
              className="input-control"
              type="number"
              min="0"
              step="0.01"
              value={montoInicial}
              onChange={(event) => setMontoInicial(event.target.value)}
              autoFocus
            />
            <label className="label-control" style={{ marginTop: 10 }}>
              Observaciones
            </label>
            <textarea
              className="input-control"
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              maxLength={500}
              rows={3}
              style={{ resize: "vertical" }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={guardando}
              style={{ width: "100%", marginTop: 14 }}
            >
              {guardando ? "Abriendo..." : "Abrir caja"}
            </button>
          </form>
        )}

        {cajaActual && modo === "resumen" && (
          <div style={{ padding: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div style={campoStyle}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Inicio
                </div>
                <strong
                  style={{
                    color: "#0f172a",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Clock /> {formatoHora(cajaActual.fechaApertura)}
                </strong>
              </div>
              <div style={campoStyle}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Monto inicial
                </div>
                <strong style={{ color: "#0f172a" }}>
                  {formatoMoneda(cajaActual.montoInicial)}
                </strong>
              </div>
              <div style={campoStyle}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Ventas / ingresos
                </div>
                <strong style={{ color: "#166534" }}>
                  {formatoMoneda(cajaActual.totalIngresos)}
                </strong>
              </div>
              <div style={campoStyle}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Esperado
                </div>
                <strong style={{ color: "#0f172a" }}>
                  {formatoMoneda(cajaActual.montoEsperado)}
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onVerReporte}
                style={{ flex: 1 }}
              >
                <FileText /> Reporte diario
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setModo("cierre")}
                style={{ flex: 1, background: "#dc2626" }}
              >
                Cerrar caja
              </button>
            </div>
          </div>
        )}

        {cajaActual && modo === "cierre" && (
          <form onSubmit={cerrarCaja} style={{ padding: 16 }}>
            <label className="label-control">Monto real contado</label>
            <input
              className="input-control"
              type="number"
              min="0"
              step="0.01"
              value={montoReal}
              onChange={(event) => setMontoReal(event.target.value)}
              autoFocus
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
              Esperado:{" "}
              <strong>{formatoMoneda(cajaActual.montoEsperado)}</strong>
            </div>
            <label className="label-control" style={{ marginTop: 10 }}>
              Observaciones
            </label>
            <textarea
              className="input-control"
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              maxLength={500}
              rows={3}
              style={{ resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setModo("resumen")}
                style={{ flex: 1 }}
              >
                Volver
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={guardando}
                style={{ flex: 1, background: "#dc2626" }}
              >
                {guardando ? "Cerrando..." : "Confirmar cierre"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CajaHeaderModal;
