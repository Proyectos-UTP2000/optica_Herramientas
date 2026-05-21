import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, ListTask, ArrowRepeat } from "react-bootstrap-icons";
import TablaProductos from "./productos/TablaProductos";
import ModalCrearProducto from "./productos/ModalCrearProducto";
import ModalEditarProducto from "./productos/ModalEditarProducto";
import ModalVerProducto from "./productos/ModalVerProducto";
import { Toast } from "../utils/alerts";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalVerAbierto, setModalVerAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const cargarProductos = async () => {
    setCargando(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("/api/v1/productos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(response.data || []);
    } catch (error) {
      console.error("Error en la petición:", error);
      Toast.fire({
        icon: "error",
        title: "No se pudieron obtener los productos de la óptica",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleAbrirEditar = (producto) => {
    setProductoAEditar(producto);
    setModalEditarAbierto(true);
  };

  const handleAbrirVer = (producto) => {
    setProductoSeleccionado(producto);
    setModalVerAbierto(true);
  };

  return (
    <div className="container-fluid" style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>
            <ListTask style={{ marginRight: "10px", verticalAlign: "middle" }} />
            Catálogo de Productos
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
            Administración de monturas, cristales, lentes de contacto y accesorios de la óptica.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-secondary"
            onClick={cargarProductos}
            disabled={cargando}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowRepeat className={cargando ? "spin-animation" : ""} />
            Actualizar
          </button>
          
          <button
            className="btn-primary"
            onClick={() => setModalCrearAbierto(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
        <TablaProductos 
          productos={productos} 
          cargando={cargando} 
          recargarTabla={cargarProductos} 
          onEditarProducto={handleAbrirEditar}
          onVerProducto={handleAbrirVer}
        />
      </div>

      {modalCrearAbierto && (
        <ModalCrearProducto
          cerrarModal={() => setModalCrearAbierto(false)}
          recargarTabla={cargarProductos}
        />
      )}

      {modalEditarAbierto && productoAEditar && (
        <ModalEditarProducto
          producto={productoAEditar}
          cerrarModal={() => {
            setModalEditarAbierto(false);
            setProductoAEditar(null);
          }}
          recargarTabla={cargarProductos}
        />
      )}

      {modalVerAbierto && productoSeleccionado && (
        <ModalVerProducto
          producto={productoSeleccionado}
          cerrarModal={() => {
            setModalVerAbierto(false);
            setProductoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};

export default Productos;