import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Toast } from "../../utils/alerts";
import {
  Search,
  BagFill,
  Trash3Fill,
  Whatsapp,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "react-bootstrap-icons";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const CatalogoPublico = () => {
  const [productos, setProductos] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [carruselBanners, setCarruselBanners] = useState([]);
  const [whatsappTienda, setWhatsappTienda] = useState("+51999999999");

  const [cargando, setCargando] = useState(true);

  // Filter States
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);
  const [soloDestacados, setSoloDestacados] = useState(false);
  const [soloConStock, setSoloConStock] = useState(false);

  // Detail Modal
  const [detalleProducto, setDetalleProducto] = useState(null);
  const [imagenDetalleActiva, setImagenDetalleActiva] = useState(0);

  // Carrusel banner active slide
  const [bannerActivo, setBannerActivo] = useState(0);

  // Cart local state
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem("carrito_cotizacion");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout Form State
  const [tipoDestinatario, setTipoDestinatario] = useState("otro"); // "mi" o "otro"
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteCorreo, setClienteCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [enviandoCotizacion, setEnviandoCotizacion] = useState(false);

  // Session state to track login/logout in catalog
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    localStorage.setItem("carrito_cotizacion", JSON.stringify(carrito));
  }, [carrito]);

  // Check login status
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

  // Set default checkout mode when login status changes
  useEffect(() => {
    if (isLoggedIn) {
      setTipoDestinatario("mi");
    } else {
      setTipoDestinatario("otro");
    }
  }, [isLoggedIn]);

  // Fetch customer profile when "Para mí" is selected
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
          Toast.fire({
            icon: "error",
            title: "No se pudo cargar la información de tu perfil",
          });
        }
      };
      fetchProfile();
    } else if (tipoDestinatario === "otro") {
      // Clear inputs for manual entry (except when user wants to fill it)
      setClienteNombre("");
      setClienteDocumento("");
      setClienteTelefono("");
      setClienteCorreo("");
      setDireccion("");
    }
  }, [tipoDestinatario, isLoggedIn]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, prodRes, etiqRes] = await Promise.all([
          api.get("/api/v1/public/web-config"),
          api.get("/api/v1/public/productos"),
          api.get("/api/v1/public/etiquetas"),
        ]);

        if (configRes.data) {
          setCarruselBanners(configRes.data.carouselImagenes || []);
          if (configRes.data.telefonoContacto) {
            setWhatsappTienda(configRes.data.telefonoContacto);
          }
        }
        setProductos(prodRes.data || []);
        setEtiquetas(etiqRes.data || []);
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
        Toast.fire({
          icon: "error",
          title: "No se pudieron cargar los productos del catálogo",
        });
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  // Automatic transition for Carousel Banner
  useEffect(() => {
    if (carruselBanners.length <= 1) return;
    const interval = setInterval(() => {
      setBannerActivo((prev) =>
        prev === carruselBanners.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [carruselBanners]);

  // Dynamic filter values extracted from products list
  const categorias = [
    ...new Set(productos.map((p) => p.categoriaNombre).filter(Boolean)),
  ];
  const marcas = [
    ...new Set(productos.map((p) => p.marcaNombre).filter(Boolean)),
  ];

  const handleToggleEtiqueta = (etiq) => {
    if (etiquetasSeleccionadas.includes(etiq)) {
      setEtiquetasSeleccionadas(
        etiquetasSeleccionadas.filter((e) => e !== etiq),
      );
    } else {
      setEtiquetasSeleccionadas([...etiquetasSeleccionadas, etiq]);
    }
  };

  const cleanFilters = () => {
    setBusqueda("");
    setCategoriaSeleccionada("");
    setMarcaSeleccionada("");
    setEtiquetasSeleccionadas([]);
    setSoloDestacados(false);
    setSoloConStock(false);
  };

  const handleAddToCart = (producto, cant = 1) => {
    const index = carrito.findIndex((item) => item.id === producto.id);
    const principalImg =
      producto.imagenes?.find((img) => img.esPrincipal)?.rutaImagen ||
      producto.imagenes?.[0]?.rutaImagen ||
      "";

    if (index !== -1) {
      const nuevo = [...carrito];
      nuevo[index].cantidad += cant;
      setCarrito(nuevo);
    } else {
      setCarrito([
        ...carrito,
        {
          id: producto.id,
          nombre: producto.nombre,
          codigo: producto.codigo,
          precio: producto.precio || 0,
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

      // Prefilled WhatsApp message
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

      // Clear Cart and Form
      setCarrito([]);
      setClienteNombre("");
      setClienteDocumento("");
      setClienteTelefono("");
      setClienteCorreo("");
      setDireccion("");
      setObservaciones("");
      setCartOpen(false);

      // Open WhatsApp in new tab
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

  // Filter Logic
  const productosFiltrados = productos.filter((prod) => {
    const matchBusqueda =
      prod.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.codigo?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat =
      !categoriaSeleccionada || prod.categoriaNombre === categoriaSeleccionada;
    const matchMarca =
      !marcaSeleccionada || prod.marcaNombre === marcaSeleccionada;
    const matchDestacados = !soloDestacados || prod.destacado === true;
    const matchStock = !soloConStock || prod.conStock === true;

    const matchEtiq =
      etiquetasSeleccionadas.length === 0 ||
      etiquetasSeleccionadas.every((etiq) => prod.etiquetas?.includes(etiq));

    return (
      matchBusqueda &&
      matchCat &&
      matchMarca &&
      matchDestacados &&
      matchStock &&
      matchEtiq
    );
  });

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "30px",
      fontFamily: "'Segoe UI', sans-serif",
    },

    // Banner Carousel Styles
    carousel: {
      height: "350px",
      borderRadius: "14px",
      overflow: "hidden",
      position: "relative",
      border: "1px solid #e2e8f0",
    },
    carouselSlide: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "opacity 500ms ease-in-out",
    },
    carouselOverlay: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(to right, rgba(15,23,42,0.8), rgba(15,23,42,0.2))",
      display: "flex",
      alignItems: "center",
      padding: "40px",
    },
    carouselTextContainer: { maxWidth: "450px", color: "#fff" },
    carouselTitle: {
      fontSize: "32px",
      fontWeight: "800",
      margin: "0 0 10px 0",
      lineHeight: "1.2",
    },
    carouselDesc: { fontSize: "16px", margin: "0 0 20px 0", opacity: 0.9 },
    carouselBtn: (pos) => ({
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      [pos]: "15px",
      border: "none",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "rgba(15,23,42,0.6)",
      color: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),

    // Catalog Grid and Sidebar
    layout: { display: "grid", gridTemplateColumns: "260px 1fr", gap: "30px" },
    sidebar: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "20px",
      height: "fit-content",
    },
    sidebarTitle: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#0f172a",
      borderBottom: "1px solid #f1f5f9",
      paddingBottom: "8px",
      margin: "0 0 10px 0",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    searchGroup: { position: "relative", marginBottom: "15px" },
    searchInput: {
      width: "100%",
      padding: "10px 12px 10px 36px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "13px",
      outline: "none",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#94a3b8",
    },
    filterLabel: {
      display: "block",
      fontSize: "12px",
      color: "#64748b",
      fontWeight: "700",
      textTransform: "uppercase",
      marginBottom: "6px",
    },
    select: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "13px",
      color: "#475569",
      outline: "none",
      marginBottom: "15px",
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      color: "#475569",
      marginBottom: "8px",
      cursor: "pointer",
    },
    btnClear: {
      padding: "8px 12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      backgroundColor: "#f8fafc",
      color: "#475569",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      width: "100%",
      transition: "all 150ms",
    },

    // Product Showcase
    showcase: { display: "flex", flexDirection: "column", gap: "20px" },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      gap: "20px",
    },
    card: {
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      transition: "all 200ms",
    },
    cardImgContainer: {
      width: "100%",
      height: "180px",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      cursor: "pointer",
    },
    cardImg: { maxWidth: "90%", maxHeight: "90%", objectFit: "contain" },
    cardBadge: (bg, color) => ({
      position: "absolute",
      top: "10px",
      left: "10px",
      backgroundColor: bg,
      color: color,
      fontSize: "10px",
      fontWeight: "700",
      padding: "4px 8px",
      borderRadius: "4px",
      textTransform: "uppercase",
    }),
    cardBody: {
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      flex: 1,
    },
    cardTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 6px 0",
      cursor: "pointer",
    },
    cardMeta: {
      fontSize: "11px",
      color: "#94a3b8",
      display: "flex",
      gap: "8px",
      marginBottom: "10px",
    },
    cardPrice: {
      fontSize: "16px",
      fontWeight: "800",
      color: "#2563eb",
      margin: "0 0 14px 0",
    },
    btnAddToCart: {
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "8px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      width: "100%",
      marginTop: "auto",
    },

    // Floating Cart Button
    floatCart: {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      boxShadow: "0 10px 15px -3px rgba(37,99,235,0.3)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 500,
    },
    floatBadge: {
      position: "absolute",
      top: "-5px",
      right: "-5px",
      backgroundColor: "#ef4444",
      color: "#fff",
      borderRadius: "50%",
      width: "22px",
      height: "22px",
      fontSize: "11px",
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    // Drawer Cart
    drawerOverlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15,23,42,0.45)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "flex-end",
    },
    drawer: {
      width: "min(400px, 100%)",
      backgroundColor: "#fff",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      boxShadow: "-5px 0 25px rgba(0,0,0,0.1)",
    },
    drawerHeader: {
      padding: "18px",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#f8fafc",
    },
    drawerTitle: {
      margin: 0,
      fontSize: "16px",
      fontWeight: "700",
      color: "#0f172a",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    drawerBody: {
      flex: 1,
      padding: "18px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    cartItem: {
      display: "flex",
      gap: "12px",
      borderBottom: "1px solid #f1f5f9",
      paddingBottom: "12px",
    },
    cartItemImg: {
      width: "60px",
      height: "60px",
      objectFit: "contain",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
    },
    qtyControl: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "6px",
    },
    qtyBtn: {
      border: "1px solid #cbd5e1",
      width: "24px",
      height: "24px",
      borderRadius: "4px",
      backgroundColor: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
    },

    // Modal Product Detail
    detailOverlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15,23,42,0.45)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
    },
    detailModal: {
      width: "min(780px, 100%)",
      backgroundColor: "#fff",
      borderRadius: "14px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      maxHeight: "90vh",
    },
    detailGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
      padding: "24px",
      overflowY: "auto",
    },
    detailGallery: { display: "flex", flexDirection: "column", gap: "12px" },
    detailMainImgContainer: {
      width: "100%",
      height: "240px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
    },
    detailThumbGrid: {
      display: "flex",
      gap: "10px",
      overflowX: "auto",
      paddingBottom: "5px",
    },
    detailThumb: (active) => ({
      width: "50px",
      height: "50px",
      border: active ? "2px solid #2563eb" : "1px solid #cbd5e1",
      borderRadius: "6px",
      objectFit: "contain",
      cursor: "pointer",
      backgroundColor: "#fff",
    }),
    detailContent: { display: "flex", flexDirection: "column", gap: "10px" },

    // Toggle Selector Styles
    toggleWrapper: {
      display: "flex",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      overflow: "hidden",
      margin: "10px 0",
    },
    toggleBtn: (active) => ({
      flex: 1,
      padding: "8px 12px",
      fontSize: "12px",
      fontWeight: "700",
      border: "none",
      cursor: "pointer",
      backgroundColor: active ? "#2563eb" : "#f8fafc",
      color: active ? "#ffffff" : "#475569",
      transition: "all 150ms ease",
    }),
    loginPrompt: {
      padding: "10px",
      backgroundColor: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "8px",
      fontSize: "12px",
      color: "#1e3a8a",
      textAlign: "center",
    },
  };

  const handleSelectDestinatario = (mode) => {
    if (mode === "mi" && !isLoggedIn) {
      // Trigger login modal
      window.dispatchEvent(new CustomEvent("open-login-modal"));
      Toast.fire({
        icon: "info",
        title: "Inicia sesión para cotizar a tu nombre.",
      });
      return;
    }
    setTipoDestinatario(mode);
  };

  return (
    <div style={styles.container}>
      {/* 1. Carrusel Banner de Inicio */}
      {carruselBanners.length > 0 && (
        <div style={styles.carousel}>
          <img
            src={carruselBanners[bannerActivo]?.url}
            alt="Banner Comercial"
            style={styles.carouselSlide}
          />
          <div style={styles.carouselOverlay}>
            <div style={styles.carouselTextContainer}>
              <h1 style={styles.carouselTitle}>
                Encuentra las mejores monturas y lunas
              </h1>
              <p style={styles.carouselDesc}>
                Revisa nuestro catálogo, selecciona tus modelos favoritos y
                solicita tu cotización hoy mismo.
              </p>
            </div>
          </div>
          {carruselBanners.length > 1 && (
            <>
              <button
                style={styles.carouselBtn("left")}
                onClick={() =>
                  setBannerActivo((prev) =>
                    prev === 0 ? carruselBanners.length - 1 : prev - 1,
                  )
                }
              >
                <ChevronLeft />
              </button>
              <button
                style={styles.carouselBtn("right")}
                onClick={() =>
                  setBannerActivo((prev) =>
                    prev === carruselBanners.length - 1 ? 0 : prev + 1,
                  )
                }
              >
                <ChevronRight />
              </button>
            </>
          )}
        </div>
      )}

      {/* 2. Cuerpo del Catálogo */}
      <div style={styles.layout}>
        {/* Sidebar de Filtros */}
        <aside style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>
            <Filter /> Filtros
          </h3>

          {/* Búsqueda por texto */}
          <div style={styles.searchGroup}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nombre/código..."
              style={styles.searchInput}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Categoría */}
          <label style={styles.filterLabel}>Categoría</label>
          <select
            style={styles.select}
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Marca */}
          <label style={styles.filterLabel}>Marca</label>
          <select
            style={styles.select}
            value={marcaSeleccionada}
            onChange={(e) => setMarcaSeleccionada(e.target.value)}
          >
            <option value="">Todas</option>
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Filtros booleanos */}
          <label style={styles.filterLabel}>Opciones</label>
          <div style={{ marginBottom: "15px" }}>
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={soloDestacados}
                onChange={(e) => setSoloDestacados(e.target.checked)}
              />
              Destacados
            </label>
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={soloConStock}
                onChange={(e) => setSoloConStock(e.target.checked)}
              />
              Con stock disponible
            </label>
          </div>

          {/* Etiquetas B2C */}
          {etiquetas.length > 0 && (
            <>
              <label style={styles.filterLabel}>Etiquetas</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginBottom: "20px",
                }}
              >
                {etiquetas.map((etiq) => (
                  <label key={etiq.id} style={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={etiquetasSeleccionadas.includes(etiq.nombre)}
                      onChange={() => handleToggleEtiqueta(etiq.nombre)}
                    />
                    {etiq.nombre}
                  </label>
                ))}
              </div>
            </>
          )}

          <button style={styles.btnClear} onClick={cleanFilters}>
            Limpiar Filtros
          </button>
        </aside>

        {/* Listado de Productos */}
        <section style={styles.showcase}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              Mostrando {productosFiltrados.length} productos
            </span>
          </div>

          {cargando ? (
            <div
              style={{ textAlign: "center", padding: "60px", color: "#64748b" }}
            >
              Cargando catálogo...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px",
                color: "#64748b",
                border: "1px dashed #cbd5e1",
                borderRadius: "12px",
                backgroundColor: "#fff",
              }}
            >
              No se encontraron productos coincidentes con los filtros
              aplicados.
            </div>
          ) : (
            <div style={styles.grid}>
              {productosFiltrados.map((prod) => {
                const principalImg =
                  prod.imagenes?.find((img) => img.esPrincipal)?.rutaImagen ||
                  prod.imagenes?.[0]?.rutaImagen ||
                  "";
                return (
                  <div style={styles.card} key={prod.id}>
                    {prod.destacado && (
                      <span style={styles.cardBadge("#dbeafe", "#2563eb")}>
                        Destacado
                      </span>
                    )}
                    {!prod.conStock && (
                      <span style={styles.cardBadge("#f3f4f6", "#6b7280")}>
                        A pedido
                      </span>
                    )}
                    <div
                      style={styles.cardImgContainer}
                      onClick={() => {
                        setDetalleProducto(prod);
                        setImagenDetalleActiva(0);
                      }}
                    >
                      {principalImg ? (
                        <img
                          src={principalImg}
                          alt={prod.nombre}
                          style={styles.cardImg}
                        />
                      ) : (
                        <span style={{ color: "#cbd5e1", fontSize: "12px" }}>
                          Sin Imagen
                        </span>
                      )}
                    </div>
                    <div style={styles.cardBody}>
                      <h4
                        style={styles.cardTitle}
                        onClick={() => {
                          setDetalleProducto(prod);
                          setImagenDetalleActiva(0);
                        }}
                      >
                        {prod.nombre}
                      </h4>
                      <div style={styles.cardMeta}>
                        <span>{prod.marcaNombre}</span>
                        <span>&bull;</span>
                        <span>{prod.categoriaNombre}</span>
                      </div>
                      <div style={{ marginTop: "auto" }}>
                        <div style={styles.cardPrice}>
                          {prod.precio
                            ? formatoMoneda(prod.precio)
                            : "Consulte precio"}
                        </div>
                        <button
                          style={styles.btnAddToCart}
                          onClick={() => handleAddToCart(prod)}
                        >
                          <BagFill /> Agregar a Cotización
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 3. Botón Flotante del Carrito */}
      <button style={styles.floatCart} onClick={() => setCartOpen(true)}>
        <BagFill size={24} />
        {carrito.length > 0 && (
          <span style={styles.floatBadge}>
            {carrito.reduce((acc, i) => acc + i.cantidad, 0)}
          </span>
        )}
      </button>

      {/* 4. Drawer de Carrito y Checkout */}
      {cartOpen && (
        <div
          style={styles.drawerOverlay}
          onMouseDown={() => setCartOpen(false)}
        >
          <div
            style={styles.drawer}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div style={styles.drawerHeader}>
              <h3 style={styles.drawerTitle}>
                <BagFill /> Tu Cotización
              </h3>
              <button
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "20px",
                  color: "#64748b",
                  cursor: "pointer",
                }}
                onClick={() => setCartOpen(false)}
              >
                ×
              </button>
            </div>

            <div style={styles.drawerBody}>
              {carrito.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    padding: "40px 10px",
                  }}
                >
                  No has añadido productos a tu cotización. Revisa el catálogo y
                  añade los que te interesen.
                </div>
              ) : (
                <>
                  {/* List of items */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {carrito.map((item) => (
                      <div style={styles.cartItem} key={item.id}>
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          style={styles.cartItemImg}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "13px",
                              color: "#0f172a",
                            }}
                          >
                            {item.nombre}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Cod: {item.codigo}
                          </div>
                          <div
                            style={{
                              fontWeight: "700",
                              fontSize: "12px",
                              color: "#2563eb",
                              marginTop: "4px",
                            }}
                          >
                            {formatoMoneda(item.precio)}
                          </div>

                          <div style={styles.qtyControl}>
                            <button
                              style={styles.qtyBtn}
                              onClick={() => handleUpdateQty(item.id, -1)}
                            >
                              -
                            </button>
                            <span
                              style={{ fontSize: "13px", fontWeight: "600" }}
                            >
                              {item.cantidad}
                            </span>
                            <button
                              style={styles.qtyBtn}
                              onClick={() => handleUpdateQty(item.id, 1)}
                            >
                              +
                            </button>

                            <button
                              style={{
                                border: "none",
                                background: "none",
                                color: "#ef4444",
                                marginLeft: "auto",
                                cursor: "pointer",
                              }}
                              onClick={() => handleRemoveFromCart(item.id)}
                              title="Eliminar"
                            >
                              <Trash3Fill size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div
                    style={{
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "15px",
                      marginTop: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "700",
                        fontSize: "14px",
                        color: "#0f172a",
                      }}
                    >
                      <span>Total Estimado:</span>
                      <span style={{ color: "#2563eb" }}>
                        {formatoMoneda(
                          carrito.reduce(
                            (acc, i) => acc + i.precio * i.cantidad,
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Formulario de Checkout */}
                  <form
                    onSubmit={handleSendCotizacion}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      marginTop: "15px",
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "15px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 5px 0",
                        fontSize: "13px",
                        color: "#475569",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Datos de Contacto
                    </h4>

                    {/* Selector de Destinatario */}
                    <div style={styles.toggleWrapper}>
                      <button
                        type="button"
                        style={styles.toggleBtn(tipoDestinatario === "mi")}
                        onClick={() => handleSelectDestinatario("mi")}
                      >
                        Para Mí
                      </button>
                      <button
                        type="button"
                        style={styles.toggleBtn(tipoDestinatario === "otro")}
                        onClick={() => handleSelectDestinatario("otro")}
                      >
                        Para Otra Persona
                      </button>
                    </div>

                    {!isLoggedIn && (
                      <div style={styles.loginPrompt}>
                        💡 Registrando tu cuenta obtendrás tu historial y tus
                        datos autocompletados.{" "}
                        <span
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("open-login-modal"),
                            )
                          }
                          style={{
                            textDecoration: "underline",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Iniciar sesión
                        </span>
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Nombre Completo"
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      required
                      disabled={tipoDestinatario === "mi" && isLoggedIn}
                    />
                    <input
                      type="text"
                      placeholder="Documento (DNI o RUC)"
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      value={clienteDocumento}
                      onChange={(e) => setClienteDocumento(e.target.value)}
                      disabled={tipoDestinatario === "mi" && isLoggedIn}
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono / Celular"
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      value={clienteTelefono}
                      onChange={(e) => setClienteTelefono(e.target.value)}
                      required
                      disabled={tipoDestinatario === "mi" && isLoggedIn}
                    />
                    <input
                      type="email"
                      placeholder="Correo Electrónico"
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      value={clienteCorreo}
                      onChange={(e) => setClienteCorreo(e.target.value)}
                      disabled={tipoDestinatario === "mi" && isLoggedIn}
                    />
                    <input
                      type="text"
                      placeholder="Dirección de envío / entrega"
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      required
                      disabled={tipoDestinatario === "mi" && isLoggedIn}
                    />
                    <textarea
                      placeholder="Observaciones adicionales o consulta de receta..."
                      rows="3"
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        resize: "none",
                      }}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />

                    <button
                      type="submit"
                      style={{
                        padding: "10px 16px",
                        backgroundColor: "#25d366",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                      disabled={enviandoCotizacion}
                    >
                      <Whatsapp />{" "}
                      {enviandoCotizacion
                        ? "Registrando..."
                        : "Enviar a WhatsApp"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal de Detalle de Producto */}
      {detalleProducto && (
        <div
          style={styles.detailOverlay}
          onMouseDown={() => setDetalleProducto(null)}
        >
          <div
            style={styles.detailModal}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "#0f172a",
                  fontWeight: "700",
                }}
              >
                Detalle del Producto
              </h3>
              <button
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "20px",
                  color: "#64748b",
                  cursor: "pointer",
                }}
                onClick={() => setDetalleProducto(null)}
              >
                ×
              </button>
            </div>

            <div style={styles.detailGrid}>
              {/* Gallery column */}
              <div style={styles.detailGallery}>
                <div style={styles.detailMainImgContainer}>
                  {detalleProducto.imagenes &&
                  detalleProducto.imagenes[imagenDetalleActiva] ? (
                    <img
                      src={
                        detalleProducto.imagenes[imagenDetalleActiva].rutaImagen
                      }
                      alt={detalleProducto.nombre}
                      style={{
                        maxWidth: "90%",
                        maxHeight: "90%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <span style={{ color: "#cbd5e1" }}>Sin Imagen</span>
                  )}
                </div>
                {detalleProducto.imagenes &&
                  detalleProducto.imagenes.length > 1 && (
                    <div style={styles.detailThumbGrid}>
                      {detalleProducto.imagenes.map((img, idx) => (
                        <img
                          key={img.id}
                          src={img.rutaImagen}
                          alt={`thumb ${idx}`}
                          style={styles.detailThumb(
                            idx === imagenDetalleActiva,
                          )}
                          onClick={() => setImagenDetalleActiva(idx)}
                        />
                      ))}
                    </div>
                  )}
              </div>

              {/* Info column */}
              <div style={styles.detailContent}>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#2563eb",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {detalleProducto.marcaNombre}
                </span>
                <h3
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "20px",
                    color: "#0f172a",
                    fontWeight: "700",
                  }}
                >
                  {detalleProducto.nombre}
                </h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  Código: {detalleProducto.codigo}
                </p>

                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    marginTop: "10px",
                    paddingTop: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#2563eb",
                      marginBottom: "12px",
                    }}
                  >
                    {detalleProducto.precio
                      ? formatoMoneda(detalleProducto.precio)
                      : "Consulte precio"}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "15px",
                  }}
                >
                  {detalleProducto.etiquetas?.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                {(detalleProducto.descripcionWeb ||
                  detalleProducto.descripcion) && (
                  <div>
                    <h5
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: "13px",
                        color: "#475569",
                        fontWeight: "700",
                      }}
                    >
                      Descripción
                    </h5>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#475569",
                        lineHeight: "1.5",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {detalleProducto.descripcionWeb ||
                        detalleProducto.descripcion}
                    </p>
                  </div>
                )}

                <div style={{ marginTop: "auto", paddingTop: "20px" }}>
                  <button
                    style={{ ...styles.btnAddToCart, padding: "10px 16px" }}
                    onClick={() => {
                      handleAddToCart(detalleProducto);
                      setDetalleProducto(null);
                    }}
                  >
                    <BagFill /> Añadir a mi Cotización
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoPublico;
