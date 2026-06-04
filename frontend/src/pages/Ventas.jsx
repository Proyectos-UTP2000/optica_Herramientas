import { useEffect, useMemo, useState } from "react";
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
  const [mostrarResultadosCliente, setMostrarResultadosCliente] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mostrarResultadosProducto, setMostrarResultadosProducto] = useState(false);
  const [modalClienteRapido, setModalClienteRapido] = useState(false);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [detalleDescuento, setDetalleDescuento] = useState("0");
  const [detalles, setDetalles] = useState([]);
  const [cajaActual, setCajaActual] = useState(null);
  const [clienteRapido, setClienteRapido] = useState({
    dni: "",
    telefono: "",
    correo: "",
  });
  const [formulario, setFormulario] = useState({
    clienteId: "",
    empleadoId: localStorage.getItem("empleadoId") || "",
    cajaId: "",
    medioPago: "EFECTIVO",
    descuento: "0",
    observaciones: "",
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [ventasRes, clientesRes, productosRes] = await Promise.all([
        api.get("/api/v1/ventas"),
        api.get("/api/v1/clientes"),
        api.get("/api/v1/productos"),
      ]);
      setVentas(ventasRes.data || []);
      setClientes((clientesRes.data || []).filter((cliente) => cliente.estado === 1));
      setProductos((productosRes.data || []).filter((producto) => producto.estado === 1));
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

  const cargarCajaActual = async () => {
    if (!formulario.empleadoId) {
      Toast.fire({ icon: "warning", title: "Ingrese el ID del empleado responsable" });
      return;
    }
    try {
      const response = await api.get(`/api/v1/cajas/actual?empleadoId=${formulario.empleadoId}`);
      setCajaActual(response.data);
      setFormulario((prev) => ({ ...prev, cajaId: response.data.id }));
      Toast.fire({ icon: "success", title: "Caja actual cargada" });
    } catch (error) {
      console.error("Error al cargar caja actual:", error);
      setCajaActual(null);
      setFormulario((prev) => ({ ...prev, cajaId: "" }));
      Toast.fire({
        icon: "error",
        title: mensajeBackend(error, "El empleado no tiene una caja abierta"),
      });
    }
  };

  const agregarDetalle = () => {
    const producto = productos.find((item) => String(item.id) === String(productoId));
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
    if (cantidadNumero <= 0 || precioNumero <= 0 || descuentoNumero < 0) {
      Toast.fire({ icon: "warning", title: "Revise cantidad, precio y descuento" });
      return;
    }
    if (cantidadNumero > Number(producto.stock || 0)) {
      Toast.fire({ icon: "warning", title: "La cantidad supera el stock disponible" });
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
    cliente?.nombreCompleto || cliente?.nombreEmpresa || cliente?.numeroDocumento || "Cliente sin nombre";

  const seleccionarCliente = (cliente) => {
    setFormulario((prev) => ({ ...prev, clienteId: String(cliente.id) }));
    setBusquedaCliente(nombreCliente(cliente));
    setMostrarResultadosCliente(false);
  };

  const textoProducto = (producto) =>
    [producto?.nombre, producto?.codigo].filter(Boolean).join(" | ") || `Producto #${producto?.id}`;

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
      Toast.fire({ icon: "warning", title: "Ingrese un DNI valido de 8 digitos" });
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
        const sinDuplicado = prev.filter((cliente) => cliente.id !== nuevoCliente.id);
        return [...sinDuplicado, nuevoCliente].filter((cliente) => cliente.estado === 1);
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
    if (!formulario.clienteId || !formulario.empleadoId || !formulario.cajaId) {
      Toast.fire({ icon: "warning", title: "Cliente, empleado y caja son obligatorios" });
      return;
    }
    if (detalles.length === 0) {
      Toast.fire({ icon: "warning", title: "Agregue al menos un producto" });
      return;
    }

    setGuardando(true);
    try {
      await api.post("/api/v1/ventas", {
        clienteId: Number(formulario.clienteId),
        empleadoId: Number(formulario.empleadoId),
        cajaId: Number(formulario.cajaId),
        formaPago: "CONTADO",
        medioPago: formulario.medioPago,
        descuento: descuentoGlobal,
        observaciones: formulario.observaciones || null,
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

  const clienteSeleccionado = clientes.find((item) => String(item.id) === String(formulario.clienteId));
  const productoSeleccionado = productos.find((item) => String(item.id) === String(productoId));
  const clientesFiltrados = clientes
    .filter((cliente) => {
      const termino = busquedaCliente.trim().toLowerCase();
      if (!termino) return true;
      return [
        cliente.nombreCompleto,
        cliente.nombreEmpresa,
        cliente.numeroDocumento,
        cliente.correo,
      ].some((valor) => String(valor || "").toLowerCase().includes(termino));
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
      ].some((valor) => String(valor || "").toLowerCase().includes(termino));
    })
    .slice(0, 8);

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
            <Receipt style={{ marginRight: 10, verticalAlign: "middle" }} />
            Ventas
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            Emisión de ventas al contado con salida de inventario e ingreso a caja.
          </p>
        </div>
        <button className="btn-secondary" onClick={cargarDatos} disabled={cargando}>
          <ArrowRepeat className={cargando ? "spin-animation" : ""} /> Actualizar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(360px, 0.95fr) minmax(460px, 1.35fr)", gap: 18 }}>
        <form onSubmit={enviarVenta} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#0f172a" }}>Nueva venta</h3>

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
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 12px 30px rgba(15,23,42,0.12)", zIndex: 20, maxHeight: 240, overflowY: "auto" }}>
                      {clientesFiltrados.length === 0 ? (
                        <div style={{ padding: 12, color: "#94a3b8", fontSize: 13 }}>Sin resultados</div>
                      ) : clientesFiltrados.map((cliente) => (
                        <button
                          key={cliente.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => seleccionarCliente(cliente)}
                          style={{ width: "100%", border: "none", background: "#fff", padding: "10px 12px", textAlign: "left", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
                        >
                          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{nombreCliente(cliente)}</div>
                          <div style={{ color: "#64748b", fontSize: 12 }}>{cliente.numeroDocumento || "---"} {cliente.correo ? `| ${cliente.correo}` : ""}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" className="btn-secondary" onClick={() => setModalClienteRapido(true)}>
                  Nuevo
                </button>
              </div>
              {clienteSeleccionado && (
                <span style={{ display: "block", marginTop: 5, fontSize: 11, color: "#166534" }}>
                  Seleccionado: {nombreCliente(clienteSeleccionado)}
                </span>
              )}
            </div>
            <div>
              <label className="label-control">Medio de pago *</label>
              <select
                className="input-control"
                value={formulario.medioPago}
                onChange={(e) => setFormulario((prev) => ({ ...prev, medioPago: e.target.value }))}
              >
                {["EFECTIVO", "YAPE", "PLIN", "TRANSFERENCIA", "TARJETA", "OTRO"].map((medio) => (
                  <option key={medio} value={medio}>{medio}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label className="label-control">Empleado ID *</label>
              <input
                className="input-control"
                type="number"
                min="1"
                value={formulario.empleadoId}
                onChange={(e) => setFormulario((prev) => ({ ...prev, empleadoId: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-control">Caja *</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input-control" value={formulario.cajaId} readOnly placeholder="Sin caja" />
                <button type="button" className="btn-secondary" onClick={cargarCajaActual} title="Cargar caja actual">
                  <CashCoin />
                </button>
              </div>
              {cajaActual && (
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  Abierta con {formatoMoneda(cajaActual.montoInicial)}
                </span>
              )}
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
                onChange={(e) => setFormulario((prev) => ({ ...prev, descuento: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, marginTop: 8 }}>
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
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 12px 30px rgba(15,23,42,0.12)", zIndex: 20, maxHeight: 260, overflowY: "auto" }}>
                  {productosFiltrados.length === 0 ? (
                    <div style={{ padding: 12, color: "#94a3b8", fontSize: 13 }}>Sin resultados</div>
                  ) : productosFiltrados.map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => seleccionarProducto(producto)}
                      style={{ width: "100%", border: "none", background: "#fff", padding: "10px 12px", textAlign: "left", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
                    >
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{producto.nombre}</div>
                      <div style={{ color: "#64748b", fontSize: 12 }}>
                        {producto.codigo || "---"} | Stock: {producto.stock ?? 0} | {formatoMoneda(producto.precio)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {productoSeleccionado && (
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                SKU: {productoSeleccionado.codigo || "---"} | Disponible: {productoSeleccionado.stock ?? 0}
              </div>
            )}
            <div className="form-grid" style={{ marginTop: 10 }}>
              <div>
                <label className="label-control">Cantidad</label>
                <input className="input-control" type="number" min="0.001" step="0.001" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
              </div>
              <div>
                <label className="label-control">Precio</label>
                <input className="input-control" type="number" min="0.01" step="0.01" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} />
              </div>
              <div>
                <label className="label-control">Descuento</label>
                <input className="input-control" type="number" min="0" step="0.01" value={detalleDescuento} onChange={(e) => setDetalleDescuento(e.target.value)} />
              </div>
            </div>
            <button type="button" className="btn-primary" onClick={agregarDetalle} style={{ marginTop: 10 }}>
              <PlusCircle /> Agregar
            </button>
          </div>

          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table className="table-custom" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
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
                  <tr><td colSpan="4" style={{ padding: 14, textAlign: "center", color: "#94a3b8" }}>Sin productos</td></tr>
                ) : detalles.map((detalle) => (
                  <tr key={detalle.productoId}>
                    <td style={{ padding: 8 }}>{detalle.productoNombre}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>{detalle.cantidad}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>{formatoMoneda(detalle.cantidad * detalle.precioUnitario - detalle.descuento)}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      <button type="button" className="btn-secondary" onClick={() => quitarDetalle(detalle.productoId)} title="Quitar">
                        <Trash3 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <textarea
            className="input-control"
            value={formulario.observaciones}
            onChange={(e) => setFormulario((prev) => ({ ...prev, observaciones: e.target.value }))}
            placeholder="Observaciones"
            maxLength={255}
            rows={2}
            style={{ marginTop: 10, resize: "vertical" }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14, color: "#334155" }}>
            <strong>Subtotal</strong><span style={{ textAlign: "right" }}>{formatoMoneda(subtotal)}</span>
            <strong>Descuento</strong><span style={{ textAlign: "right" }}>{formatoMoneda(descuentoGlobal)}</span>
            <strong style={{ fontSize: 18 }}>Total</strong><strong style={{ textAlign: "right", fontSize: 18 }}>{formatoMoneda(total)}</strong>
          </div>

          <button className="btn-primary" type="submit" disabled={guardando} style={{ width: "100%", marginTop: 16 }}>
            {guardando ? "Emitiendo..." : "Emitir venta"}
          </button>
        </form>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Ventas emitidas</h3>
            <div style={{ position: "relative", width: 260 }}>
              <Search style={{ position: "absolute", left: 10, top: 10, color: "#94a3b8" }} />
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
            <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Cargando ventas...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table-custom" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ textAlign: "left", padding: 10 }}>ID</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Cliente</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Pago</th>
                    <th style={{ textAlign: "right", padding: 10 }}>Total</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: 30, textAlign: "center", color: "#94a3b8" }}>No hay ventas registradas.</td></tr>
                  ) : ventasFiltradas.map((venta) => (
                    <tr key={venta.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: 10, color: "#64748b" }}>#{venta.id}</td>
                      <td style={{ padding: 10 }}>
                        <div style={{ fontWeight: 600 }}>{venta.clienteNombre || "---"}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{venta.empleadoNombre || "---"}</div>
                      </td>
                      <td style={{ padding: 10 }}>{venta.medioPago}</td>
                      <td style={{ padding: 10, textAlign: "right", fontWeight: 700 }}>{formatoMoneda(venta.total)}</td>
                      <td style={{ padding: 10 }}>
                        <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 700 }}>
                          {venta.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {modalClienteRapido && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onMouseDown={() => setModalClienteRapido(false)}
        >
          <form
            onSubmit={crearClienteRapido}
            onMouseDown={(event) => event.stopPropagation()}
            style={{ width: "min(420px, 100%)", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18, boxShadow: "0 24px 70px rgba(15,23,42,0.22)" }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 17, color: "#0f172a" }}>Nuevo cliente</h3>
            <label className="label-control">DNI *</label>
            <input
              className="input-control"
              value={clienteRapido.dni}
              onChange={(e) => setClienteRapido((prev) => ({ ...prev, dni: e.target.value.replace(/\D/g, "").slice(0, 8) }))}
              maxLength={8}
              autoFocus
            />
            <label className="label-control" style={{ marginTop: 10 }}>Telefono</label>
            <input
              className="input-control"
              value={clienteRapido.telefono}
              onChange={(e) => setClienteRapido((prev) => ({ ...prev, telefono: e.target.value }))}
              maxLength={15}
            />
            <label className="label-control" style={{ marginTop: 10 }}>Correo</label>
            <input
              className="input-control"
              type="email"
              value={clienteRapido.correo}
              onChange={(e) => setClienteRapido((prev) => ({ ...prev, correo: e.target.value }))}
              maxLength={120}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button type="button" className="btn-secondary" onClick={() => setModalClienteRapido(false)} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={guardandoCliente} style={{ flex: 1 }}>
                {guardandoCliente ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Ventas;
