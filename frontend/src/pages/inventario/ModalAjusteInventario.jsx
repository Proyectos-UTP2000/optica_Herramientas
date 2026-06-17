import { useState } from "react";
import axios from "axios";
import { Toast } from "../../utils/alerts";
import { ModalShell, SeccionLabel } from "../../components/ui/ModalShell";

const ModalAjusteInventario = ({
  producto,
  tipoAjuste,
  cerrarModal,
  recargarTabla,
}) => {
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cantidadNumerica = parseFloat(cantidad);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      Toast.fire({
        icon: "warning",
        title: "La cantidad ingresada debe ser un número mayor a 0",
      });
      return;
    }

    if (!motivo.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Por favor, detalle el motivo del ajuste",
      });
      return;
    }

    const token = localStorage.getItem("token");
    const usuarioLogueado = JSON.parse(
      localStorage.getItem("user") || localStorage.getItem("usuario") || "{}",
    );
    const empleadoId = usuarioLogueado.id || usuarioLogueado.empleadoId || 1;

    const subPath =
      tipoAjuste === "positivo" ? "ajustes/positivos" : "ajustes/negativos";

    const dataDTO = {
      empleadoId: empleadoId,
      cantidad: cantidadNumerica,
      motivo: motivo.trim(),
    };

    try {
      setEnviando(true);
      await axios.post(
        `/api/v1/inventario/productos/${producto.productoId}/${subPath}`,
        dataDTO,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Toast.fire({
        icon: "success",
        title: `Ajuste de ${tipoAjuste === "positivo" ? "ingreso" : "salida"} procesado con éxito`,
      });

      recargarTabla();
      cerrarModal();
    } catch (error) {
      console.error("Error al guardar ajuste:", error);
      const mensajeError =
        error.response?.data?.message || "No se pudo registrar el ajuste";
      Toast.fire({ icon: "error", title: mensajeError });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ModalShell
      titulo={
        tipoAjuste === "positivo"
          ? "Registrar Ingreso Manual"
          : "Registrar Salida Manual"
      }
      onClose={cerrarModal}
      footer={
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={cerrarModal}
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={tipoAjuste === "positivo" ? "btn-primary" : "btn-danger"}
            onClick={handleSubmit}
            disabled={enviando}
            style={
              tipoAjuste === "negativo"
                ? {
                    backgroundColor: "var(--danger)",
                    borderColor: "var(--danger)",
                  }
                : {}
            }
          >
            {enviando ? "Procesando..." : "Confirmar Ajuste"}
          </button>
        </>
      }
    >
      <SeccionLabel text="Información del Stock" />
      <div
        style={{
          fontSize: "14px",
          color: "var(--text-main)",
          background: "var(--bg-light)",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "15px",
        }}
      >
        Producto:{" "}
        <strong>
          {producto.productoNombre || `Código #${producto.productoId}`}
        </strong>{" "}
        <br />
        Existencias actuales: <strong>{producto.stockActual} unidades</strong>
      </div>

      <SeccionLabel text="Detalles de la Operación" />
      <div className="form-grid">
        <div>
          <label className="label-control">Cantidad a Modificar *</label>
          <input
            type="number"
            className="input-control"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            min="1"
            step="any"
            required
            placeholder="Ej. 5"
          />
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "11px",
              marginTop: "4px",
              display: "block",
            }}
          >
            No se admiten números negativos ni ceros.
          </span>
        </div>
        <div>
          <label className="label-control">Motivo o Justificación *</label>
          <textarea
            className="input-control"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            rows="2"
            placeholder="Ej. Lote de proveedor, Rotura en taller..."
            style={{ resize: "none", height: "auto" }}
          />
        </div>
      </div>
    </ModalShell>
  );
};

export default ModalAjusteInventario;
