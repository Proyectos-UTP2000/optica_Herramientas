import { useState, useEffect } from "react";
import axios from "axios";
import { Toast } from "../utils/alerts";
import ModalEditarWeb from "./productos/ModalEditarWeb";
import {
  Globe,
  Search,
  ArrowRepeat,
  Star,
  StarFill,
  Eye,
  EyeSlash,
  PencilSquare,
  CheckCircle,
  ExclamationTriangle,
  Tags,
  PlusCircle,
  Trash,
  X,
  PencilFill,
} from "react-bootstrap-icons";

// ─── Modal gestión de etiquetas ───────────────────────────────────────────────
const ModalGestionEtiquetas = ({ onClose }) => {
  const [etiquetas, setEtiquetas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [nuevaNombre, setNuevaNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNombre, setEditandoNombre] = useState("");

  const token = () => localStorage.getItem("token");

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await axios.get("/api/v1/etiquetas", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setEtiquetas(res.data || []);
    } catch {
      Toast.fire({
        icon: "error",
        title: "No se pudieron cargar las etiquetas",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCrear = async () => {
    const nombre = nuevaNombre.trim();
    if (!nombre) return;
    if (nombre.length < 2) {
      Toast.fire({
        icon: "warning",
        title: "El nombre debe tener al menos 2 caracteres",
      });
      return;
    }
    if (nombre.length > 50) {
      Toast.fire({
        icon: "warning",
        title: "El nombre no debe superar los 50 caracteres",
      });
      return;
    }
    if (
      etiquetas.some((e) => e.nombre.toLowerCase() === nombre.toLowerCase())
    ) {
      Toast.fire({
        icon: "warning",
        title: "Ya existe una etiqueta con ese nombre",
      });
      return;
    }
    setGuardando(true);
    try {
      await axios.post(
        "/api/v1/etiquetas",
        { nombre },
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      setNuevaNombre("");
      Toast.fire({ icon: "success", title: "Etiqueta creada" });
      cargar();
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err.response?.data?.message || "Error al crear la etiqueta",
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (etiqueta) => {
    try {
      await axios.patch(
        `/api/v1/etiquetas/${etiqueta.id}/estado`,
        {},
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      Toast.fire({
        icon: "success",
        title:
          etiqueta.estado === 1 ? "Etiqueta desactivada" : "Etiqueta activada",
      });
      cargar();
    } catch {
      Toast.fire({ icon: "error", title: "No se pudo cambiar el estado" });
    }
  };

  const handleIniciarEditar = (e) => {
    setEditandoId(e.id);
    setEditandoNombre(e.nombre);
  };

  const handleGuardarEdicion = async (id) => {
    const nombre = editandoNombre.trim();
    if (!nombre || nombre.length < 2) {
      Toast.fire({
        icon: "warning",
        title: "El nombre debe tener al menos 2 caracteres",
      });
      return;
    }
    if (nombre.length > 50) {
      Toast.fire({
        icon: "warning",
        title: "El nombre no debe superar los 50 caracteres",
      });
      return;
    }
    try {
      await axios.put(
        `/api/v1/etiquetas/${id}`,
        { nombre },
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      setEditandoId(null);
      Toast.fire({ icon: "success", title: "Etiqueta actualizada" });
      cargar();
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err.response?.data?.message || "Error al actualizar",
      });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1060,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 20px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Tags size={20} style={{ color: "#3b82f6" }} />
            <span
              style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a" }}
            >
              Administrar Etiquetas B2C
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#64748b",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {/* Crear nueva etiqueta */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#475569",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Nueva etiqueta
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="input-control"
                placeholder="ej: Polarizados, Flexibles, UV400..."
                value={nuevaNombre}
                onChange={(e) => setNuevaNombre(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCrear()}
                maxLength={50}
                style={{ flex: 1 }}
              />
              <button
                className="btn-primary"
                onClick={handleCrear}
                disabled={guardando || !nuevaNombre.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                <PlusCircle size={14} />
                Agregar
              </button>
            </div>
            <span
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                marginTop: "4px",
                display: "block",
              }}
            >
              2–50 caracteres, nombre único. Presiona Enter o haz clic en
              Agregar.
            </span>
          </div>

          {/* Lista de etiquetas */}
          {cargando ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#64748b" }}
            >
              Cargando...
            </div>
          ) : etiquetas.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#94a3b8",
                fontStyle: "italic",
              }}
            >
              No hay etiquetas aún. Crea la primera.
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {etiquetas.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: e.estado === 1 ? "#f8fafc" : "#fef2f2",
                    opacity: e.estado !== 1 ? 0.75 : 1,
                  }}
                >
                  {editandoId === e.id ? (
                    <>
                      <input
                        type="text"
                        className="input-control"
                        value={editandoNombre}
                        onChange={(ev) => setEditandoNombre(ev.target.value)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") handleGuardarEdicion(e.id);
                          if (ev.key === "Escape") setEditandoId(null);
                        }}
                        maxLength={50}
                        style={{
                          flex: 1,
                          fontSize: "13px",
                          padding: "4px 8px",
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleGuardarEdicion(e.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#16a34a",
                        }}
                        title="Guardar"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#64748b",
                        }}
                        title="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        style={{
                          flex: 1,
                          fontSize: "13px",
                          fontWeight: "600",
                          color: e.estado === 1 ? "#1e293b" : "#ef4444",
                        }}
                      >
                        {e.nombre}
                        {e.estado !== 1 && (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "10px",
                              color: "#ef4444",
                              fontWeight: "400",
                            }}
                          >
                            (Inactiva)
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handleIniciarEditar(e)}
                        title="Editar nombre"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#3b82f6",
                        }}
                      >
                        <PencilFill size={13} />
                      </button>
                      <button
                        onClick={() => handleToggleEstado(e)}
                        title={e.estado === 1 ? "Desactivar" : "Activar"}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: e.estado === 1 ? "#ef4444" : "#16a34a",
                        }}
                      >
                        {e.estado === 1 ? (
                          <Trash size={14} />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e2e8f0",
            textAlign: "right",
          }}
        >
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Página principal Catálogo Web ────────────────────────────────────────────
const CatalogoWeb = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroVisibilidad, setFiltroVisibilidad] = useState("TODOS");
  const [filtroDestacado, setFiltroDestacado] = useState("TODOS");
  const [filtroRevision, setFiltroRevision] = useState("TODOS");

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [modalEtiquetasAbierto, setModalEtiquetasAbierto] = useState(false);

  const cargarProductos = async () => {
    setCargando(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("/api/v1/productos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(response.data || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      Toast.fire({
        icon: "error",
        title: "No se pudieron obtener los productos para el catálogo web",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const requiereRevision = (p) => {
    return (
      p.requiereRevisionCatalogo ||
      p.categoriaEstado === 2 ||
      p.marcaEstado === 2 ||
      p.categoriaNombre?.trim().toUpperCase() === "INDEFINIDO" ||
      p.marcaNombre?.trim().toUpperCase() === "INDEFINIDO"
    );
  };

  const handleToggleVisibilidad = async (p) => {
    const token = localStorage.getItem("token");
    const nuevoEstado = !p.visibleWeb;
    setProductos((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, visibleWeb: nuevoEstado } : item,
      ),
    );

    const productData = {
      nombre: p.nombre,
      codigo: p.codigo,
      modelo: p.modelo,
      descripcion: p.descripcion,
      precio: p.precio,
      costo: p.costo,
      stockMinimo: p.stockMinimo,
      tipoProducto: p.tipoProducto,
      idCategoria: p.idCategoria,
      idMarca: p.idMarca,
      idUnidadVenta: p.idUnidadVenta,
      idUnidadCompra: p.idUnidadCompra,
      factorConversion: p.factorConversion,
      visibleWeb: nuevoEstado,
      destacado: p.destacado,
      slug: p.slug,
      descripcionWeb: p.descripcionWeb,
      idEtiquetas: p.etiquetas ? p.etiquetas.map((e) => e.id) : [],
      orden: p.orden,
    };
    const formData = new FormData();
    formData.append(
      "producto",
      new Blob([JSON.stringify(productData)], { type: "application/json" }),
    );

    try {
      await axios.put(`/api/v1/productos/${p.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Toast.fire({
        icon: "success",
        title: nuevoEstado
          ? "Producto visible en la web"
          : "Producto ocultado de la web",
      });
      cargarProductos();
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: "error", title: "No se pudo cambiar la visibilidad" });
      setProductos((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, visibleWeb: !nuevoEstado } : item,
        ),
      );
    }
  };

  const handleToggleDestacado = async (p) => {
    const token = localStorage.getItem("token");
    const nuevoDestacado = !p.destacado;
    setProductos((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, destacado: nuevoDestacado } : item,
      ),
    );

    const productData = {
      nombre: p.nombre,
      codigo: p.codigo,
      modelo: p.modelo,
      descripcion: p.descripcion,
      precio: p.precio,
      costo: p.costo,
      stockMinimo: p.stockMinimo,
      tipoProducto: p.tipoProducto,
      idCategoria: p.idCategoria,
      idMarca: p.idMarca,
      idUnidadVenta: p.idUnidadVenta,
      idUnidadCompra: p.idUnidadCompra,
      factorConversion: p.factorConversion,
      visibleWeb: p.visibleWeb,
      destacado: nuevoDestacado,
      slug: p.slug,
      descripcionWeb: p.descripcionWeb,
      idEtiquetas: p.etiquetas ? p.etiquetas.map((e) => e.id) : [],
      orden: p.orden,
    };
    const formData = new FormData();
    formData.append(
      "producto",
      new Blob([JSON.stringify(productData)], { type: "application/json" }),
    );

    try {
      await axios.put(`/api/v1/productos/${p.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Toast.fire({
        icon: "success",
        title: nuevoDestacado
          ? "Producto marcado como Destacado"
          : "Producto desmarcado",
      });
      cargarProductos();
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: "No se pudo actualizar el destacado",
      });
      setProductos((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, destacado: !nuevoDestacado } : item,
        ),
      );
    }
  };

  const handleAbrirEditarWeb = (p) => {
    setProductoAEditar(p);
    setModalEditarAbierto(true);
  };

  const productosFiltrados = productos.filter((p) => {
    const matchesSearch =
      !busqueda ||
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marcaNombre?.toLowerCase().includes(busqueda.toLowerCase());

    const matchesVisibilidad =
      filtroVisibilidad === "TODOS" ||
      (filtroVisibilidad === "VISIBLES" && p.visibleWeb) ||
      (filtroVisibilidad === "OCULTOS" && !p.visibleWeb);

    const matchesDestacado =
      filtroDestacado === "TODOS" ||
      (filtroDestacado === "DESTACADOS" && p.destacado) ||
      (filtroDestacado === "NORMALES" && !p.destacado);

    const matchesRevision =
      filtroRevision === "TODOS" ||
      (filtroRevision === "CON_REVISION" && requiereRevision(p)) ||
      (filtroRevision === "SIN_REVISION" && !requiereRevision(p));

    return (
      matchesSearch && matchesVisibilidad && matchesDestacado && matchesRevision
    );
  });

  const totalVisibles = productos.filter((p) => p.visibleWeb).length;
  const totalDestacados = productos.filter((p) => p.destacado).length;
  const totalRevision = productos.filter(requiereRevision).length;

  return (
    <div className="container-fluid" style={{ padding: "10px 0" }}>
      {/* Header Panel */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 700,
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Globe size={24} style={{ color: "#3b82f6" }} />
            Panel de Catálogo Web (B2C)
          </h2>
          <p
            style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}
          >
            Configura y publica monturas, lunas y lentes de contacto hacia el
            sitio web público.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            className="btn-secondary"
            onClick={() => setModalEtiquetasAbierto(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Tags size={15} />
            Etiquetas
          </button>
          <button
            className="btn-secondary"
            onClick={cargarProductos}
            disabled={cargando}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowRepeat className={cargando ? "spin-animation" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "#fff",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              fontWeight: "600",
              opacity: 0.9,
            }}
          >
            Publicados en Web
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px" }}
          >
            {totalVisibles}
          </div>
          <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>
            Productos expuestos al público
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #eab308, #ca8a04)",
            color: "#fff",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              fontWeight: "600",
              opacity: 0.9,
            }}
          >
            Destacados (Web)
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px" }}
          >
            {totalDestacados}
          </div>
          <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>
            Destacados en portada
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #10b981, #047857)",
            color: "#fff",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              fontWeight: "600",
              opacity: 0.9,
            }}
          >
            Total Catálogo ERP
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px" }}
          >
            {productos.length}
          </div>
          <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>
            Productos registrados en base
          </div>
        </div>

        <div
          style={{
            background:
              totalRevision > 0
                ? "linear-gradient(135deg, #f43f5e, #be123c)"
                : "linear-gradient(135deg, #64748b, #475569)",
            color: "#fff",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              fontWeight: "600",
              opacity: 0.9,
            }}
          >
            Requiere Revisión
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px" }}
          >
            {totalRevision}
          </div>
          <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>
            Marcas/Categorías en desuso
          </div>
        </div>
      </div>

      {/* Filter and Control Area */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              className="input-control"
              placeholder="Buscar por nombre, SKU o marca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ paddingLeft: "36px", width: "100%" }}
            />
          </div>

          {/* Visibility Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Visibilidad
            </span>
            <select
              className="input-control"
              value={filtroVisibilidad}
              onChange={(e) => setFiltroVisibilidad(e.target.value)}
              style={{ minWidth: "150px" }}
            >
              <option value="TODOS">Todos</option>
              <option value="VISIBLES">Visibles en Web</option>
              <option value="OCULTOS">Ocultos en Web</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Destacado
            </span>
            <select
              className="input-control"
              value={filtroDestacado}
              onChange={(e) => setFiltroDestacado(e.target.value)}
              style={{ minWidth: "150px" }}
            >
              <option value="TODOS">Todos</option>
              <option value="DESTACADOS">Solo Destacados</option>
              <option value="NORMALES">Normales</option>
            </select>
          </div>

          {/* Review Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Revisión B2C
            </span>
            <select
              className="input-control"
              value={filtroRevision}
              onChange={(e) => setFiltroRevision(e.target.value)}
              style={{ minWidth: "160px" }}
            >
              <option value="TODOS">Todos</option>
              <option value="CON_REVISION">Con Alerta (Desuso)</option>
              <option value="SIN_REVISION">Sin Alerta</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  SKU
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  Producto
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  URL Slug
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    textAlign: "center",
                  }}
                >
                  Destacado
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    textAlign: "center",
                  }}
                >
                  Visible Web
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    textAlign: "center",
                  }}
                >
                  Orden
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  Etiquetas
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                    textAlign: "center",
                  }}
                >
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    {cargando
                      ? "Cargando productos..."
                      : "No se encontraron productos con los filtros seleccionados."}
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p) => {
                  const alerta = requiereRevision(p);
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        background: alerta ? "#fff8f8" : "transparent",
                        transition: "background 0.2s",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#64748b",
                        }}
                      >
                        {p.codigo}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: "#1e293b",
                          }}
                        >
                          {p.nombre}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            marginTop: "2px",
                          }}
                        >
                          {p.marcaNombre} · {p.categoriaNombre}
                        </div>
                        {alerta && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "10px",
                              color: "#e11d48",
                              fontWeight: "700",
                              marginTop: "4px",
                            }}
                          >
                            <ExclamationTriangle size={12} />
                            Revision: Marca/Categoría deshabilitada
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          color: "#334155",
                        }}
                      >
                        <code
                          style={{
                            background: "#f1f5f9",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}
                        >
                          {p.slug || "-"}
                        </code>
                      </td>

                      {/* Destacado Toggle */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleDestacado(p)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                          title={
                            p.destacado
                              ? "Quitar destacado"
                              : "Destacar producto"
                          }
                        >
                          {p.destacado ? (
                            <StarFill size={18} style={{ color: "#eab308" }} />
                          ) : (
                            <Star size={18} style={{ color: "#94a3b8" }} />
                          )}
                        </button>
                      </td>

                      {/* Visibilidad Toggle */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleVisibilidad(p)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                            color: p.visibleWeb ? "#10b981" : "#be123c",
                          }}
                          title={
                            p.visibleWeb
                              ? "Ocultar de la web"
                              : "Hacer visible en la web"
                          }
                        >
                          {p.visibleWeb ? (
                            <Eye size={20} />
                          ) : (
                            <EyeSlash size={20} />
                          )}
                        </button>
                      </td>

                      {/* Display Order */}
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "center",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#475569",
                        }}
                      >
                        {p.orden ?? 0}
                      </td>

                      {/* Tags */}
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            flexWrap: "wrap",
                          }}
                        >
                          {p.etiquetas && p.etiquetas.length > 0 ? (
                            p.etiquetas.map((t) => (
                              <span
                                key={t.id}
                                style={{
                                  fontSize: "10px",
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "600",
                                }}
                              >
                                {t.nombre}
                              </span>
                            ))
                          ) : (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                fontStyle: "italic",
                              }}
                            >
                              Sin etiquetas
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleAbrirEditarWeb(p)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 10px",
                            fontSize: "12px",
                          }}
                        >
                          <PencilSquare size={14} />
                          Editar Web
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalEditarAbierto && productoAEditar && (
        <ModalEditarWeb
          producto={productoAEditar}
          cerrarModal={() => {
            setModalEditarAbierto(false);
            setProductoAEditar(null);
          }}
          recargarTabla={cargarProductos}
        />
      )}

      {modalEtiquetasAbierto && (
        <ModalGestionEtiquetas
          onClose={() => setModalEtiquetasAbierto(false)}
        />
      )}
    </div>
  );
};

export default CatalogoWeb;
