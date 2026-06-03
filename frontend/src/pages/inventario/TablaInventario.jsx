import { PlusCircle, DashCircle, Eye } from "react-bootstrap-icons";

const TablaInventario = ({ saldos, cargando, onAjuste, onVerHistorial }) => {

  if (cargando) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", fontSize: "14px" }}>
        Cargando existencias de almacén...
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table-custom" style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
            <th style={{ padding: "12px 8px" }}>ID</th>
            <th style={{ padding: "12px 8px" }}>Producto</th>
            <th style={{ padding: "12px 8px", textAlign: "center" }}>Stock Actual</th>
            <th style={{ padding: "12px 8px", textAlign: "right" }}>Acciones de Ajuste</th>
          </tr>
        </thead>
        <tbody>
          {saldos.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                No hay registros de inventario disponibles.
              </td>
            </tr>
          ) : (
            saldos.map((item) => (
              <tr key={item.productoId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 8px", color: "#64748b" }}>#{item.productoId}</td>
                
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                    {item.productoNombre || `Producto #${item.productoId}`}
                  </div>
                  {item.productoCodigo && (
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      SKU: {item.productoCodigo}
                    </div>
                  )}
                </td>

                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span 
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: 600,
                      fontSize: "12px",
                      backgroundColor: item.stockActual <= 3 ? "#fef2f2" : "#f0fdf4",
                      color: item.stockActual <= 3 ? "#ef4444" : "#22c55e",
                      border: item.stockActual <= 3 ? "1px solid #fca5a5" : "1px solid #bbf7d0"
                    }}
                  >
                    {item.stockActual} uds
                  </span>
                </td>
                
                <td style={{ padding: "12px 8px", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "6px" }}>
                    <button
                      className="btn-secondary"
                      onClick={() => onVerHistorial(item)}
                      style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
                    >
                      <Eye size={14} />
                      Historial
                    </button>
                    
                    <button
                      className="btn-primary"
                      onClick={() => onAjuste(item, "positivo")}
                      style={{ padding: "4px 8px", backgroundColor: "#22c55e", borderColor: "#22c55e" }}
                      title="Ingreso de Stock"
                    >
                      <PlusCircle size={15} />
                    </button>

                    <button
                      className="btn-primary"
                      onClick={() => onAjuste(item, "negativo")}
                      style={{ padding: "4px 8px", backgroundColor: "#ef4444", borderColor: "#ef4444" }}
                      title="Salida de Stock"
                    >
                      <DashCircle size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaInventario;