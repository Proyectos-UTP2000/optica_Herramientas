import { useState } from "react";
import axios from "axios";
import { Toast } from "../../utils/alerts";
import { ModalShell, SeccionLabel, Divider } from "../../components/ui/ModalShell";
import { Globe, Lightbulb } from "react-bootstrap-icons";

const ModalEditarWeb = ({ producto, cerrarModal, recargarTabla }) => {
  const [visibleWeb, setVisibleWeb] = useState(producto?.visibleWeb || false);
  const [destacado, setDestacado] = useState(producto?.destacado || false);
  const [slug, setSlug] = useState(producto?.slug || "");
  const [descripcionWeb, setDescripcionWeb] = useState(producto?.descripcionWeb || "");
  const [etiquetas, setEtiquetas] = useState(producto?.etiquetas || "");
  const [orden, setOrden] = useState(producto?.orden ?? 0);
  const [guardando, setGuardando] = useState(false);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/\s+/g, "-") // replace spaces with -
      .replace(/[^\w\-]+/g, "") // remove all non-word chars
      .replace(/\-\-+/g, "-") // replace multiple - with single -
      .replace(/^-+/, "") // trim - from start
      .replace(/-+$/, ""); // trim - from end
  };

  const handleAutoGenerarSlug = () => {
    if (producto?.nombre) {
      setSlug(slugify(producto.nombre));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const token = localStorage.getItem("token");

    const payload = {
      nombre: producto.nombre,
      codigo: producto.codigo,
      modelo: producto.modelo,
      descripcion: producto.descripcion,
      precio: producto.precio,
      costo: producto.costo,
      stockMinimo: producto.stockMinimo,
      tipoProducto: producto.tipoProducto,
      idCategoria: producto.idCategoria,
      idMarca: producto.idMarca,
      idUnidadVenta: producto.idUnidadVenta,
      idUnidadCompra: producto.idUnidadCompra,
      factorConversion: producto.factorConversion,
      visibleWeb,
      destacado,
      slug: slug.trim(),
      descripcionWeb,
      etiquetas,
      orden: orden ? parseInt(orden) : 0,
    };

    try {
      await axios.put(`/api/v1/productos/${producto.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Toast.fire({ icon: "success", title: "Contenido B2C guardado correctamente" });
      recargarTabla();
      cerrarModal();
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: error.response?.data?.message || "No se pudo actualizar el contenido web",
      });
    } finally {
      setGuardando(false);
    }
  };

  const footer = (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", width: "100%" }}>
      <button className="btn-secondary" onClick={cerrarModal} disabled={guardando}>
        Cancelar
      </button>
      <button className="btn-primary" onClick={handleSubmit} disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar Cambios"}
      </button>
    </div>
  );

  return (
    <ModalShell titulo="Editar Configuración Web (B2C)" onClose={cerrarModal} footer={footer}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Info Card */}
        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>SKU/Código:</span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b" }}>{producto?.codigo}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Producto:</span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b" }}>{producto?.nombre}</span>
          </div>
        </div>

        <SeccionLabel text="Visibilidad y Destacados" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          
          {/* Switch Visible en Web */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fdfdfd", padding: "10px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
            <input
              type="checkbox"
              id="visibleWebCheck"
              checked={visibleWeb}
              onChange={(e) => setVisibleWeb(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="visibleWebCheck" style={{ fontSize: "13px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>
              Visible en Catálogo Web
            </label>
          </div>

          {/* Switch Destacado */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fdfdfd", padding: "10px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
            <input
              type="checkbox"
              id="destacadoCheck"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="destacadoCheck" style={{ fontSize: "13px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>
              Producto Destacado (★)
            </label>
          </div>

        </div>

        <Divider />
        <SeccionLabel text="SEO y Ordenamiento" />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
            Slug URL (SEO friendly)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              className="input-control"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="lentes-de-sol-rayban"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleAutoGenerarSlug}
              style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px" }}
              title="Genera un slug limpio en base al nombre del producto"
            >
              <Globe size={14} />
              Autogenerar
            </button>
          </div>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            Ej: http://localhost:8080/api/v1/public/productos/<strong>{slug || "ejemplo-slug"}</strong>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
              Prioridad / Orden
            </label>
            <input
              type="number"
              className="input-control"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              min="0"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              className="input-control"
              value={etiquetas}
              onChange={(e) => setEtiquetas(e.target.value)}
              placeholder="sol, verano, unisex"
            />
          </div>
        </div>

        <Divider />
        <SeccionLabel text="Contenido B2C Web" />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
            Descripción Especial para la Web
          </label>
          <textarea
            className="input-control"
            value={descripcionWeb}
            onChange={(e) => setDescripcionWeb(e.target.value)}
            placeholder="Introduce una descripción más vendedora o con especificaciones técnicas que se visualizará públicamente..."
            rows={4}
            style={{ resize: "vertical" }}
          />
        </div>

        {/* Tip section */}
        <div style={{ display: "flex", gap: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px", borderRadius: "6px" }}>
          <Lightbulb size={18} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
          <span style={{ fontSize: "11px", color: "#15803d", lineHeight: "1.4" }}>
            La visibilidad en el catálogo web se gestiona de manera independiente a si el producto tiene o no inventario físico actual (se mostrará como sin stock en caso de estar en cero).
          </span>
        </div>

      </form>
    </ModalShell>
  );
};

export default ModalEditarWeb;
