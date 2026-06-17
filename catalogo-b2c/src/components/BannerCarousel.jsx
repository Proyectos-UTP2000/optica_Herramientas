import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

const BannerCarousel = ({ banners, bannerActivo, setBannerActivo }) => {
  if (!banners || banners.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setBannerActivo((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setBannerActivo((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="carousel-container"
      style={{
        height: "380px",
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
        position: "relative",
        boxShadow: "var(--shadow-medium)",
        marginBottom: "20px",
      }}
    >
      <img
        src={banners[bannerActivo]?.url}
        alt="Banner Promocional"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.5s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(45,55,72,0.85), rgba(45,55,72,0.3))",
          display: "flex",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div
          style={{ maxWidth: "480px", color: "#fff" }}
          className="animate-slide-up"
        >
          <span
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: "800",
              padding: "4px 10px",
              borderRadius: "var(--border-radius-full)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              display: "inline-block",
              marginBottom: "14px",
            }}
          >
            Salud Visual Profesional
          </span>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "800",
              margin: "0 0 12px 0",
              lineHeight: "1.15",
            }}
          >
            Encuentra las mejores monturas y lunas
          </h1>
          <p
            style={{
              fontSize: "16px",
              margin: "0 0 24px 0",
              opacity: 0.9,
              lineHeight: "1.5",
            }}
          >
            Revisa nuestro catálogo en tiempo real, selecciona tus modelos
            favoritos y solicita tu cotización por WhatsApp con un solo clic.
          </p>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: "absolute",
              top: "50%",
              left: "20px",
              transform: "translateY(-50%)",
              border: "none",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(4px)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "var(--transition-smooth)",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "var(--color-primary)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
            }
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            style={{
              position: "absolute",
              top: "50%",
              right: "20px",
              transform: "translateY(-50%)",
              border: "none",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(4px)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "var(--transition-smooth)",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "var(--color-primary)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
            }
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;
