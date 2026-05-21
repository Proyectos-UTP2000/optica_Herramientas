import { ModalShell, SeccionLabel, Divider } from "../../components/ui/ModalShell";
import { Image, InfoCircle } from "react-bootstrap-icons";

const ModalVerProducto = ({ producto, cerrarModal }) => {
  const imagenUrl = producto?.rutasImagenes?.length > 0 ? producto.rutasImagenes[0] : null;

  return (
    <ModalShell
      titulo="Detalle Completo del Producto"
      onClose={cerrarModal}
      footer={
        <button className="btn-secondary" onClick={cerrarModal}>
          Cerrar
        </button>
      }
    >
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* Imagen del Producto */}
        <div style={{
          width: "150px",
          height: "150px",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#f8fafc",
          flexShrink: 0
        }}>
          {imagenUrl ? (
            <img src={imagenUrl} alt={producto.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Image size={40} style={{ color: "#94a3b8" }} />
          )}
        </div>

        {/* Información Básica */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          <span className="badge badge-active" style={{ marginBottom: "6px", display: "inline-block" }}>
            {producto.tipoProducto}
          </span>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
            {producto.nombre}
          </h3>
          <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#64748b" }}>
            <b>SKU:</b> {producto.codigo || "Sin SKU"} | <b>Modelo:</b> {producto.modelo || "Sin Modelo"}
          </p>
          <div style={{ fontSize: "13px", color: "#334155", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
            <b>Descripción:</b> <span style={{ whiteSpace: "pre-line" }}>{producto.descripcion || "Sin descripción disponible."}</span>
          </div>
        </div>
      </div>

      <Divider />

      <SeccionLabel text="Información Comercial e Inventario" />
      <div className="form-grid" style={{ gap: "15px", marginBottom: "15px" }}>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Costo Compra</span>
          <strong style={{ fontSize: "15px", color: "#0f172a" }}>S/. {producto.costo?.toFixed(2)}</strong>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Precio Venta</span>
          <strong style={{ fontSize: "15px", color: "#0f172a" }}>S/. {producto.precio?.toFixed(2)}</strong>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Stock Actual</span>
          <strong style={{
            fontSize: "15px",
            color: producto.stock <= producto.stockMinimo ? "#ef4444" : "#10b981"
          }}>
            {producto.stock} {producto.unidadVentaNombre}
          </strong>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Stock Mínimo</span>
          <strong style={{ fontSize: "15px", color: "#ef4444" }}>{producto.stockMinimo} {producto.unidadVentaNombre}</strong>
        </div>
      </div>

      <div className="form-grid" style={{ gap: "15px", marginBottom: "10px" }}>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Marca Fabricante</span>
          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{producto.marcaNombre || "Sin Marca"}</strong>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Categoría</span>
          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{producto.categoriaNombre || "Sin Categoría"}</strong>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Fecha Vencimiento</span>
          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{producto.fechaVencimiento || "No aplica"}</strong>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Estado del Catálogo</span>
          <span className={`badge ${producto.estado === 1 ? 'badge-active' : 'badge-inactive'}`}>
            {producto.estado === 1 ? "Visible en Web" : "Oculto en Web"}
          </span>
        </div>
      </div>

      <Divider />

      <SeccionLabel text="Logística y Conversión de Almacén" />
      <div className="form-grid" style={{ gap: "15px", marginBottom: "10px" }}>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Unidad de Compra</span>
          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{producto.unidadCompraNombre || "—"}</strong>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Unidad de Venta</span>
          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{producto.unidadVentaNombre || "—"}</strong>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Factor de Conversión</span>
          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{producto.factorConversion || "1"}</strong>
        </div>
      </div>

      {producto.unidadCompraNombre && producto.unidadVentaNombre && (
        <div style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          padding: "10px",
          borderRadius: "8px",
          color: "#1e40af",
          fontSize: "12.5px",
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <InfoCircle style={{ color: "#3b82f6", flexShrink: 0 }} size={16} />
          <span>
            Cada 1 <b>"{producto.unidadCompraNombre}"</b> comprada se registrará automáticamente en stock como <b>{producto.factorConversion} "{producto.unidadVentaNombre}"</b>.
          </span>
        </div>
      )}
    </ModalShell>
  );
};

export default ModalVerProducto;
