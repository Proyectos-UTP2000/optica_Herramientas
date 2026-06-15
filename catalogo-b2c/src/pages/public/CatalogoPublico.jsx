import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Toast } from "../../utils/alerts";
import { BagFill, Filter } from "react-bootstrap-icons";

import BannerCarousel from "../../components/BannerCarousel";
import ProductCard from "../../components/ProductCard";
import ProductDetailModal from "../../components/ProductDetailModal";
import FilterSidebar from "../../components/FilterSidebar";
import CartDrawer from "../../components/CartDrawer";

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Detail Modal
  const [detalleProducto, setDetalleProducto] = useState(null);
  const [imagenDetalleActiva, setImagenDetalleActiva] = useState(0);

  // Carrusel active
  const [bannerActivo, setBannerActivo] = useState(0);

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
          Toast.fire({
            icon: "error",
            title: "No se pudo cargar la información de tu perfil",
          });
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

  const productosFiltrados = productos.filter((prod) => {
    const matchBusqueda =
      prod.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.codigo?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat =
      !categoriaSeleccionada || prod.categoriaNombre === categoriaSeleccionada;
    const matchMarca =
      !marcaSeleccionada || prod.marcaNombre === marcaSeleccionada;
    const matchDestacados = !soloDestacados || prod.destacado === true;

    const matchEtiq =
      etiquetasSeleccionadas.length === 0 ||
      etiquetasSeleccionadas.every((etiq) => prod.etiquetas?.includes(etiq));

    return (
      matchBusqueda && matchCat && matchMarca && matchDestacados && matchEtiq
    );
  });

  return (
    <div
      className="container"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Carousel */}
      <BannerCarousel
        banners={carruselBanners}
        bannerActivo={bannerActivo}
        setBannerActivo={setBannerActivo}
      />

      {/* Layout Grid */}
      <div
        className="catalog-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Sidebar Escritorio */}
        <div className="desktop-filters-wrapper">
          <FilterSidebar
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            categoriaSeleccionada={categoriaSeleccionada}
            setCategoriaSeleccionada={setCategoriaSeleccionada}
            categorias={categorias}
            marcaSeleccionada={marcaSeleccionada}
            setMarcaSeleccionada={setMarcaSeleccionada}
            marcas={marcas}
            soloDestacados={soloDestacados}
            setSoloDestacados={setSoloDestacados}
            etiquetas={etiquetas}
            etiquetasSeleccionadas={etiquetasSeleccionadas}
            handleToggleEtiqueta={handleToggleEtiqueta}
            cleanFilters={cleanFilters}
          />
        </div>

        {/* Listado de Productos */}
        <main style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: "var(--color-text-muted)",
                fontWeight: "500",
              }}
            >
              Mostrando {productosFiltrados.length} productos
            </span>

            {/* Botón Filtros Mobile */}
            <button
              className="btn-outline mobile-filter-btn"
              style={{
                display: "none",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontSize: "13px",
              }}
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter size={16} /> Filtrar
            </button>
          </div>

          {cargando ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "var(--color-text-muted)",
              }}
            >
              <span
                className="btn-primary"
                style={{ animation: "pulse 1.5s infinite" }}
              >
                Cargando Catálogo...
              </span>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                color: "var(--color-text-muted)",
                border: "2px dashed var(--color-border)",
                borderRadius: "var(--border-radius-lg)",
                backgroundColor: "#fff",
              }}
            >
              <span style={{ fontSize: "40px" }}>🔍</span>
              <h3
                style={{
                  margin: "16px 0 8px 0",
                  color: "var(--color-text-main)",
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >
                Sin Coincidencias
              </h3>
              <p style={{ margin: 0, fontSize: "14px" }}>
                Intenta cambiar los filtros seleccionados o buscar otro término.
              </p>
            </div>
          ) : (
            <div
              className="product-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                gap: "24px",
              }}
            >
              {productosFiltrados.map((prod) => (
                <ProductCard
                  key={prod.id}
                  prod={prod}
                  onSelect={(p) => {
                    setDetalleProducto(p);
                    setImagenDetalleActiva(0);
                  }}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>
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

      {/* Mobile Filter Sheet */}
      {mobileFiltersOpen && (
        <FilterSidebar
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          categoriaSeleccionada={categoriaSeleccionada}
          setCategoriaSeleccionada={setCategoriaSeleccionada}
          categorias={categorias}
          marcaSeleccionada={marcaSeleccionada}
          setMarcaSeleccionada={setMarcaSeleccionada}
          marcas={marcas}
          soloDestacados={soloDestacados}
          setSoloDestacados={setSoloDestacados}
          etiquetas={etiquetas}
          etiquetasSeleccionadas={etiquetasSeleccionadas}
          handleToggleEtiqueta={handleToggleEtiqueta}
          cleanFilters={cleanFilters}
          isMobileDrawer={true}
          onCloseDrawer={() => setMobileFiltersOpen(false)}
        />
      )}

      {/* Modal Detalle */}
      {detalleProducto && (
        <ProductDetailModal
          producto={detalleProducto}
          imagenDetalleActiva={imagenDetalleActiva}
          setImagenDetalleActiva={setImagenDetalleActiva}
          onClose={() => setDetalleProducto(null)}
          onAddToCart={handleAddToCart}
        />
      )}

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

      {/* Responsive CSS Override injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 768px) {
          .desktop-filters-wrapper {
            display: none !important;
          }
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .carousel-container {
            height: 240px !important;
          }
          .carousel-container h1 {
            font-size: 24px !important;
          }
          .carousel-container p {
            font-size: 13px !important;
          }
        }
        @media (max-width: 480px) {
          .product-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `,
        }}
      />
    </div>
  );
};

export default CatalogoPublico;
