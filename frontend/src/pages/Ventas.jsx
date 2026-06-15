import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ArrowRepeat,
  CashCoin,
  PlusCircle,
  Receipt,
  Search,
  Trash3,
} from "react-bootstrap-icons";
import api from "../api/axiosConfig";
import { Toast } from "../utils/alerts";
import { getRecetasPorCliente, registrarReceta } from "../api/clinicaService";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const mensajeBackend = (error, fallback) => {
  const data = error.response?.data;
  if (data?.validations) {
    return Object.values(data.validations).join(" ");
  }
  return data?.message || fallback;
};

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarResultadosCliente, setMostrarResultadosCliente] =
    useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mostrarResultadosProducto, setMostrarResultadosProducto] =
    useState(false);
  const [modalClienteRapido, setModalClienteRapido] = useState(false);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [detalleDescuento, setDetalleDescuento] = useState("0");
  const { cajaActual, abrirModalCaja } = useOutletContext();
  const [detalles, setDetalles] = useState([]);
  const [clienteRapido, setClienteRapido] = useState({
    dni: "",
    telefono: "",
    correo: "",
  });
  const [formulario, setFormulario] = useState({
    clienteId: "",
    medioPago: "EFECTIVO",
    descuento: "0",
    observaciones: "",
  });

  const [cotizacionIdBusqueda, setCotizacionIdBusqueda] = useState("");
  const [cotizacionImportada, setCotizacionImportada] = useState(null);

  const [recetasCliente, setRecetasCliente] = useState([]);
  const [recetaSeleccionadaId, setRecetaSeleccionadaId] = useState("");
  const [modalRecetaRapida, setModalRecetaRapida] = useState(false);
  const [recetaRapida, setRecetaRapida] = useState({
    odEsfera: "",
    odCilindro: "",
    odEje: "",
    odAvLejos: "",
    odAvCerca: "",
    oiEsfera: "",
    oiCilindro: "",
    oiEje: "",
    oiAvLejos: "",
    oiAvCerca: "",
    distanciaPupilar: "",
    adicion: "",
    tipoLuna: "Monofocal",
    materialSugerido: "Policarbonato",
    tratamientos: {
      "Antireflex Básico": false,
      "Filtro Azul (Blue Defense)": false,
      "Fotocromático (Transition)": false,
      "Filtro UV 400": false,
      "Super Hidrofóbico": false,
      "Antirrayas (Hard Coat)": false,
    },
    observaciones: "",
  });

  const handleTratamientoRapidoChange = (key) => {
    setRecetaRapida((prev) => ({
      ...prev,
      tratamientos: {
        ...prev.tratamientos,
        [key]: !prev.tratamientos[key],
      },
    }));
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [ventasRes, clientesRes, productosRes] = await Promise.all([
        api.get("/api/v1/ventas"),
        api.get("/api/v1/clientes"),
        api.get("/api/v1/productos"),
      ]);
      setVentas(ventasRes.data || []);
      setClientes(
        (clientesRes.data || []).filter((cliente) => cliente.estado === 1),
      );
      setProductos(
        (productosRes.data || []).filter((producto) => producto.estado === 1),
      );
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      Toast.fire({
        icon: "error",
        title: mensajeBackend(error, "No se pudo cargar el módulo de ventas"),
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      cargarDatos();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (formulario.clienteId) {
      getRecetasPorCliente(formulario.clienteId)
        .then((data) => {
          setRecetasCliente(data || []);
          if (data && data.length > 0) {
            setRecetaSeleccionadaId(String(data[0].id));
          } else {
            setRecetaSeleccionadaId("");
          }
        })
        .catch((err) => {
          console.error("Error al obtener recetas del cliente:", err);
          setRecetasCliente([]);
          setRecetaSeleccionadaId("");
        });
    } else {
      setRecetasCliente([]);
      setRecetaSeleccionadaId("");
    }
  }, [formulario.clienteId]);

  const handleCrearRecetaRapida = async (e) => {
    e.preventDefault();
    if (!formulario.clienteId) {
      Toast.fire({
        icon: "warning",
        title: "Debe seleccionar un cliente primero",
      });
      return;
    }

    const currentEmpleadoId = localStorage.getItem("empleadoId");
    if (!currentEmpleadoId) {
      Toast.fire({
        icon: "warning",
        title: "No se pudo identificar al empleado actual",
      });
      return;
    }

    const tratamientosSeleccionados = Object.keys(
      recetaRapida.tratamientos,
    ).filter((key) => recetaRapida.tratamientos[key]);

    const dto = {
      clienteId: Number(formulario.clienteId),
      empleadoId: Number(currentEmpleadoId),
      odEsfera: recetaRapida.odEsfera ? Number(recetaRapida.odEsfera) : null,
      odCilindro: recetaRapida.odCilindro
        ? Number(recetaRapida.odCilindro)
        : null,
      odEje: recetaRapida.odEje ? Number(recetaRapida.odEje) : null,
      odAvLejos: recetaRapida.odAvLejos || null,
      odAvCerca: recetaRapida.odAvCerca || null,
      oiEsfera: recetaRapida.oiEsfera ? Number(recetaRapida.oiEsfera) : null,
      oiCilindro: recetaRapida.oiCilindro
        ? Number(recetaRapida.oiCilindro)
        : null,
      oiEje: recetaRapida.oiEje ? Number(recetaRapida.oiEje) : null,
      oiAvLejos: recetaRapida.oiAvLejos || null,
      oiAvCerca: recetaRapida.oiAvCerca || null,
      distanciaPupilar: recetaRapida.distanciaPupilar
        ? Number(recetaRapida.distanciaPupilar)
        : null,
      adicion: recetaRapida.adicion ? Number(recetaRapida.adicion) : null,
      tipoLuna: recetaRapida.tipoLuna,
      materialSugerido: recetaRapida.materialSugerido,
      tratamientos: tratamientosSeleccionados,
      observaciones: recetaRapida.observaciones || null,
    };

    try {
      const response = await registrarReceta(dto);
      Toast.fire({
        icon: "success",
        title: "Receta registrada y seleccionada",
      });

      const data = await getRecetasPorCliente(formulario.clienteId);
      setRecetasCliente(data || []);
      if (response && response.id) {
        setRecetaSeleccionadaId(String(response.id));
      } else if (data && data.length > 0) {
        setRecetaSeleccionadaId(String(data[0].id));
      }

      setRecetaRapida({
        odEsfera: "",
        odCilindro: "",
        odEje: "",
        odAvLejos: "",
        odAvCerca: "",
        oiEsfera: "",
        oiCilindro: "",
        oiEje: "",
        oiAvLejos: "",
        oiAvCerca: "",
        distanciaPupilar: "",
        adicion: "",
        tipoLuna: "Monofocal",
        materialSugerido: "Policarbonato",
        tratamientos: {
          "Antireflex Básico": false,
          "Filtro Azul (Blue Defense)": false,
          "Fotocromático (Transition)": false,
          "Filtro UV 400": false,
          "Super Hidrofóbico": false,
          "Antirrayas (Hard Coat)": false,
        },
        observaciones: "",
      });
      setModalRecetaRapida(false);
    } catch (err) {
      console.error("Error al registrar receta rápida:", err);
      Toast.fire({
        icon: "error",
        title:
          err.response?.data?.message ||
          "No se pudo registrar la receta rápida",
      });
    }
  };

  const agregarDetalle = () => {
    const producto = productos.find(
      (item) => String(item.id) === String(productoId),
    );
    const cantidadNumero = Number(cantidad);
    const precioNumero = Number(precioUnitario);
    const descuentoNumero = Number(detalleDescuento || 0);

    if (!producto) {
      Toast.fire({ icon: "warning", title: "Seleccione un producto" });
      return;
    }
    if (detalles.some((detalle) => detalle.productoId === producto.id)) {
      Toast.fire({ icon: "warning", title: "El producto ya está agregado" });
      return;
    }
    if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      Toast.fire({
        icon: "warning",
        title: "La cantidad debe ser un número entero mayor a 0",
      });
      return;
    }
    if (precioNumero <= 0 || descuentoNumero < 0) {
      Toast.fire({ icon: "warning", title: "Revise precio y descuento" });
      return;
    }
    if (Number(producto.stock || 0) <= 0) {
      Toast.fire({
        icon: "warning",
        title: "El producto está sin stock y no se puede vender",
      });
      return;
    }
    if (cantidadNumero > Number(producto.stock || 0)) {
      Toast.fire({
        icon: "warning",
        title: "La cantidad supera el stock disponible",
      });
      return;
    }

    setDetalles((prev) => [
      ...prev,
      {
        productoId: producto.id,
        productoNombre: producto.nombre,
        productoCodigo: producto.codigo,
        cantidad: cantidadNumero,
        precioUnitario: precioNumero,
        descuento: descuentoNumero,
        stockDisponible: producto.stock || 0,
      },
    ]);
    setProductoId("");
    setBusquedaProducto("");
    setCantidad("1");
    setPrecioUnitario("");
    setDetalleDescuento("0");
  };

  const quitarDetalle = (id) => {
    setDetalles((prev) => prev.filter((detalle) => detalle.productoId !== id));
  };

  const nombreCliente = (cliente) =>
    cliente?.nombreCompleto ||
    cliente?.nombreEmpresa ||
    cliente?.numeroDocumento ||
    "Cliente sin nombre";

  const seleccionarCliente = (cliente) => {
    setFormulario((prev) => ({ ...prev, clienteId: String(cliente.id) }));
    setBusquedaCliente(nombreCliente(cliente));
    setMostrarResultadosCliente(false);
  };

  const textoProducto = (producto) =>
    [producto?.nombre, producto?.codigo].filter(Boolean).join(" | ") ||
    `Producto #${producto?.id}`;

  const seleccionarProducto = (producto) => {
    setProductoId(String(producto.id));
    setBusquedaProducto(textoProducto(producto));
    setPrecioUnitario(String(producto.precio || "0"));
    setMostrarResultadosProducto(false);
  };

  const crearClienteRapido = async (event) => {
    event.preventDefault();
    const dni = clienteRapido.dni.trim();
    if (!/^\d{8}$/.test(dni)) {
      Toast.fire({
        icon: "warning",
        title: "Ingrese un DNI valido de 8 digitos",
      });
      return;
    }

    setGuardandoCliente(true);
    try {
      const response = await api.post("/api/v1/clientes", {
        numeroDocumento: dni,
        idTipoDocumento: 1,
        telefono: clienteRapido.telefono.trim() || null,
        correo: clienteRapido.correo.trim() || null,
      });
      const nuevoCliente = response.data;
      setClientes((prev) => {
        const sinDuplicado = prev.filter(
          (cliente) => cliente.id !== nuevoCliente.id,
        );
        return [...sinDuplicado, nuevoCliente].filter(
          (cliente) => cliente.estado === 1,
        );
      });
      seleccionarCliente(nuevoCliente);
      setClienteRapido({ dni: "", telefono: "", correo: "" });
      setModalClienteRapido(false);
      Toast.fire({ icon: "success", title: "Cliente registrado" });
    } catch (error) {
      console.error("Error al crear cliente rapido:", error);
      Toast.fire({
        icon: "error",
        title: mensajeBackend(error, "No se pudo registrar el cliente"),
      });
    } finally {
      setGuardandoCliente(false);
    }
  };

  const handleImportarCotizacion = async () => {
    const quoteId = cotizacionIdBusqueda.trim();
    if (!quoteId) {
      Toast.fire({ icon: "warning", title: "Ingrese un ID de cotización" });
      return;
    }

    try {
      const res = await api.get(`/api/v1/cotizaciones/${quoteId}`);
      const coti = res.data;
      if (!coti) {
        Toast.fire({ icon: "error", title: "Cotización no encontrada" });
        return;
      }

      if (coti.estado && coti.estado.toUpperCase() === "PROCESADO") {
        Toast.fire({ icon: "warning", title: "Esta cotización ya fue procesada" });
        return;
      }

      if (coti.estado && coti.estado.toUpperCase() === "ANULADO") {
        Toast.fire({ icon: "warning", title: "Esta cotización está anulada" });
        return;
      }

      // 1. Buscar al cliente en la lista local. Si no está, intentamos recargar clientes
      let clienteEncontrado = clientes.find(c => c.numeroDocumento === coti.clienteDocumento);
      if (!clienteEncontrado && coti.clienteDocumento) {
        const clientesRes = await api.get("/api/v1/clientes");
        const listClientes = (clientesRes.data || []).filter(c => c.estado === 1);
        setClientes(listClientes);
        clienteEncontrado = listClientes.find(c => c.numeroDocumento === coti.clienteDocumento);
      }

      if (clienteEncontrado) {
        seleccionarCliente(clienteEncontrado);
      } else {
        Toast.fire({
          icon: "info",
          title: `Cotización cargada, pero el cliente (Doc: ${coti.clienteDocumento || "Sin Doc"}) no está registrado en la base de datos principal.`,
        });
      }

      // 2. Cargar los detalles de la cotización al carrito (carrito de ventas)
      const nuevosDetalles = [];
      const advertenciasStock = [];

      for (const det of coti.detalles) {
        const prod = productos.find(p => p.id === det.productoId);
        if (!prod) {
          advertenciasStock.push(`Producto #${det.productoId} (${det.productoNombre}) no existe en el catálogo.`);
          continue;
        }

        const stockDisponible = Number(prod.stock || 0);
        if (stockDisponible <= 0) {
          advertenciasStock.push(`Producto "${prod.nombre}" no cuenta con stock disponible.`);
          continue;
        }

        const cantidadAAgregar = Math.min(det.cantidad, stockDisponible);
        if (cantidadAAgregar < det.cantidad) {
          advertenciasStock.push(`Producto "${prod.nombre}" solo tiene ${stockDisponible} unidades disponibles.`);
        }

        nuevosDetalles.push({
          productoId: prod.id,
          productoNombre: prod.nombre,
          productoCodigo: prod.codigo,
          cantidad: cantidadAAgregar,
          precioUnitario: Number(prod.precio || 0),
          descuento: 0,
          stockDisponible: stockDisponible,
        });
      }

      if (nuevosDetalles.length > 0) {
        setDetalles(nuevosDetalles);
        setCotizacionImportada(coti);

        if (advertenciasStock.length > 0) {
          Toast.fire({
            icon: "warning",
            title: `Cotización importada parcialmente. Advertencias:\n${advertenciasStock.join("\n")}`,
          });
        } else {
          Toast.fire({
            icon: "success",
            title: `Cotización #${coti.id} importada correctamente.`,
          });
        }
      } else {
        Toast.fire({
          icon: "error",
          title: "No se pudo agregar ningún producto al carrito (sin stock o descontinuados).",
        });
      }

    } catch (err) {
      console.error("Error al importar cotización:", err);
      Toast.fire({
        icon: "error",
        title: "Error al consultar la cotización por ID",
      });
    }
  };

  const subtotal = useMemo(
    () =>
      detalles.reduce(
        (acum, detalle) =>
          acum + detalle.cantidad * detalle.precioUnitario - detalle.descuento,
        0,
      ),
    [detalles],
  );
  const descuentoGlobal = Number(formulario.descuento || 0);
  const total = Math.max(0, subtotal - descuentoGlobal);

  const enviarVenta = async (event) => {
    event.preventDefault();
    const currentEmpleadoId = localStorage.getItem("empleadoId");
    const currentCajaId = cajaActual?.id;

    if (!formulario.clienteId || !currentEmpleadoId || !currentCajaId) {
      Toast.fire({
        icon: "warning",
        title: "Cliente, empleado y caja son obligatorios",
      });
      return;
    }
    if (detalles.length === 0) {
      Toast.fire({ icon: "warning", title: "Agregue al menos un producto" });
      return;
    }

    if (requiereProcesamiento && !recetaSeleccionadaId) {
      Toast.fire({
        icon: "warning",
        title:
          "Debe seleccionar una receta clínica para productos que requieren procesamiento de laboratorio.",
      });
      return;
    }

    setGuardando(true);
    try {
      await api.post("/api/v1/ventas", {
        clienteId: Number(formulario.clienteId),
        empleadoId: Number(currentEmpleadoId),
        cajaId: Number(currentCajaId),
        formaPago: "CONTADO",
        medioPago: formulario.medioPago,
        descuento: descuentoGlobal,
        observaciones: formulario.observaciones || null,
        recetaId: recetaSeleccionadaId ? Number(recetaSeleccionadaId) : null,
        cotizacionId: cotizacionImportada ? Number(cotizacionImportada.id) : null,
        detalles: detalles.map((detalle) => ({
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          descuento: detalle.descuento,
        })),
      });

      Toast.fire({ icon: "success", title: "Venta emitida" });
      setDetalles([]);
      setFormulario((prev) => ({
        ...prev,
        clienteId: "",
        descuento: "0",
        observaciones: "",
      }));
      setBusquedaCliente("");
      setRecetaSeleccionadaId("");
      setCotizacionIdBusqueda("");
      setCotizacionImportada(null);
      cargarDatos();
    } catch (error) {
      console.error("Error al emitir venta:", error);
      Toast.fire({
        icon: "error",
        title: mensajeBackend(error, "No se pudo emitir la venta"),
      });
    } finally {
      setGuardando(false);
    }
  };

  const ventasFiltradas = ventas.filter((venta) => {
    const termino = busqueda.toLowerCase();
    return (
      venta.clienteNombre?.toLowerCase().includes(termino) ||
      venta.empleadoNombre?.toLowerCase().includes(termino) ||
      String(venta.id).includes(termino)
    );
  });

  const requiereProcesamiento = useMemo(() => {
    return detalles.some((detalle) => {
      const prod = productos.find(
        (p) => String(p.id) === String(detalle.productoId),
      );
      if (!prod) return false;
      const cat = (prod.categoriaNombre || "").toLowerCase();
      return (
        cat.includes("luna") ||
        cat.includes("servicio") ||
        cat.includes("cristal") ||
        cat.includes("laboratorio") ||
        cat.includes("tratamiento")
      );
    });
  }, [detalles, productos]);

  const clienteSeleccionado = clientes.find(
    (item) => String(item.id) === String(formulario.clienteId),
  );
  const productoSeleccionado = productos.find(
    (item) => String(item.id) === String(productoId),
  );
  const clientesFiltrados = clientes
    .filter((cliente) => {
      const termino = busquedaCliente.trim().toLowerCase();
      if (!termino) return true;
      return [
        cliente.nombreCompleto,
        cliente.nombreEmpresa,
        cliente.numeroDocumento,
        cliente.correo,
      ].some((valor) =>
        String(valor || "")
          .toLowerCase()
          .includes(termino),
      );
    })
    .slice(0, 8);
  const productosFiltrados = productos
    .filter((producto) => {
      const termino = busquedaProducto.trim().toLowerCase();
      if (!termino) return true;
      return [
        producto.nombre,
        producto.codigo,
        producto.marcaNombre,
        producto.categoriaNombre,
      ].some((valor) =>
        String(valor || "")
          .toLowerCase()
          .includes(termino),
      );
    })
    .slice(0, 8);

  return (
    <div style={{ padding: "10px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            <Receipt style={{ marginRight: 10, verticalAlign: "middle" }} />
            Ventas
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            Emisión de ventas al contado con salida de inventario e ingreso a
            caja.
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={cargarDatos}
          disabled={cargando}
        >
          <ArrowRepeat className={cargando ? "spin-animation" : ""} />{" "}
          Actualizar
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(360px, 0.95fr) minmax(460px, 1.35fr)",
          gap: 18,
        }}
      >
        {!cajaActual ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "40px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              minHeight: 400,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                color: "#d97706",
              }}
            >
              <CashCoin size={32} />
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Caja Cerrada
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 14,
                color: "#64748b",
                maxWidth: 280,
                lineHeight: "1.5",
              }}
            >
              Para registrar una nueva venta, es necesario que aperture su caja
              de atención diaria.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={abrirModalCaja}
            >
              Aperturar mi Caja
            </button>
          </div>
        ) : (
          <form
            onSubmit={enviarVenta}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 18,
            }}
          >
            <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#0f172a" }}>
              Nueva venta
            </h3>

            {/* Importar Cotización Web */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#eff6ff",
              border: "1px dashed #3b82f6",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 18,
              flexWrap: "wrap"
            }}>
              <span style={{ fontSize: 13, fontWeight: "600", color: "#1d4ed8" }}>
                ¿Cerrar cotización web?
              </span>
              <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 250, maxWidth: 350 }}>
                <input
                  type="text"
                  className="input-control"
                  style={{ height: 34, padding: "4px 10px", fontSize: 13, margin: 0 }}
                  placeholder="Ingrese ID de cotización..."
                  value={cotizacionIdBusqueda}
                  onChange={(e) => setCotizacionIdBusqueda(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary"
                  style={{ height: 34, padding: "0 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, margin: 0 }}
                  onClick={handleImportarCotizacion}
                >
                  <ArrowRepeat size={14} /> Importar
                </button>
              </div>
              {cotizacionImportada && (
                <span style={{ fontSize: 12, fontWeight: "600", color: "#166534", marginLeft: "auto" }}>
                  Importada: #{cotizacionImportada.id} ({formatoMoneda(cotizacionImportada.totalEstimado)})
                </span>
              )}
            </div>

            <div className="form-grid">
              <div>
                <label className="label-control">Cliente *</label>
                <div style={{ display: "flex", gap: 8, position: "relative" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      className="input-control"
                      value={busquedaCliente}
                      onChange={(e) => {
                        setBusquedaCliente(e.target.value);
                        setFormulario((prev) => ({ ...prev, clienteId: "" }));
                        setMostrarResultadosCliente(true);
                      }}
                      onFocus={() => setMostrarResultadosCliente(true)}
                      placeholder="Buscar por nombre, DNI o correo"
                    />
                    {mostrarResultadosCliente && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          left: 0,
                          right: 0,
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                          zIndex: 20,
                          maxHeight: 240,
                          overflowY: "auto",
                        }}
                      >
                        {clientesFiltrados.length === 0 ? (
                          <div
                            style={{
                              padding: 12,
                              color: "#94a3b8",
                              fontSize: 13,
                            }}
                          >
                            Sin resultados
                          </div>
                        ) : (
                          clientesFiltrados.map((cliente) => (
                            <button
                              key={cliente.id}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => seleccionarCliente(cliente)}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "#fff",
                                padding: "10px 12px",
                                textAlign: "left",
                                cursor: "pointer",
                                borderBottom: "1px solid #f1f5f9",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  fontSize: 13,
                                }}
                              >
                                {nombreCliente(cliente)}
                              </div>
                              <div style={{ color: "#64748b", fontSize: 12 }}>
                                {cliente.numeroDocumento || "---"}{" "}
                                {cliente.correo ? `| ${cliente.correo}` : ""}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setModalClienteRapido(true)}
                  >
                    Nuevo
                  </button>
                </div>
                {clienteSeleccionado && (
                  <span
                    style={{
                      display: "block",
                      marginTop: 5,
                      fontSize: 11,
                      color: "#166534",
                    }}
                  >
                    Seleccionado: {nombreCliente(clienteSeleccionado)}
                  </span>
                )}
              </div>
              <div>
                <label className="label-control">Medio de pago *</label>
                <select
                  className="input-control"
                  value={formulario.medioPago}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      medioPago: e.target.value,
                    }))
                  }
                >
                  {[
                    "EFECTIVO",
                    "YAPE",
                    "PLIN",
                    "TRANSFERENCIA",
                    "TARJETA",
                    "OTRO",
                  ].map((medio) => (
                    <option key={medio} value={medio}>
                      {medio}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div>
                <label className="label-control">Comprobante</label>
                <input
                  className="input-control"
                  value="Autogenerado al emitir"
                  readOnly
                  style={{ color: "#64748b", background: "#f8fafc" }}
                />
              </div>
              <div>
                <label className="label-control">Descuento global</label>
                <input
                  className="input-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.descuento}
                  onChange={(e) =>
                    setFormulario((prev) => ({
                      ...prev,
                      descuento: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 12,
                marginTop: 8,
              }}
            >
              <label className="label-control">Agregar producto</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input-control"
                  value={busquedaProducto}
                  onChange={(e) => {
                    setBusquedaProducto(e.target.value);
                    setProductoId("");
                    setPrecioUnitario("");
                    setMostrarResultadosProducto(true);
                  }}
                  onFocus={() => setMostrarResultadosProducto(true)}
                  placeholder="Buscar producto por nombre, codigo, marca o categoria"
                />
                {mostrarResultadosProducto && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                      zIndex: 20,
                      maxHeight: 260,
                      overflowY: "auto",
                    }}
                  >
                    {productosFiltrados.length === 0 ? (
                      <div
                        style={{ padding: 12, color: "#94a3b8", fontSize: 13 }}
                      >
                        Sin resultados
                      </div>
                    ) : (
                      productosFiltrados.map((producto) => {
                        const sinStock = (producto.stock ?? 0) <= 0;
                        return (
                          <button
                            key={producto.id}
                            type="button"
                            disabled={sinStock}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() =>
                              !sinStock && seleccionarProducto(producto)
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              background: "#fff",
                              padding: "10px 12px",
                              textAlign: "left",
                              cursor: sinStock ? "not-allowed" : "pointer",
                              borderBottom: "1px solid #f1f5f9",
                              opacity: sinStock ? 0.5 : 1,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 700,
                                color: sinStock ? "#94a3b8" : "#0f172a",
                                fontSize: 13,
                              }}
                            >
                              {producto.nombre} {sinStock && "(Sin stock)"}
                            </div>
                            <div style={{ color: "#64748b", fontSize: 12 }}>
                              {producto.codigo || "---"} | Stock:{" "}
                              {producto.stock ?? 0} |{" "}
                              {formatoMoneda(producto.precio)}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              {productoSeleccionado && (
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                  SKU: {productoSeleccionado.codigo || "---"} | Disponible:{" "}
                  {productoSeleccionado.stock ?? 0}
                </div>
              )}
              <div className="form-grid" style={{ marginTop: 10 }}>
                <div>
                  <label className="label-control">Cantidad</label>
                  <input
                    className="input-control"
                    type="number"
                    min="1"
                    step="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-control">Precio</label>
                  <input
                    className="input-control"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-control">Descuento</label>
                  <input
                    className="input-control"
                    type="number"
                    min="0"
                    step="0.01"
                    value={detalleDescuento}
                    onChange={(e) => setDetalleDescuento(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={agregarDetalle}
                style={{ marginTop: 10 }}
              >
                <PlusCircle /> Agregar
              </button>
            </div>

            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table
                className="table-custom"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 8 }}>Producto</th>
                    <th style={{ textAlign: "right", padding: 8 }}>Cant.</th>
                    <th style={{ textAlign: "right", padding: 8 }}>Subtotal</th>
                    <th style={{ padding: 8 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          padding: 14,
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        Sin productos
                      </td>
                    </tr>
                  ) : (
                    detalles.map((detalle) => (
                      <tr key={detalle.productoId}>
                        <td style={{ padding: 8 }}>{detalle.productoNombre}</td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          {detalle.cantidad}
                        </td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          {formatoMoneda(
                            detalle.cantidad * detalle.precioUnitario -
                              detalle.descuento,
                          )}
                        </td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => quitarDetalle(detalle.productoId)}
                            title="Quitar"
                          >
                            <Trash3 />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {formulario.clienteId && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 8,
                  background: requiereProcesamiento ? "#fffbeb" : "#f8fafc",
                  border: requiereProcesamiento
                    ? recetaSeleccionadaId
                      ? "1px solid #fef08a"
                      : "2px dashed #f59e0b"
                    : "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: requiereProcesamiento ? "#b45309" : "#334155",
                    }}
                  >
                    Asociar Receta Clínica{" "}
                    {requiereProcesamiento && " * (Requerido)"}
                  </h4>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setModalRecetaRapida(true)}
                    style={{ padding: "4px 8px", fontSize: 12 }}
                  >
                    + Nueva Receta
                  </button>
                </div>

                {recetasCliente.length === 0 ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <span>El cliente no tiene recetas registradas.</span>
                    {requiereProcesamiento && (
                      <span style={{ color: "#d97706", fontWeight: 600 }}>
                        ⚠️ Debe registrar una receta para proceder con la venta
                        de lunas/servicios.
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <select
                      className="input-control"
                      value={recetaSeleccionadaId}
                      onChange={(e) => setRecetaSeleccionadaId(e.target.value)}
                      style={{ fontSize: 12.5, padding: "6px 10px" }}
                    >
                      <option value="">-- Sin receta asociada --</option>
                      {recetasCliente.map((r) => (
                        <option key={r.id} value={r.id}>
                          Eval:{" "}
                          {new Date(r.fechaEvaluacion).toLocaleDateString()} -
                          Luna: {r.tipoLuna} ({r.materialSugerido})
                        </option>
                      ))}
                    </select>

                    {recetaSeleccionadaId &&
                      (() => {
                        const rSel = recetasCliente.find(
                          (r) => String(r.id) === String(recetaSeleccionadaId),
                        );
                        if (!rSel) return null;
                        return (
                          <div
                            style={{
                              marginTop: 6,
                              padding: 6,
                              background: "#fff",
                              borderRadius: 4,
                              border: "1px solid #e2e8f0",
                              fontSize: 11.5,
                              color: "#475569",
                            }}
                          >
                            <div>
                              <strong>OD:</strong> Esf:{" "}
                              {rSel.odEsfera || "0.00"} | Cil:{" "}
                              {rSel.odCilindro || "0.00"} | Eje:{" "}
                              {rSel.odEje || "0"}° | AV: {rSel.odAvLejos || "-"}
                            </div>
                            <div>
                              <strong>OI:</strong> Esf:{" "}
                              {rSel.oiEsfera || "0.00"} | Cil:{" "}
                              {rSel.oiCilindro || "0.00"} | Eje:{" "}
                              {rSel.oiEje || "0"}° | AV: {rSel.oiAvLejos || "-"}
                            </div>
                            {rSel.tratamientos &&
                              rSel.tratamientos.length > 0 && (
                                <div style={{ marginTop: 2 }}>
                                  <strong>Tratamientos:</strong>{" "}
                                  {rSel.tratamientos.join(", ")}
                                </div>
                              )}
                          </div>
                        );
                      })()}

                    {requiereProcesamiento && !recetaSeleccionadaId && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#d97706",
                          marginTop: 4,
                          fontWeight: 600,
                        }}
                      >
                        ⚠️ Seleccione una receta para enviar la orden al
                        laboratorio.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <textarea
              className="input-control"
              value={formulario.observaciones}
              onChange={(e) =>
                setFormulario((prev) => ({
                  ...prev,
                  observaciones: e.target.value,
                }))
              }
              placeholder="Observaciones"
              maxLength={255}
              rows={2}
              style={{ marginTop: 10, resize: "vertical" }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 14,
                color: "#334155",
              }}
            >
              <strong>Subtotal</strong>
              <span style={{ textAlign: "right" }}>
                {formatoMoneda(subtotal)}
              </span>
              <strong>Descuento</strong>
              <span style={{ textAlign: "right" }}>
                {formatoMoneda(descuentoGlobal)}
              </span>
              <strong style={{ fontSize: 18 }}>Total</strong>
              <strong style={{ textAlign: "right", fontSize: 18 }}>
                {formatoMoneda(total)}
              </strong>
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={guardando}
              style={{ width: "100%", marginTop: 16 }}
            >
              {guardando ? "Emitiendo..." : "Emitir venta"}
            </button>
          </form>
        )}

        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
              Ventas emitidas
            </h3>
            <div style={{ position: "relative", width: 260 }}>
              <Search
                style={{
                  position: "absolute",
                  left: 10,
                  top: 10,
                  color: "#94a3b8",
                }}
              />
              <input
                className="input-control"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar..."
                style={{ paddingLeft: 34 }}
              />
            </div>
          </div>

          {cargando ? (
            <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
              Cargando ventas...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                className="table-custom"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #e2e8f0",
                      color: "#475569",
                    }}
                  >
                    <th style={{ textAlign: "left", padding: 10 }}>ID</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Cliente</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Pago</th>
                    <th style={{ textAlign: "right", padding: 10 }}>Total</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: 30,
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        No hay ventas registradas.
                      </td>
                    </tr>
                  ) : (
                    ventasFiltradas.map((venta) => (
                      <tr
                        key={venta.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: 10, color: "#64748b" }}>
                          #{venta.id}
                        </td>
                        <td style={{ padding: 10 }}>
                          <div style={{ fontWeight: 600 }}>
                            {venta.clienteNombre || "---"}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            {venta.empleadoNombre || "---"}
                          </div>
                        </td>
                        <td style={{ padding: 10 }}>{venta.medioPago}</td>
                        <td
                          style={{
                            padding: 10,
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {formatoMoneda(venta.total)}
                        </td>
                        <td style={{ padding: 10 }}>
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#166534",
                              borderRadius: 6,
                              padding: "4px 8px",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {venta.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {modalClienteRapido && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onMouseDown={() => setModalClienteRapido(false)}
        >
          <form
            onSubmit={crearClienteRapido}
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              padding: 18,
              boxShadow: "0 24px 70px rgba(15,23,42,0.22)",
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 17, color: "#0f172a" }}>
              Nuevo cliente
            </h3>
            <label className="label-control">DNI *</label>
            <input
              className="input-control"
              value={clienteRapido.dni}
              onChange={(e) =>
                setClienteRapido((prev) => ({
                  ...prev,
                  dni: e.target.value.replace(/\D/g, "").slice(0, 8),
                }))
              }
              maxLength={8}
              autoFocus
            />
            <label className="label-control" style={{ marginTop: 10 }}>
              Telefono
            </label>
            <input
              className="input-control"
              value={clienteRapido.telefono}
              onChange={(e) =>
                setClienteRapido((prev) => ({
                  ...prev,
                  telefono: e.target.value,
                }))
              }
              maxLength={15}
            />
            <label className="label-control" style={{ marginTop: 10 }}>
              Correo
            </label>
            <input
              className="input-control"
              type="email"
              value={clienteRapido.correo}
              onChange={(e) =>
                setClienteRapido((prev) => ({
                  ...prev,
                  correo: e.target.value,
                }))
              }
              maxLength={120}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setModalClienteRapido(false)}
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={guardandoCliente}
                style={{ flex: 1 }}
              >
                {guardandoCliente ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {modalRecetaRapida && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onMouseDown={() => setModalRecetaRapida(false)}
        >
          <form
            onSubmit={handleCrearRecetaRapida}
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: "min(680px, 100%)",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              padding: 18,
              boxShadow: "0 24px 70px rgba(15,23,42,0.22)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 17, color: "#0f172a" }}>
              Registrar Receta Rápida
            </h3>

            <h4
              style={{
                fontSize: "12.5px",
                fontWeight: "600",
                color: "#3b82f6",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "4px",
                marginBottom: "8px",
              }}
            >
              REFRACCIÓN CLÍNICA
            </h4>

            <div style={{ overflowX: "auto", marginBottom: "12px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                  minWidth: "500px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "1.5px solid #e2e8f0",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "6px" }}>OJO</th>
                    <th style={{ padding: "6px" }}>ESFERA</th>
                    <th style={{ padding: "6px" }}>CILINDRO</th>
                    <th style={{ padding: "6px" }}>EJE</th>
                    <th style={{ padding: "6px" }}>AV LEJOS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td
                      style={{
                        padding: "6px",
                        fontWeight: "600",
                        color: "#ef4444",
                      }}
                    >
                      OD
                    </td>
                    <td style={{ padding: "6px" }}>
                      <input
                        type="number"
                        step="0.25"
                        className="input-control"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        placeholder="0.00"
                        value={recetaRapida.odEsfera}
                        onChange={(e) =>
                          setRecetaRapida((prev) => ({
                            ...prev,
                            odEsfera: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td style={{ padding: "6px" }}>
                      <input
                        type="number"
                        step="0.25"
                        className="input-control"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        placeholder="0.00"
                        value={recetaRapida.odCilindro}
                        onChange={(e) =>
                          setRecetaRapida((prev) => ({
                            ...prev,
                            odCilindro: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td style={{ padding: "6px" }}>
                      <input
                        type="number"
                        step="1"
                        className="input-control"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        placeholder="0"
                        value={recetaRapida.odEje}
                        onChange={(e) =>
                          setRecetaRapida((prev) => ({
                            ...prev,
                            odEje: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td style={{ padding: "6px" }}>
                      <input
                        type="text"
                        className="input-control"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        placeholder="20/20"
                        value={recetaRapida.odAvLejos}
                        onChange={(e) =>
                          setRecetaRapida((prev) => ({
                            ...prev,
                            odAvLejos: e.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "6px",
                        fontWeight: "600",
                        color: "#3b82f6",
                      }}
                    >
                      OI
                    </td>
                    <td style={{ padding: "6px" }}>
                      <input
                        type="number"
                        step="0.25"
                        className="input-control"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        placeholder="0.00"
                        value={recetaRapida.oiEsfera}
                        onChange={(e) =>
                          setRecetaRapida((prev) => ({
                            ...prev,
                            oiEsfera: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td style={{ padding: "6px" }}>
                      <input
                        type="number"
                        step="0.25"
                        className="input-control"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        placeholder="0.00"
                        value={recetaRapida.oiCilindro}
                        onChange={(e) =>
                          setRecetaRapida((prev) => ({
                            ...prev,
                            oiCilindro: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td style={{ padding: "6px" }}>
                      <input
                        type="number"
                        step="1"
                        className="input-control"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        placeholder="0"
                        value={recetaRapida.oiEje}
                        onChange={(e) =>
                          setRecetaRapida((prev) => ({
                            ...prev,
                            oiEje: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td style={{ padding: "6px" }}>
                      <input
                        type="text"
                        className="input-control"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        placeholder="20/20"
                        value={recetaRapida.oiAvLejos}
                        onChange={(e) =>
                          setRecetaRapida((prev) => ({
                            ...prev,
                            oiAvLejos: e.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="form-grid" style={{ marginBottom: "10px" }}>
              <div>
                <label className="label-control" style={{ fontSize: 12 }}>
                  DP (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="62"
                  className="input-control"
                  style={{ padding: "6px 10px", fontSize: 12.5 }}
                  value={recetaRapida.distanciaPupilar}
                  onChange={(e) =>
                    setRecetaRapida((prev) => ({
                      ...prev,
                      distanciaPupilar: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="label-control" style={{ fontSize: 12 }}>
                  Adición
                </label>
                <input
                  type="number"
                  step="0.25"
                  placeholder="+1.75"
                  className="input-control"
                  style={{ padding: "6px 10px", fontSize: 12.5 }}
                  value={recetaRapida.adicion}
                  onChange={(e) =>
                    setRecetaRapida((prev) => ({
                      ...prev,
                      adicion: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <h4
              style={{
                fontSize: "12.5px",
                fontWeight: "600",
                color: "#3b82f6",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "4px",
                marginBottom: "8px",
                marginTop: "10px",
              }}
            >
              SUGERENCIA COMERCIAL
            </h4>
            <div className="form-grid" style={{ marginBottom: "10px" }}>
              <div>
                <label className="label-control" style={{ fontSize: 12 }}>
                  Tipo Luna
                </label>
                <select
                  className="input-control"
                  style={{ padding: "6px 10px", fontSize: 12.5 }}
                  value={recetaRapida.tipoLuna}
                  onChange={(e) =>
                    setRecetaRapida((prev) => ({
                      ...prev,
                      tipoLuna: e.target.value,
                    }))
                  }
                >
                  <option value="Monofocal">Monofocal</option>
                  <option value="Bifocal">Bifocal</option>
                  <option value="Progresivo">Progresivo</option>
                  <option value="Ocupacional">Ocupacional</option>
                </select>
              </div>
              <div>
                <label className="label-control" style={{ fontSize: 12 }}>
                  Material
                </label>
                <select
                  className="input-control"
                  style={{ padding: "6px 10px", fontSize: 12.5 }}
                  value={recetaRapida.materialSugerido}
                  onChange={(e) =>
                    setRecetaRapida((prev) => ({
                      ...prev,
                      materialSugerido: e.target.value,
                    }))
                  }
                >
                  <option value="Resina Básica">Resina Básica (1.56)</option>
                  <option value="Policarbonato">Policarbonato (1.59)</option>
                  <option value="Resina Alto Índice">
                    Resina Alto Índice (1.67 / 1.74)
                  </option>
                  <option value="Cristal">Cristal</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label
                className="label-control"
                style={{ fontWeight: "600", fontSize: 12 }}
              >
                Tratamientos recomendados
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "6px",
                  marginTop: "4px",
                }}
              >
                {Object.keys(recetaRapida.tratamientos).map((key) => (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "11.5px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={recetaRapida.tratamientos[key]}
                      onChange={() => handleTratamientoRapidoChange(key)}
                      style={{ width: "14px", height: "14px" }}
                    />
                    {key}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label className="label-control" style={{ fontSize: 12 }}>
                Observaciones / Recomendaciones
              </label>
              <textarea
                className="input-control"
                style={{ height: "50px", fontSize: "12px" }}
                placeholder="Observaciones de la receta..."
                value={recetaRapida.observaciones}
                onChange={(e) =>
                  setRecetaRapida((prev) => ({
                    ...prev,
                    observaciones: e.target.value,
                  }))
                }
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setModalRecetaRapida(false)}
                style={{ flex: 1, padding: "8px" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, padding: "8px" }}
              >
                Guardar y Asociar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Ventas;
