import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Toast } from "../../utils/alerts";
import { ModalShell, SeccionLabel, Divider } from "../../components/ui/ModalShell";
import { 
  Globe, Lightbulb, Images, InfoCircle, PlusCircle, Trash, 
  ArrowUp, ArrowDown, StarFill, Star, X
} from "react-bootstrap-icons";

// ─── Componente de Galería de Imágenes ───────────────────────────────────────
const GaleriaImagenes = ({ imagenesExistentes, onGaleriaChange }) => {
  // imagenesExistentes: array de { id, rutaImagen, esPrincipal, orden }
  // onGaleriaChange: callback({ existentes: [...], nuevosArchivos: [...], config: [...] })

  // Estado interno de la galería
  const [items, setItems] = useState(() => 
    (imagenesExistentes || [])
      .slice()
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || (a.id ?? 0) - (b.id ?? 0))
      .map((img) => ({
        tipo: "existente",   // "existente" | "nuevo"
        id: img.id,
        preview: img.rutaImagen,
        esPrincipal: img.esPrincipal || false,
        orden: img.orden ?? 0,
        archivo: null,
        fileIndex: null,
      }))
  );
  const [nuevosArchivosQueue, setNuevosArchivosQueue] = useState([]); // archivos File[] en orden de adición
  const fileInputRef = useRef(null);

  // Sincroniza hacia el padre cada vez que cambia la galería
  useEffect(() => {
    // Construir config para el backend
    const config = items.map((item, idx) => ({
      id: item.tipo === "existente" ? item.id : null,
      fileIndex: item.tipo === "nuevo" ? item.fileIndex : null,
      esPrincipal: item.esPrincipal,
      orden: idx,
    }));
    onGaleriaChange({ archivos: nuevosArchivosQueue, config });
  }, [items, nuevosArchivosQueue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAgregarArchivos = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const aceptados = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const validos = files.filter(f => aceptados.includes(f.type));
    if (validos.length !== files.length) {
      Toast.fire({ icon: "warning", title: "Solo se admiten JPG, PNG, WEBP y GIF" });
    }
    if (!validos.length) return;

    // Límite: máx 6 imágenes en total
    if (items.length + validos.length > 6) {
      Toast.fire({ icon: "warning", title: "Máximo 6 imágenes por producto" });
      const cuantos = 6 - items.length;
      if (cuantos <= 0) return;
      validos.splice(cuantos);
    }

    const nuevosItems = validos.map((file, i) => {
      const fIdx = nuevosArchivosQueue.length + i;
      return {
        tipo: "nuevo",
        id: null,
        preview: URL.createObjectURL(file),
        esPrincipal: items.length === 0 && i === 0,
        orden: items.length + i,
        archivo: file,
        fileIndex: fIdx,
      };
    });

    setNuevosArchivosQueue(prev => [...prev, ...validos]);
    setItems(prev => {
      const updated = [...prev, ...nuevosItems];
      // Si no hay principal, marcar el primero
      if (!updated.some(it => it.esPrincipal) && updated.length > 0) {
        updated[0] = { ...updated[0], esPrincipal: true };
      }
      return updated;
    });
    // Reset input para permitir subir el mismo archivo de nuevo
    e.target.value = "";
  };

  const handleEliminar = (idx) => {
    setItems(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      // Si eliminamos la portada, asignar la primera como portada
      if (prev[idx].esPrincipal && updated.length > 0) {
        updated[0] = { ...updated[0], esPrincipal: true };
      }
      return updated;
    });
  };

  const handleSetPortada = (idx) => {
    setItems(prev => prev.map((item, i) => ({ ...item, esPrincipal: i === idx })));
  };

  const handleSubir = (idx) => {
    if (idx === 0) return;
    setItems(prev => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const handleBajar = (idx) => {
    setItems(prev => {
      if (idx >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  return (
    <div>
      {/* Aviso */}
      <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "6px", padding: "10px 12px", marginBottom: "14px", fontSize: "11px", color: "#0369a1" }}>
        <strong>Galería de imágenes:</strong> Máx. 6 imágenes (JPG, PNG, WEBP, GIF). Arrastra el orden con ↑↓. 
        La ★ indica la imagen de portada que se mostrará primero en el catálogo. 
        Las imágenes eliminadas se borrarán de Cloudinary al guardar.
      </div>

      {/* Listado */}
      {items.length === 0 ? (
        <div style={{
          border: "2px dashed #cbd5e1", borderRadius: "10px", padding: "32px",
          textAlign: "center", color: "#94a3b8"
        }}>
          <Images size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
          <div style={{ fontSize: "13px" }}>Sin imágenes. Agrega desde el botón de abajo.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map((item, idx) => (
            <div key={`${item.tipo}-${item.id ?? item.fileIndex}-${idx}`} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px 10px", borderRadius: "8px", border: "1px solid",
              borderColor: item.esPrincipal ? "#3b82f6" : "#e2e8f0",
              background: item.esPrincipal ? "#eff6ff" : "#fafafa",
              transition: "all 0.15s"
            }}>
              {/* Thumbnail */}
              <img
                src={item.preview}
                alt=""
                style={{
                  width: "56px", height: "56px", objectFit: "cover",
                  borderRadius: "6px", border: "1px solid #e2e8f0", flexShrink: 0
                }}
              />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.tipo === "nuevo" ? "Nueva imagen" : `Imagen #${item.id}`}
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
                  Posición {idx + 1}{item.esPrincipal ? " — Portada" : ""}
                </div>
              </div>

              {/* Portada badge */}
              <button
                type="button"
                title={item.esPrincipal ? "Es la portada" : "Establecer como portada"}
                onClick={() => handleSetPortada(idx)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: item.esPrincipal ? "#eab308" : "#cbd5e1",
                  transition: "color 0.2s", padding: "4px"
                }}
              >
                {item.esPrincipal ? <StarFill size={18} /> : <Star size={18} />}
              </button>

              {/* Reordenar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <button
                  type="button"
                  onClick={() => handleSubir(idx)}
                  disabled={idx === 0}
                  title="Subir"
                  style={{ background: "none", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: idx === 0 ? "#e2e8f0" : "#64748b", padding: "2px" }}
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleBajar(idx)}
                  disabled={idx === items.length - 1}
                  title="Bajar"
                  style={{ background: "none", border: "none", cursor: idx === items.length - 1 ? "not-allowed" : "pointer", color: idx === items.length - 1 ? "#e2e8f0" : "#64748b", padding: "2px" }}
                >
                  <ArrowDown size={13} />
                </button>
              </div>

              {/* Eliminar */}
              <button
                type="button"
                onClick={() => handleEliminar(idx)}
                title="Eliminar"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón agregar */}
      {items.length < 6 && (
        <div style={{ marginTop: "12px" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            style={{ display: "none" }}
            onChange={handleAgregarArchivos}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", justifyContent: "center" }}
          >
            <PlusCircle size={14} />
            Agregar imagen{items.length === 0 ? "es" : ""} ({items.length}/6)
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Modal principal ──────────────────────────────────────────────────────────
const ModalEditarWeb = ({ producto, cerrarModal, recargarTabla }) => {
  const [activeTab, setActiveTab] = useState("general"); // "general" | "galeria"

  // General tab state
  const [visibleWeb, setVisibleWeb] = useState(producto?.visibleWeb || false);
  const [destacado, setDestacado] = useState(producto?.destacado || false);
  const [slug, setSlug] = useState(producto?.slug || "");
  const [descripcionWeb, setDescripcionWeb] = useState(producto?.descripcionWeb || "");
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState([]);
  const [selectedEtiquetas, setSelectedEtiquetas] = useState(
    producto?.etiquetas ? producto.etiquetas.map(e => e.id) : []
  );
  const [orden, setOrden] = useState(producto?.orden ?? 0);
  const [guardando, setGuardando] = useState(false);

  // Gallery tab state
  const [galeriaData, setGaleriaData] = useState({ archivos: [], config: null });

  useEffect(() => {
    const cargarEtiquetas = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("/api/v1/etiquetas/activos", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEtiquetasDisponibles(res.data || []);
      } catch (err) {
        console.error("No se pudieron cargar las etiquetas", err);
      }
    };
    cargarEtiquetas();
  }, []);

  const handleToggleTag = (tagId) => {
    setSelectedEtiquetas(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleAutoGenerarSlug = () => {
    if (producto?.nombre) {
      setSlug(slugify(producto.nombre));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setGuardando(true);

    const token = localStorage.getItem("token");

    const productData = {
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
      idEtiquetas: selectedEtiquetas,
      orden: orden ? parseInt(orden) : 0,
      imagenesConfig: galeriaData.config || null,
    };

    const formData = new FormData();
    formData.append("producto", new Blob([JSON.stringify(productData)], { type: "application/json" }));

    // Append new image files
    if (galeriaData.archivos && galeriaData.archivos.length > 0) {
      galeriaData.archivos.forEach((file) => {
        formData.append("imagenes", file);
      });
    }

    try {
      await axios.put(`/api/v1/productos/${producto.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
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
      
      {/* Info Card */}
      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>SKU/Código:</span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b" }}>{producto?.codigo}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Producto:</span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b" }}>{producto?.nombre}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "2px solid #e2e8f0", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "8px 16px", fontSize: "13px", fontWeight: "600",
            color: activeTab === "general" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "general" ? "2px solid #2563eb" : "2px solid transparent",
            marginBottom: "-2px", display: "flex", alignItems: "center", gap: "6px",
            transition: "all 0.15s"
          }}
        >
          <InfoCircle size={14} />
          General & SEO
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("galeria")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "8px 16px", fontSize: "13px", fontWeight: "600",
            color: activeTab === "galeria" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "galeria" ? "2px solid #2563eb" : "2px solid transparent",
            marginBottom: "-2px", display: "flex", alignItems: "center", gap: "6px",
            transition: "all 0.15s"
          }}
        >
          <Images size={14} />
          Galería
          {(producto?.imagenes?.length > 0) && (
            <span style={{
              background: "#3b82f6", color: "#fff", borderRadius: "10px",
              padding: "1px 7px", fontSize: "10px"
            }}>
              {producto.imagenes.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab: General */}
      {activeTab === "general" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <SeccionLabel text="Visibilidad y Destacados" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            
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
              Ej: /public/productos/<strong>{slug || "ejemplo-slug"}</strong>
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
              Seleccionar Etiquetas (B2C)
            </label>
            <div style={{ 
              display: "flex", gap: "8px", flexWrap: "wrap", border: "1px solid #cbd5e1", 
              padding: "10px", borderRadius: "6px", maxHeight: "120px", overflowY: "auto", background: "#f8fafc" 
            }}>
              {etiquetasDisponibles.length === 0 ? (
                <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>Cargando etiquetas...</span>
              ) : (
                etiquetasDisponibles.map((tag) => {
                  const isChecked = selectedEtiquetas.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.id)}
                      style={{
                        padding: "4px 10px", fontSize: "12px", fontWeight: "600",
                        borderRadius: "20px", border: "1px solid",
                        borderColor: isChecked ? "#3b82f6" : "#cbd5e1",
                        background: isChecked ? "#eff6ff" : "#ffffff",
                        color: isChecked ? "#2563eb" : "#475569",
                        cursor: "pointer", transition: "all 0.2s ease",
                        display: "inline-flex", alignItems: "center"
                      }}
                    >
                      {tag.nombre}
                    </button>
                  );
                })
              )}
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

          <div style={{ display: "flex", gap: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px", borderRadius: "6px" }}>
            <Lightbulb size={18} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
            <span style={{ fontSize: "11px", color: "#15803d", lineHeight: "1.4" }}>
              La visibilidad en el catálogo web se gestiona de manera independiente a si el producto tiene o no inventario físico actual (se mostrará como sin stock en caso de estar en cero).
            </span>
          </div>

        </form>
      )}

      {/* Tab: Galería */}
      {activeTab === "galeria" && (
        <GaleriaImagenes
          imagenesExistentes={producto?.imagenes || []}
          onGaleriaChange={setGaleriaData}
        />
      )}

    </ModalShell>
  );
};

export default ModalEditarWeb;
