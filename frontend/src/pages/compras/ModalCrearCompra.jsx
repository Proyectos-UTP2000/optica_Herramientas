import { useState, useEffect, useRef } from "react";
import {
  registrarCompra,
  listarProveedores,
  getEmpleadoActual,
  listarProductos,
} from "../../api/comprasService";

const FORMAS_PAGO = ["CONTADO", "CREDITO"];
const MEDIOS_PAGO = [
  "EFECTIVO",
  "TARJETA",
  "TRANSFERENCIA",
  "YAPE",
  "PLIN",
  "OTRO",
];
const TIPOS_COMPROBANTE = [
  { id: 1, nombre: "BOLETA" },
  { id: 2, nombre: "FACTURA" },
  { id: 3, nombre: "NOTA DE COMPRA" },
];
const DETALLE_VACIO = { idProducto: "", cantidad: 1, precio: "" };

function generarNumeroComprobante() {
  const ahora = new Date();
  const anio = ahora.getFullYear().toString().slice(-2);
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `C${anio}${mes}${dia}-${rand}`;
}

function calcularTotal(detalles) {
  return detalles
    .reduce((acc, d) => acc + (Number(d.cantidad) * Number(d.precio) || 0), 0)
    .toFixed(2);
}

export default function ModalCrearCompra({ onCerrar, onGuardado }) {
  const [form, setForm] = useState({
    idProveedor: "",
    idTipoComprobante: "2", // Por defecto FACTURA
    compraNumeroCombrobante: generarNumeroComprobante(),
    formaPago: "CONTADO",
    medioPago: "",
    pagoInicial: "",
    cuotas: "",
    fechaVencimiento: "",
    notaRecepcion: "",
    detalles: [{ ...DETALLE_VACIO }],
  });
  const [proveedores, setProveedores] = useState([]);
  const [empleadoId, setEmpleadoId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [provBusqueda, setProvBusqueda] = useState("");
  const [mostrarDropdownProv, setMostrarDropdownProv] = useState(false);
  const dropdownRef = useRef(null);

  const [productosDB, setProductosDB] = useState([]);
  const [prodBusqueda, setProdBusqueda] = useState([""]); // array de textos de búsqueda por línea
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null); // índice del dropdown activo

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarDropdownProv(false);
      }
      if (activeDropdownIndex !== null) {
        const activeDropdown = document.querySelector(
          `.product-dropdown-container[data-index="${activeDropdownIndex}"]`,
        );
        if (activeDropdown && !activeDropdown.contains(event.target)) {
          setActiveDropdownIndex(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdownIndex]);

  useEffect(() => {
    listarProveedores()
      .then((data) => setProveedores(Array.isArray(data) ? data : []))
      .catch(() => setError("No se pudieron cargar los proveedores."));

    getEmpleadoActual()
      .then((id) => setEmpleadoId(id))
      .catch(() => setError("No se pudo obtener el empleado actual."));

    listarProductos()
      .then((data) =>
        setProductosDB(
          Array.isArray(data) ? data.filter((p) => p.estado === 1) : [],
        ),
      )
      .catch(() => setError("No se pudieron cargar los productos."));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "formaPago" && value === "CONTADO") {
        next.cuotas = "";
        next.fechaVencimiento = "";
      }
      return next;
    });
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((d, i) =>
        i === index ? { ...d, [name]: value } : d,
      ),
    }));
  };

  const agregarDetalle = () => {
    setForm((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { ...DETALLE_VACIO }],
    }));
    setProdBusqueda((prev) => [...prev, ""]);
  };

  const eliminarDetalle = (index) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index),
    }));
    setProdBusqueda((prev) => prev.filter((_, i) => i !== index));
    if (activeDropdownIndex === index) {
      setActiveDropdownIndex(null);
    } else if (activeDropdownIndex > index) {
      setActiveDropdownIndex(activeDropdownIndex - 1);
    }
  };

  const handleProdBusquedaChange = (index, value) => {
    setProdBusqueda((prev) =>
      prev.map((val, i) => (i === index ? value : val)),
    );
    setActiveDropdownIndex(index);
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((d, i) =>
        i === index ? { ...d, idProducto: "" } : d,
      ),
    }));
  };

  const handleProdFocus = (index) => {
    setActiveDropdownIndex(index);
  };

  const seleccionarProducto = (index, prod) => {
    setProdBusqueda((prev) =>
      prev.map((val, i) => (i === index ? prod.nombre || "" : val)),
    );
    setActiveDropdownIndex(null);
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((d, i) => {
        if (i === index) {
          return {
            ...d,
            idProducto: String(prod.id),
            precio:
              prod.costo !== null && prod.costo !== undefined
                ? String(prod.costo)
                : "",
          };
        }
        return d;
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    if (!form.idProveedor) {
      setError("Debes seleccionar un proveedor válido de la lista.");
      setCargando(false);
      return;
    }

    if (!empleadoId) {
      setError("No se pudo obtener el empleado. Vuelve a iniciar sesión.");
      setCargando(false);
      return;
    }

    const tieneProductoInvalido = form.detalles.some((d) => !d.idProducto);
    if (tieneProductoInvalido) {
      setError(
        "Todos los detalles de la compra deben tener un producto seleccionado.",
      );
      setCargando(false);
      return;
    }

    try {
      const payload = {
        empleadoId,
        proveedorId: Number(form.idProveedor),
        formaPago: form.formaPago,
        medioPago: form.medioPago,
        cajaId: 1,
        pagoInicial: form.pagoInicial !== "" ? Number(form.pagoInicial) : 0,
        cuotas:
          form.formaPago === "CREDITO" && form.cuotas
            ? Number(form.cuotas)
            : null,
        fechaVencimiento:
          form.formaPago === "CREDITO" ? form.fechaVencimiento || null : null,
        notaRecepcion: form.notaRecepcion || null,
        numeroComprobante: form.compraNumeroCombrobante,
        tipoComprobanteId: form.idTipoComprobante
          ? Number(form.idTipoComprobante)
          : null,
        detalles: form.detalles.map((d) => ({
          productoId: Number(d.idProducto),
          cantidadCompra: Number(d.cantidad),
          costoUnitario: Number(d.precio),
        })),
      };
      await registrarCompra(payload);
      onGuardado();
      onCerrar();
    } catch (err) {
      setError(
        JSON.stringify(err.response?.data?.validations, null, 2) ||
          JSON.stringify(err.response?.data, null, 2) ||
          err.message ||
          "Error al registrar la compra.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div
        className="modal-content"
        style={{ width: "780px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-main)",
            }}
          >
            Nueva Compra
          </h2>
          <button className="btn-icon delete" type="button" onClick={onCerrar}>
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              margin: "0 1.25rem",
              padding: "0.65rem 1rem",
              borderRadius: 6,
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="modal-body"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* COMPROBANTE */}
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Datos del Comprobante</legend>
              <div className="form-grid">
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <label className="label-control">Proveedor *</label>
                  <input
                    type="text"
                    placeholder="Buscar proveedor por nombre..."
                    value={provBusqueda}
                    onFocus={() => setMostrarDropdownProv(true)}
                    onChange={(e) => {
                      setProvBusqueda(e.target.value);
                      setMostrarDropdownProv(true);
                      setForm((prev) => ({ ...prev, idProveedor: "" }));
                    }}
                    className="input-control"
                    required={!form.idProveedor}
                  />
                  {mostrarDropdownProv && (
                    <div
                      className="autocomplete-dropdown"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        background: "#fff",
                        border: "1px solid var(--border-color)",
                        maxHeight: "200px",
                        overflowY: "auto",
                        borderRadius: "6px",
                        marginTop: "4px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    >
                      {proveedores
                        .filter((p) => {
                          const nombre = (
                            p.razonSocial ||
                            p.proveedorNombre ||
                            p.nombre ||
                            p.proveeNombre ||
                            ""
                          ).toLowerCase();
                          const doc = (
                            p.numeroDocumento ||
                            p.ruc ||
                            p.dni ||
                            ""
                          ).toLowerCase();
                          const query = provBusqueda.toLowerCase();
                          return nombre.includes(query) || doc.includes(query);
                        })
                        .map((p) => (
                          <div
                            key={p.id ?? p.idProveedor}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                idProveedor: String(p.id ?? p.idProveedor),
                              }));
                              setProvBusqueda(
                                p.razonSocial ??
                                  p.proveedorNombre ??
                                  p.nombre ??
                                  p.proveeNombre ??
                                  "",
                              );
                              setMostrarDropdownProv(false);
                            }}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f1f5f9",
                              fontSize: "13px",
                            }}
                            className="autocomplete-item"
                          >
                            <strong>
                              {p.razonSocial ??
                                p.proveedorNombre ??
                                p.nombre ??
                                p.proveeNombre}
                            </strong>
                            <span
                              style={{
                                color: "var(--text-muted)",
                                fontSize: "11px",
                                marginLeft: "6px",
                              }}
                            >
                              (
                              {p.numeroDocumento ?? p.ruc ?? p.dni ?? "Sin Doc"}
                              )
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label-control">Tipo de Comprobante</label>
                  <select
                    name="idTipoComprobante"
                    value={form.idTipoComprobante}
                    onChange={handleChange}
                    className="input-control"
                  >
                    <option value="">-- Sin tipo --</option>
                    {TIPOS_COMPROBANTE.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-control">N° Comprobante</label>
                  <div
                    style={{
                      padding: "9px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color)",
                      background: "#f1f5f9",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      userSelect: "none",
                    }}
                  >
                    {form.compraNumeroCombrobante}
                  </div>
                </div>
              </div>
            </fieldset>

            {/* PAGO */}
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Datos del Pago</legend>
              <div className="form-grid">
                <div>
                  <label className="label-control">Forma de Pago *</label>
                  <select
                    name="formaPago"
                    value={form.formaPago}
                    onChange={handleChange}
                    className="input-control"
                    required
                  >
                    {FORMAS_PAGO.map((fp) => (
                      <option key={fp} value={fp}>
                        {fp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-control">Medio de Pago *</label>
                  <select
                    name="medioPago"
                    value={form.medioPago}
                    onChange={handleChange}
                    className="input-control"
                    required
                  >
                    <option value="">-- Selecciona --</option>
                    {MEDIOS_PAGO.map((mp) => (
                      <option key={mp} value={mp}>
                        {mp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-control">Pago Inicial (S/)</label>
                  <input
                    type="number"
                    name="pagoInicial"
                    value={form.pagoInicial}
                    onChange={handleChange}
                    className="input-control"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                {form.formaPago === "CREDITO" && (
                  <>
                    <div>
                      <label className="label-control">N° de Cuotas *</label>
                      <input
                        type="number"
                        name="cuotas"
                        value={form.cuotas}
                        onChange={handleChange}
                        className="input-control"
                        min={1}
                        required
                        placeholder="Ej: 3"
                      />
                    </div>
                    <div>
                      <label className="label-control">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        type="date"
                        name="fechaVencimiento"
                        value={form.fechaVencimiento}
                        onChange={handleChange}
                        className="input-control"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </fieldset>

            {/* DETALLE PRODUCTOS */}
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Detalle de Productos</legend>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                  gap: "0.5rem",
                  marginBottom: "0.375rem",
                }}
              >
                {[
                  "Producto",
                  "Cantidad",
                  "Precio Unit. (S/)",
                  "Subtotal",
                  "",
                ].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {form.detalles.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    alignItems: "start",
                  }}
                >
                  <div
                    className="product-dropdown-container"
                    data-index={i}
                    style={{ position: "relative" }}
                  >
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={prodBusqueda[i] || ""}
                      onFocus={() => handleProdFocus(i)}
                      onChange={(e) =>
                        handleProdBusquedaChange(i, e.target.value)
                      }
                      className="input-control"
                      required={!d.idProducto}
                    />
                    {activeDropdownIndex === i && (
                      <div
                        className="autocomplete-dropdown"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          background: "#fff",
                          border: "1px solid var(--border-color)",
                          maxHeight: "200px",
                          overflowY: "auto",
                          borderRadius: "6px",
                          marginTop: "4px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      >
                        {productosDB
                          .filter((p) => {
                            const nombre = (p.nombre || "").toLowerCase();
                            const codigo = (p.codigo || "").toLowerCase();
                            const query = (prodBusqueda[i] || "").toLowerCase();
                            return (
                              nombre.includes(query) || codigo.includes(query)
                            );
                          })
                          .map((p) => (
                            <div
                              key={p.id}
                              onClick={() => seleccionarProducto(i, p)}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f1f5f9",
                                fontSize: "13px",
                                textAlign: "left",
                              }}
                              className="autocomplete-item"
                            >
                              <strong>{p.nombre}</strong>
                              {p.codigo && (
                                <span
                                  style={{
                                    color: "var(--text-muted)",
                                    fontSize: "11px",
                                    marginLeft: "6px",
                                  }}
                                >
                                  ({p.codigo})
                                </span>
                              )}
                              {p.costo !== null && p.costo !== undefined && (
                                <span
                                  style={{
                                    color: "var(--text-muted)",
                                    fontSize: "11px",
                                    marginLeft: "6px",
                                  }}
                                >
                                  - Costo: S/ {Number(p.costo).toFixed(2)}
                                </span>
                              )}
                              <div
                                style={{
                                  color: "var(--text-muted)",
                                  fontSize: "11px",
                                  marginTop: "2px",
                                }}
                              >
                                Compra: {p.unidadCompraNombre || "---"} &rarr;
                                Inventario: {p.factorConversion || 1}{" "}
                                {p.unidadVentaNombre || "---"}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    {(() => {
                      const prodObj = productosDB.find(
                        (p) => String(p.id) === String(d.idProducto),
                      );
                      return prodObj ? (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#475569",
                            marginTop: "4px",
                            lineHeight: "1.2",
                          }}
                        >
                          Unidad compra:{" "}
                          <strong>{prodObj.unidadCompraNombre || "---"}</strong>{" "}
                          <br />
                          Se transforma a:{" "}
                          <strong>
                            {Number(d.cantidad || 0) *
                              (prodObj.factorConversion || 1)}{" "}
                            {prodObj.unidadVentaNombre || "unidades"}
                          </strong>{" "}
                          en inventario (factor x{prodObj.factorConversion || 1}
                          )
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <input
                    type="number"
                    name="cantidad"
                    value={d.cantidad}
                    onChange={(e) => handleDetalleChange(i, e)}
                    className="input-control"
                    min={1}
                    step="0.001"
                    required
                  />
                  <input
                    type="number"
                    name="precio"
                    value={d.precio}
                    onChange={(e) => handleDetalleChange(i, e)}
                    className="input-control"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      textAlign: "right",
                      fontSize: "0.875rem",
                    }}
                  >
                    S/ {(Number(d.cantidad) * Number(d.precio) || 0).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="btn-icon delete"
                    onClick={() => eliminarDetalle(i)}
                    disabled={form.detalles.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary"
                style={{
                  marginTop: "0.5rem",
                  padding: "6px 14px",
                  fontSize: "0.8125rem",
                }}
                onClick={agregarDetalle}
              >
                + Agregar producto
              </button>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "2px solid var(--border-color)",
                  fontWeight: 700,
                }}
              >
                <span>TOTAL:</span>
                <span>S/ {calcularTotal(form.detalles)}</span>
              </div>
            </fieldset>

            {/* OBSERVACIONES */}
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Observaciones</legend>
              <label className="label-control">Nota de Recepción</label>
              <textarea
                name="notaRecepcion"
                value={form.notaRecepcion}
                onChange={handleChange}
                className="input-control"
                rows={3}
                maxLength={255}
                placeholder="Observaciones sobre la recepción del pedido..."
              />
            </fieldset>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? "Registrando..." : "Registrar Compra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const fieldsetStyle = {
  border: "1px solid var(--border-color)",
  borderRadius: 8,
  padding: "1rem 1.125rem",
};
const legendStyle = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  padding: "0 0.375rem",
};
