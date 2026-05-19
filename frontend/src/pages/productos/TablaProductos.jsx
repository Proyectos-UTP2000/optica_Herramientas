import { useState } from "react";
import axios from "axios";
import { PencilSquare, CheckCircle, XCircle } from "react-bootstrap-icons";
import { Toast, confirmarAccion } from "../../utils/alerts";

const TablaProductos = ({ productos, cargando, recargarTabla, onEditarProducto }) => {
  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCambiarEstado = async (id, nombre) => {
    // 🚀 Aquí se usa correctamente porque está importado arriba
    const confirmacion = await confirmarAccion(
      "¿Cambiar estado?",
      `Se modificará la visibilidad del producto: ${nombre}`,
      "Sí, cambiar",
      "warning"
    );

    if (confirmacion.isConfirmed) {
      const token = localStorage.getItem("token");
      try {
        await axios.patch(`/api/v1/productos/${id}/estado`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Toast.fire({ icon: "success", title: "Estado actualizado correctamente" });
        recargarTabla();
      } catch (error) {
        Toast.fire({ icon: "error", title: "No se pudo cambiar el estado" });
      }
    }
  };

  if (cargando) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Cargando catálogo...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          className="input-control"
          placeholder="Buscar por nombre, SKU o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: "360px" }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #edf2f7", textAlign: "left", color: "#475569" }}>
              <th style={{ padding: "12px 8px" }}>Código / SKU</th>
              <th style={{ padding: "12px 8px" }}>Producto</th>
              <th style={{ padding: "12px 8px" }}>Marca / Tipo</th>
              <th style={{ padding: "12px 8px" }}>Logística (Compra → Venta)</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Precio Venta</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Stock</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Estado</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                  No se encontraron productos registrados.
                </td>
              </tr>
            ) : (
              productosFiltrados.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", color: "#334155" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 600, color: "#64748b" }}>
                    {p.codigo || "S/N"}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{p.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.modelo || "Sin modelo"}</div>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div>{p.marca?.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{p.tipoProducto}</div>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                      1 {p.unidadCompra?.nombre || "Caja"} = {p.factorConversion} {p.unidadVenta?.nombre || "Und"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600 }}>
                    S/. {p.precio?.toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 600, color: p.stock <= p.stockMinimo ? "#ef4444" : "#10b981" }}>
                    {p.stock}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <button onClick={() => handleCambiarEstado(p.id, p.nombre)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      {p.estado === 1 ? (
                        <CheckCircle size={18} style={{ color: "#10b981" }} />
                      ) : (
                        <XCircle size={18} style={{ color: "#ef4444" }} />
                      )}
                    </button>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <button 
                      className="btn-icon" 
                      style={{ color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
                      onClick={() => onEditarProducto(p)}
                    >
                      <PencilSquare size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaProductos;