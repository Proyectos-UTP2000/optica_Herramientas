import { useState, useEffect } from "react";
import axios from "axios";
import { Image, InfoCircle } from "react-bootstrap-icons";
import { Toast, mostrarAlerta } from "../../utils/alerts";
import {
  ModalShell,
  SeccionLabel,
  Divider,
} from "../../components/ui/ModalShell";

const ModalCrearProducto = ({ cerrarModal, recargarTabla }) => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [modelo, setModelo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [costo, setCosto] = useState("");
  const [stock, setStock] = useState("0");
  const [stockMinimo, setStockMinimo] = useState("1");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  const [tipoProducto, setTipoProducto] = useState("ARMAZON");
  const [idMarca, setIdMarca] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [idUnidadCompra, setIdUnidadCompra] = useState("");
  const [idUnidadVenta, setIdUnidadVenta] = useState("");
  const [factorConversion, setFactorConversion] = useState("1");

  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const [visibleWeb, setVisibleWeb] = useState(true);

  const hoyStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const cargarDatosSoporte = async () => {
      const tokenInicial = localStorage.getItem("token");
      try {
        const [resMarcas, resCategorias, resUnidades] = await Promise.all([
          axios.get("/api/v1/marcas", {
            headers: { Authorization: `Bearer ${tokenInicial}` },
          }),
          axios.get("/api/v1/categorias", {
            headers: { Authorization: `Bearer ${tokenInicial}` },
          }),
          axios.get("/api/v1/unidades", {
            headers: { Authorization: `Bearer ${tokenInicial}` },
          }),
        ]);
        setMarcas(resMarcas.data || []);
        setCategorias(resCategorias.data || []);
        setUnidades(resUnidades.data || []);
      } catch {
        Toast.fire({
          icon: "error",
          title: "Error al cargar las listas de soporte",
        });
      }
    };
    cargarDatosSoporte();
  }, []);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const inputError = (campo) =>
    `input-control ${errores[campo] ? "border-red-500" : ""}`;

  const msgError = (campo) =>
    errores[campo] && (
      <span
        style={{
          color: "var(--danger)",
          fontSize: "11px",
          display: "block",
          marginTop: "2px",
        }}
      >
        {errores[campo]}
      </span>
    );

  const mostrarErrorServidor = (e) => {
    const validations = e.response?.data?.validations;
    if (validations) {
      const erroresFormulario = { ...validations };
      if (validations.stockInicial && !erroresFormulario.stock) {
        erroresFormulario.stock = validations.stockInicial;
      }
      setErrores(erroresFormulario);
      return Object.values(validations)[0];
    }
    return e.response?.data?.message || "No se pudo crear el producto";
  };

  const validarFormulario = () => {
    const err = {};
    if (!nombre.trim()) err.nombre = "El nombre del producto es obligatorio";
    if (!descripcion.trim())
      err.descripcion = "La descripción del producto es obligatoria";
    if (!tipoProducto)
      err.tipoProducto = "Debe seleccionar el tipo de producto";
    if (!idMarca) err.idMarca = "Debe seleccionar una marca";
    if (!idCategoria) err.idCategoria = "Debe seleccionar una categoría";
    if (!idUnidadCompra) err.idUnidadCompra = "Seleccione una unidad de compra";
    if (!idUnidadVenta) err.idUnidadVenta = "Seleccione una unidad de venta";

    if (!factorConversion || parseFloat(factorConversion) <= 0)
      err.factorConversion = "El factor debe ser mayor a 0";
    if (precio === "" || parseFloat(precio) < 0)
      err.precio = "El precio no puede ser negativo";
    if (costo === "" || parseFloat(costo) < 0)
      err.costo = "El costo no puede ser negativo";
    if (parseInt(stock) < 0)
      err.stock = "El stock inicial no puede ser negativo";
    if (parseInt(stockMinimo) < 0)
      err.stockMinimo = "El stock mínimo no puede ser negativo";

    if (fechaVencimiento && fechaVencimiento < hoyStr) {
      err.fechaVencimiento =
        "La fecha de vencimiento no puede ser anterior a hoy";
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;
    setGuardando(true);

    const tokenActivo = localStorage.getItem("token");
    const formData = new FormData();

    const productoData = {
      nombre,
      codigo: codigo.trim() || null,
      modelo: modelo.trim() || null,
      descripcion,
      precio: parseFloat(precio) || 0,
      costo: parseFloat(costo) || 0,
      fechaVencimiento: fechaVencimiento || null,
      stock: parseInt(stock) || 0,
      stockMinimo: parseInt(stockMinimo) || 1,
      tipoProducto,
      idCategoria: parseInt(idCategoria),
      idMarca: parseInt(idMarca),
      idUnidadVenta: parseInt(idUnidadVenta),
      idUnidadCompra: parseInt(idUnidadCompra),
      factorConversion: parseInt(factorConversion) || 1,
      visibleWeb,
      destacado: false,
      slug: null,
      descripcionWeb: null,
      idEtiquetas: [],
      orden: 0,
    };

    formData.append(
      "producto",
      new Blob([JSON.stringify(productoData)], { type: "application/json" }),
    );

    if (imagenArchivo) {
      formData.append("imagenes", imagenArchivo);
    }

    try {
      await axios.post("/api/v1/productos", formData, {
        headers: {
          Authorization: `Bearer ${tokenActivo}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Toast.fire({ icon: "success", title: "Producto registrado con éxito" });
      recargarTabla();
      cerrarModal();
    } catch (e) {
      const msg = mostrarErrorServidor(e);
      mostrarAlerta("Error", msg, "error");
    } finally {
      setGuardando(false);
    }
  };

  const textoUnidadCompra =
    unidades.find((u) => u.id === parseInt(idUnidadCompra))?.nombre || "...";
  const textoUnidadVenta =
    unidades.find((u) => u.id === parseInt(idUnidadVenta))?.nombre || "...";

  return (
    <ModalShell
      titulo="Registrar Nuevo Producto"
      onClose={cerrarModal}
      footer={
        <>
          <button className="btn-secondary" onClick={cerrarModal}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Producto"}
          </button>
        </>
      }
    >
      <SeccionLabel text="Información Principal del Producto" />
      <div className="form-grid">
        <div style={{ gridColumn: "span 2" }}>
          <label className="label-control">Nombre Comercial</label>
          <input
            className={inputError("nombre")}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Lente Antireflex Premium"
          />
          {msgError("nombre")}
        </div>
        <div>
          <label className="label-control">Código SKU / Barras</label>
          <input
            className="input-control"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="label-control">Modelo / Serie</label>
          <input
            className="input-control"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            placeholder="Ej. Aviator Classic"
          />
        </div>
      </div>

      <div style={{ marginTop: "10px" }}>
        <label className="label-control">Descripción Detallada</label>
        <textarea
          className={inputError("descripcion")}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Especificaciones técnicas del producto..."
          rows="2"
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
          }}
        />
        {msgError("descripcion")}
      </div>

      <div className="form-grid" style={{ marginTop: "10px" }}>
        <div>
          <label className="label-control">Tipo de Producto</label>
          <select
            className={inputError("tipoProducto")}
            value={tipoProducto}
            onChange={(e) => setTipoProducto(e.target.value)}
          >
            <option value="ARMAZON">Armazón / Montura</option>
            <option value="CRISTAL">Cristal / Luna</option>
            <option value="LENTE_CONTACTO">Lente de Contacto</option>
            <option value="ACCESORIO">Accesorio</option>
            <option value="CUIDADO_VISUAL">Cuidado Visual</option>
          </select>
          {msgError("tipoProducto")}
        </div>
        <div>
          <label className="label-control">Categoría Asignada</label>
          <select
            className={inputError("idCategoria")}
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {msgError("idCategoria")}
        </div>
        <div>
          <label className="label-control">Marca Fabricante</label>
          <select
            className={inputError("idMarca")}
            value={idMarca}
            onChange={(e) => setIdMarca(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          {msgError("idMarca")}
        </div>
        <div>
          <label className="label-control">Fecha Vencimiento</label>
          <input
            type="date"
            className={inputError("fechaVencimiento")}
            min={hoyStr}
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
          />
          {msgError("fechaVencimiento")}
        </div>
      </div>

      <Divider />
      <SeccionLabel text="Costos, Precios e Inventario (S/.)" />
      <div className="form-grid">
        <div>
          <label className="label-control">Costo Compra Base</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputError("costo")}
            value={costo}
            onChange={(e) => {
              const valor = e.target.value;
              if (valor === "" || valor.endsWith(".")) {
                setCosto(valor);
              } else {
                setCosto(parseFloat(valor).toString());
              }
            }}
            placeholder="0.00"
          />
          {msgError("costo")}
        </div>
        <div>
          <label className="label-control">Precio Venta Público</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputError("precio")}
            value={precio}
            onChange={(e) => {
              const valor = e.target.value;
              if (valor === "" || valor.endsWith(".")) {
                setPrecio(valor);
              } else {
                setPrecio(parseFloat(valor).toString());
              }
            }}
            placeholder="0.00"
          />
          {msgError("precio")}
        </div>
        <div>
          <label className="label-control">Stock Inicial</label>
          <input
            type="number"
            min="0"
            className={inputError("stock")}
            value={stock}
            onChange={(e) => {
              const valor = e.target.value;
              setStock(valor === "" ? "" : parseInt(valor).toString());
            }}
          />
          {msgError("stock")}
        </div>
        <div>
          <label className="label-control">Stock Mínimo (Alerta)</label>
          <input
            type="number"
            min="0"
            className={inputError("stockMinimo")}
            value={stockMinimo}
            onChange={(e) => {
              const valor = e.target.value;
              setStockMinimo(valor === "" ? "" : parseInt(valor).toString());
            }}
          />
          {msgError("stockMinimo")}
        </div>
      </div>

      <Divider />
      <SeccionLabel text="Logística y Reglas de Conversión" />
      <div className="form-grid">
        <div>
          <label className="label-control">Unidad de Compra</label>
          <select
            className={inputError("idUnidadCompra")}
            value={idUnidadCompra}
            onChange={(e) => setIdUnidadCompra(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
          {msgError("idUnidadCompra")}
        </div>
        <div>
          <label className="label-control">Unidad de Venta</label>
          <select
            className={inputError("idUnidadVenta")}
            value={idUnidadVenta}
            onChange={(e) => setIdUnidadVenta(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
          {msgError("idUnidadVenta")}
        </div>
        <div>
          <label className="label-control">Factor de Conversión</label>
          <input
            type="number"
            min="1"
            className={inputError("factorConversion")}
            value={factorConversion}
            onChange={(e) => {
              const valor = e.target.value;
              setFactorConversion(
                valor === "" ? "" : parseInt(valor).toString(),
              );
            }}
          />
          {msgError("factorConversion")}
        </div>
      </div>

      {idUnidadCompra && idUnidadVenta && parseInt(factorConversion) > 0 && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "10px",
            borderRadius: "6px",
            color: "#1e40af",
            fontSize: "12px",
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <InfoCircle style={{ color: "#3b82f6", flexShrink: 0 }} size={15} />
          <span>
            Cada 1 "{textoUnidadCompra}" ingresada registrará automáticamente{" "}
            {factorConversion} "{textoUnidadVenta}" en el almacén.
          </span>
        </div>
      )}

      <Divider />
      <div style={{ marginTop: "15px", marginBottom: "15px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "13.5px",
            fontWeight: "600",
            color: "#1e293b",
          }}
        >
          <input
            type="checkbox"
            checked={visibleWeb}
            onChange={(e) => setVisibleWeb(e.target.checked)}
            style={{ width: "17px", height: "17px" }}
          />
          Visible en Web
        </label>
      </div>

      <Divider />
      <SeccionLabel text="Multimedia del Producto" />
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <div
          style={{
            width: "100px",
            height: "100px",
            border: "2px dashed #cbd5e1",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: "#f8fafc",
          }}
        >
          {imagenPreview ? (
            <img
              src={imagenPreview}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Image size={30} style={{ color: "#94a3b8" }} />
          )}
        </div>
        <div>
          <label className="label-control" style={{ marginBottom: "5px" }}>
            Fotografía del Producto
          </label>
          <input
            type="file"
            accept="image/*"
            className="input-control"
            onChange={handleImagenChange}
            style={{ padding: "5px" }}
          />
        </div>
      </div>
    </ModalShell>
  );
};

export default ModalCrearProducto;
