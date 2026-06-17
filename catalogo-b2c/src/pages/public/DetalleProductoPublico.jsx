import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Toast } from "../../utils/alerts";
import { BagFill, ArrowLeft } from "react-bootstrap-icons";
import CartDrawer from "../../components/CartDrawer";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const DetalleProductoPublico = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [whatsappTienda, setWhatsappTienda] = useState("+51999999999");

  // Cart State
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem("carrito_cotizacion");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout Form State
  const [tipoDestinatario, setTipoDestinatario] = useState("otro");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteCorreo, setClienteCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [enviandoCotizacion, setEnviandoCotizacion] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    localStorage.setItem("carrito_cotizacion", JSON.stringify(carrito));
  }, [carrito]);

  const checkLogin = () => {
    const token = localStorage.getItem("token_cliente");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkLogin();
    window.addEventListener("cliente-session-changed", checkLogin);
    return () => {
      window.removeEventListener("cliente-session-changed", checkLogin);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setTipoDestinatario("mi");
    } else {
      setTipoDestinatario("otro");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (tipoDestinatario === "mi" && isLoggedIn) {
      const fetchProfile = async () => {
        try {
          const res = await api.get("/api/v1/cliente-portal/perfil");
          const p = res.data;
          setClienteNombre(
            `${p.nombre} ${p.apellidoPaterno || ""} ${p.apellidoMaterno || ""}`.trim(),
          );
          setClienteDocumento(p.numeroDocumento || "");
          setClienteTelefono(p.telefono || "");
          setClienteCorreo(p.correo || "");
          setDireccion(p.direccion || "");
        } catch (error) {
          console.error("Error al cargar perfil para autofill:", error);
        }
      };
      fetchProfile();
    } else if (tipoDestinatario === "otro") {
      setClienteNombre("");
      setClienteDocumento("");
      setClienteTelefono("");
      setClienteCorreo("");
      setDireccion("");
    }
  }, [tipoDestinatario, isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      setCargando(true);
      try {
        const [configRes, prodRes] = await Promise.all([
          api.get("/api/v1/public/web-config"),
          api.get(`/api/v1/public/productos/${slug}`),
        ]);

        if (configRes.data) {
          if (configRes.data.telefonoContacto) {
            setWhatsappTienda(configRes.data.telefonoContacto);
          }
        }
        setProducto(prodRes.data);
        setImagenActiva(0);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        Toast.fire({
          icon: "error",
          title: "No se pudo obtener el detalle del producto",
        });
        navigate("/");
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, [slug, navigate]);

  const handleAddToCart = (prod, cant = 1) => {
    const index = carrito.findIndex((item) => item.id === prod.id);
    const principalImg =
      prod.imagenes?.find((img) => img.esPrincipal)?.rutaImagen ||
      prod.imagenes?.[0]?.rutaImagen ||
      "";

    if (index !== -1) {
      const nuevo = [...carrito];
      nuevo[index].cantidad += cant;
      setCarrito(nuevo);
    } else {
      setCarrito([
        ...carrito,
        {
          id: prod.id,
          nombre: prod.nombre,
          codigo: prod.codigo,
          precio: prod.precio || 0,
          cantidad: cant,
          imagen: principalImg,
        },
      ]);
    }
    Toast.fire({
      icon: "success",
      title: "Agregado a tu solicitud de cotización",
    });
  };

  const handleRemoveFromCart = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const handleUpdateQty = (id, change) => {
    setCarrito(
      carrito.map((item) => {
        if (item.id === id) {
          const nueva = item.cantidad + change;
          return { ...item, cantidad: nueva > 0 ? nueva : 1 };
        }
        return item;
      }),
    );
  };

  const cleanPhone = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) {
      if (cleaned.length === 9) {
        cleaned = "51" + cleaned;
      }
    } else {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  const handleSendCotizacion = async (e) => {
    e.preventDefault();
    if (carrito.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "Tu carrito de cotizaciones está vacío",
      });
      return;
    }

    setEnviandoCotizacion(true);
    try {
      const payload = {
        clienteNombre,
        clienteDocumento,
        clienteTelefono,
        clienteCorreo,
        direccion,
        observaciones,
        detalles: carrito.map((item) => ({
          productoId: item.id,
          cantidad: item.cantidad,
        })),
      };

      const res = await api.post("/api/v1/public/cotizaciones", payload);
      const cotiGuardada = res.data;

      const itemsStr = carrito
        .map(
          (item) =>
            `- *${item.cantidad}x* ${item.nombre} (Cod: ${item.codigo})`,
        )
        .join("%0A");
      const texto = `Hola, acabo de registrar una solicitud de cotización web N° *${cotiGuardada.id}* en su tienda.%0A%0AMis datos:%0A- Nombre: ${clienteNombre}%0A- Doc: ${clienteDocumento || "---"}%0A- Teléfono: ${clienteTelefono}%0A- Dirección: ${direccion || "---"}%0A%0AProductos a Cotizar:%0A${itemsStr}%0A%0APor favor, agradecería que me brinden información para concretar el pedido.`;

      const telefonoWsp = cleanPhone(whatsappTienda);
      const wspUrl = `https://api.whatsapp.com/send?phone=${telefonoWsp}&text=${texto}`;

      Toast.fire({ icon: "success", title: "¡Cotización enviada con éxito!" });

      setCarrito([]);
      setClienteNombre("");
      setClienteDocumento("");
      setClienteTelefono("");
      setClienteCorreo("");
      setDireccion("");
      setObservaciones("");
      setCartOpen(false);

      window.open(wspUrl, "_blank");
    } catch (error) {
      console.error("Error al registrar cotización:", error);
      Toast.fire({
        icon: "error",
        title: "No se pudo registrar la cotización",
      });
    } finally {
      setEnviandoCotizacion(false);
    }
  };

  if (cargando) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px",
          color: "var(--color-text-muted)",
        }}
      >
        <h3>Cargando detalles del producto...</h3>
      </div>
    );
  }

  if (!producto) return null;

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "0 16px",
      }}
    >
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--color-primary)",
          textDecoration: "none",
          fontWeight: "600",
          fontSize: "14px",
          marginBottom: "24px",
        }}
      >
        <ArrowLeft size={16} /> Volver al Catálogo
      </Link>

      <div
        className="product-detail-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "40px",
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "var(--border-radius-lg)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Gallery Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              width: "100%",
              height: "350px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--border-radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F8FAFC",
            }}
          >
            {producto.imagenes && producto.imagenes[imagenActiva] ? (
              <img
                src={producto.imagenes[imagenActiva].rutaImagen}
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
                    width: "70px",
                    height: "70px",
                    border:
                      idx === imagenActiva
                        ? "2px solid var(--color-primary)"
                        : "1px solid var(--color-border)",
                    borderRadius: "var(--border-radius-sm)",
                    objectFit: "contain",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    transition: "var(--transition-smooth)",
                  }}
                  onClick={() => setImagenActiva(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <span
              style={{
                color: "var(--color-secondary)",
                fontSize: "13px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {producto.marcaNombre}
            </span>
            <h1
              style={{
                margin: "4px 0 8px 0",
                fontSize: "28px",
                fontWeight: "800",
                color: "var(--color-text-main)",
                lineHeight: "1.2",
              }}
            >
              {producto.nombre}
            </h1>
            <span
              style={{ fontSize: "13px", color: "var(--color-text-muted)" }}
            >
              Código de fábrica: {producto.codigo} | Categoría:{" "}
              {producto.categoriaNombre}
            </span>
          </div>

          <div
            style={{
              fontSize: "32px",
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
                paddingTop: "16px",
              }}
            >
              <h5
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "var(--color-text-muted)",
                }}
              >
                Descripción del producto
              </h5>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--color-text-main)",
                  lineHeight: "1.6",
                  whiteSpace: "pre-line",
                }}
              >
                {producto.descripcionWeb || producto.descripcion}
              </p>
            </div>
          )}

          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <button
              onClick={() => handleAddToCart(producto)}
              className="btn-primary"
              style={{ width: "100%", padding: "14px 20px", fontSize: "16px" }}
            >
              <BagFill /> Añadir a mi Cotización
            </button>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <button
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "var(--color-primary)",
          color: "#fff",
          border: "none",
          boxShadow: "var(--shadow-glow)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
          animation: carrito.length > 0 ? "pulse 2s infinite" : "none",
          transition: "var(--transition-smooth)",
        }}
        onClick={() => setCartOpen(true)}
      >
        <BagFill size={26} />
        {carrito.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              backgroundColor: "var(--color-secondary)",
              color: "#fff",
              borderRadius: "50%",
              width: "22px",
              height: "22px",
              fontSize: "11px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            {carrito.reduce((acc, i) => acc + i.cantidad, 0)}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        carrito={carrito}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveFromCart}
        isLoggedIn={isLoggedIn}
        enviandoCotizacion={enviandoCotizacion}
        tipoDestinatario={tipoDestinatario}
        setTipoDestinatario={setTipoDestinatario}
        clienteNombre={clienteNombre}
        setClienteNombre={setClienteNombre}
        clienteDocumento={clienteDocumento}
        setClienteDocumento={setClienteDocumento}
        clienteTelefono={clienteTelefono}
        setClienteTelefono={setClienteTelefono}
        clienteCorreo={clienteCorreo}
        setClienteCorreo={setClienteCorreo}
        direccion={direccion}
        setDireccion={setDireccion}
        observaciones={observaciones}
        setObservaciones={setObservaciones}
        onSubmitCotizacion={handleSendCotizacion}
      />
    </div>
  );
};

export default DetalleProductoPublico;
