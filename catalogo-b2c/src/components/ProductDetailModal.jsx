import { BagFill, XLg } from "react-bootstrap-icons";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const ProductDetailModal = ({
  producto,
  onClose,
  onAddToCart,
  imagenDetalleActiva,
  setImagenDetalleActiva,
}) => {
  if (!producto) return null;

  return (
    <div
      className="animate-fade"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          width: "min(820px, 100%)",
          backgroundColor: "#fff",
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
            Detalles del Modelo
          </h3>
          <button
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
            }}
            onClick={onClose}
          >
            <XLg size={18} />
          </button>
        </div>

        {/* Grid Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            padding: "24px",
            overflowY: "auto",
          }}
        >
          {/* Gallery Column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                width: "100%",
                height: "250px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--border-radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F8FAFC",
              }}
            >
              {producto.imagenes && producto.imagenes[imagenDetalleActiva] ? (
                <img
                  src={producto.imagenes[imagenDetalleActiva].rutaImagen}
                  alt={producto.nombre}
                  style={{
                    maxWidth: "90%",
                    maxHeight: "90%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span style={{ color: "var(--color-text-muted)" }}>
                  Sin Imagen
                </span>
              )}
            </div>
            {producto.imagenes && producto.imagenes.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "6px",
                }}
              >
                {producto.imagenes.map((img, idx) => (
                  <img
                    key={img.id}
                    src={img.rutaImagen}
                    alt={`Minilook ${idx}`}
                    style={{
                      width: "55px",
                      height: "55px",
                      border:
                        idx === imagenDetalleActiva
                          ? "2px solid var(--color-primary)"
                          : "1px solid var(--color-border)",
                      borderRadius: "var(--border-radius-sm)",
                      objectFit: "contain",
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      transition: "var(--transition-smooth)",
                    }}
                    onClick={() => setImagenDetalleActiva(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div>
              <span
                style={{
                  color: "var(--color-secondary)",
                  fontSize: "12px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {producto.marcaNombre}
              </span>
              <h2
                style={{
                  margin: "4px 0 6px 0",
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "var(--color-text-main)",
                  lineHeight: "1.2",
                }}
              >
                {producto.nombre}
              </h2>
              <span
                style={{ fontSize: "12px", color: "var(--color-text-muted)" }}
              >
                Código de fábrica: {producto.codigo}
              </span>
            </div>

            <div
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "var(--color-primary)",
              }}
            >
              {producto.precio
                ? formatoMoneda(producto.precio)
                : "Consulte Precio"}
            </div>

            {producto.etiquetas && producto.etiquetas.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {producto.etiquetas.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "#EBF8FF",
                      color: "#2B6CB0",
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "4px 10px",
                      borderRadius: "var(--border-radius-full)",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {(producto.descripcionWeb || producto.descripcion) && (
              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "12px",
                }}
              >
                <h5
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Descripción del producto
                </h5>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13.5px",
                    color: "var(--color-text-main)",
                    lineHeight: "1.5",
                    whiteSpace: "pre-line",
                  }}
                >
                  {producto.descripcionWeb || producto.descripcion}
                </p>
              </div>
            )}

            <div style={{ marginTop: "auto", paddingTop: "20px" }}>
              <button
                onClick={() => {
                  onAddToCart(producto);
                  onClose();
                }}
                className="btn-primary"
                style={{ width: "100%", padding: "12px 16px" }}
              >
                <BagFill /> Añadir a mi Cotización
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
