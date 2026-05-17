import { useEffect, useState } from "react";
import axios from "axios";
import { PlusLg, PencilSquare, Trash, CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import { Toast, confirmarAccion, mostrarAlerta } from "../../utils/alerts";
import ModalMantenedorSimple from "./ModalMantenedorSimple";

const TablaMantenedorSimple = ({ titulo, endpoint }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Controles de modal
  const [showModal, setShowModal] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const listarDatos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/${endpoint}`, { headers });
      setItems(res.data || []);
    } catch (err) {
      Toast.fire({ icon: "error", title: `Error al cargar ${titulo.toLowerCase()}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listarDatos();
  }, [endpoint]);

  const handleCambiarEstado = async (id, estadoActual) => {
    const accion = estadoActual === 1 ? "desactivar" : "activar";
    const confirmacion = await confirmarAccion(
      `¿Desea ${accion} este registro?`,
      "",
      `Sí, ${accion}`,
      "warning"
    );

    if (confirmacion.isConfirmed) {
      try {
        await axios.patch(`/api/v1/${endpoint}/cambiar-estado/${id}`, {}, { headers });
        Toast.fire({ icon: "success", title: "Estado actualizado" });
        listarDatos();
      } catch (err) {
        mostrarAlerta("Error", "No se pudo cambiar el estado", "error");
      }
    }
  };

  const handleEliminarLogico = async (id) => {
    const confirmacion = await confirmarAccion(
      "¿Eliminar de forma lógica?",
      "El registro cambiará su estado a eliminado.",
      "Sí, eliminar",
      "danger"
    );

    if (confirmacion.isConfirmed) {
      try {
        await axios.delete(`/api/v1/${endpoint}/${id}`, { headers });
        Toast.fire({ icon: "success", title: "Eliminado correctamente" });
        listarDatos();
      } catch (err) {
        mostrarAlerta("Error", "No se pudo eliminar", "error");
      }
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Administrar {titulo}</h3>
        <button className="btn-primary" onClick={() => { setItemSeleccionado(null); setShowModal(true); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "13px" }}>
          <PlusLg /> Agregar
        </button>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Cargando...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>No hay registros.</div>
        ) : (
          <table className="table" style={{ width: "100%", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td style={{ fontWeight: "600" }}>{item.nombre}</td>
                  <td>
                    <span 
                      onClick={() => handleCambiarEstado(item.id, item.estado)}
                      style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", color: item.estado === 1 ? "#16a34a" : "#dc2626" }}
                    >
                      {item.estado === 1 ? <CheckCircleFill /> : <XCircleFill />}
                      {item.estado === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <button className="btn-secondary" style={{ padding: "4px 8px" }} onClick={() => { setItemSeleccionado(item); setShowModal(true); }}>
                        <PencilSquare />
                      </button>
                      <button className="btn-secondary" style={{ padding: "4px 8px", color: "#ef4444" }} onClick={() => handleEliminarLogico(item.id)}>
                        <Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <ModalMantenedorSimple
          titulo={titulo}
          endpoint={endpoint}
          item={itemSeleccionado}
          cerrarModal={() => setShowModal(false)}
          recargar={listarDatos}
        />
      )}
    </div>
  );
};

export default TablaMantenedorSimple;