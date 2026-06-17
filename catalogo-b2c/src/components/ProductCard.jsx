import { Link } from "react-router-dom";
import { BagFill } from "react-bootstrap-icons";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const ProductCard = ({ prod, onSelect, onAddToCart }) => {
  const principalImg =
    prod.imagenes?.find((img) => img.esPrincipal)?.rutaImagen ||
    prod.imagenes?.[0]?.rutaImagen ||
    "";

  return (
    <div
      className="product-card"
      style={{
        backgroundColor: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: "var(--shadow-subtle)",
        transition: "var(--transition-smooth)",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "var(--shadow-medium)";
        const img = e.currentTarget.querySelector(".prod-img");
        if (img) img.style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-subtle)";
        const img = e.currentTarget.querySelector(".prod-img");
        if (img) img.style.transform = "scale(1)";
      }}
    >
      {prod.destacado && (
        <span
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: "#FFF2F0",
            color: "var(--color-primary)",
            fontSize: "10px",
            fontWeight: "800",
            padding: "4px 10px",
            borderRadius: "var(--border-radius-full)",
            textTransform: "uppercase",
            zIndex: 2,
            border: "1px solid rgba(255, 111, 97, 0.2)",
          }}
        >
          Destacado
        </span>
      )}
      {!prod.conStock && (
        <span
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: "#E4E9F2",
            color: "var(--color-text-muted)",
            fontSize: "10px",
            fontWeight: "800",
            padding: "4px 10px",
            borderRadius: "var(--border-radius-full)",
            textTransform: "uppercase",
            zIndex: 2,
          }}
        >
          Bajo Pedido
        </span>
      )}

      <Link
        to={`/producto/${prod.slug}`}
        style={{
          width: "100%",
          height: "190px",
          backgroundColor: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        {principalImg ? (
          <img
            src={principalImg}
            alt={prod.nombre}
            className="prod-img"
            style={{
              maxWidth: "85%",
              maxHeight: "85%",
              objectFit: "contain",
              transition: "var(--transition-smooth)",
            }}
          />
        ) : (
          <div
            style={{
              color: "var(--color-text-muted)",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            🕶️
            <br />
            Sin Imagen
          </div>
        )}
      </Link>

      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "var(--color-secondary)",
            fontWeight: "800",
            textTransform: "uppercase",
            marginBottom: "4px",
            display: "block",
          }}
        >
          {prod.marcaNombre || "Nuestra Marca"}
        </span>
        <Link
          to={`/producto/${prod.slug}`}
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
        >
          <h4
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "var(--color-text-main)",
              margin: "0 0 6px 0",
              cursor: "pointer",
              lineHeight: "1.3",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              height: "40px",
            }}
          >
            {prod.nombre}
          </h4>
        </Link>
        <span
          style={{
            fontSize: "11px",
            color: "var(--color-text-muted)",
            marginBottom: "12px",
            display: "block",
          }}
        >
          Código: {prod.codigo}
        </span>
        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "var(--color-primary)",
              marginBottom: "12px",
            }}
          >
            {prod.precio ? formatoMoneda(prod.precio) : "Consulte Precio"}
          </div>
          <button
            onClick={() => onAddToCart(prod)}
            className="btn-primary"
            style={{ width: "100%", padding: "10px 12px", fontSize: "13px" }}
          >
            <BagFill /> Agregar a Cotización
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
