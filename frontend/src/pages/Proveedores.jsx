import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { 
  PlusCircleFill, 
  PencilSquare, 
  Trash3Fill, 
  ToggleOn, 
  ToggleOff, 
  Search 
} from "react-bootstrap-icons";
import { Toast } from "../utils/alerts";
import ModalCrearProveedor from "./proveedor/ModalCrearProveedor";
import ModalEditarProveedor from "./proveedor/ModalEditarProveedor";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const cargarProveedores = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/v1/proveedores", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProveedores(response.data || []);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      Toast.fire({ icon: "error", title: "No se pudo cargar la lista" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const handleCambiarEstado = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/api/v1/proveedores/${id}/estado`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Toast.fire({ icon: "success", title: "Estado cambiado" });
      cargarProveedores();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Toast.fire({ icon: "error", title: "Error al cambiar estado" });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este proveedor?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/proveedores/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Toast.fire({ icon: "success", title: "Proveedor eliminado" });
      cargarProveedores();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      Toast.fire({ icon: "error", title: "No se pudo eliminar" });
    }
  };

  const abrirEditar = (prov) => {
    setProveedorSeleccionado(prov);
    setModalEditarAbierto(true);
  };

  const proveedoresFiltrados = proveedores.filter((prov) => {
    const termino = busqueda.toLowerCase();
    return (
      prov.razonSocial?.toLowerCase().includes(termino) ||
      prov.numeroDocumento?.includes(termino) ||
      prov.nombreComercial?.toLowerCase().includes(termino)
    );
  });

  const styles = {
    container: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "2px solid #e2e8f0", paddingBottom: "15px" },
    title: { fontSize: "26px", color: "#1e293b", margin: 0, fontWeight: "600" },
    btnNuevo: { backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
    searchBarContainer: { position: "relative", marginBottom: "20px", maxWidth: "400px" },
    searchInput: { width: "100%", padding: "10px 15px 10px 40px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" },
    searchIcon: { position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" },
    tableContainer: { backgroundColor: "#ffffff", borderRadius: "14px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" },
    th: { backgroundColor: "#f1f5f9", color: "#475569", padding: "15px 20px", fontWeight: "600", borderBottom: "2px solid #e2e8f0" },
    td: { padding: "15px 20px", borderBottom: "1px solid #e2e8f0", color: "#334155", verticalAlign: "middle" },
    badge: (estado) => ({ backgroundColor: estado === 1 ? "#d1e7dd" : "#f8d7da", color: estado === 1 ? "#0f5132" : "#842029", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }),
    actionsContainer: { display: "flex", gap: "10px" },
    btnAction: (bgColor) => ({ backgroundColor: bgColor, color: "#ffffff", border: "none", width: "34px", height: "34px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Gestión de Proveedores</h2>
        <button style={styles.btnNuevo} onClick={() => setModalCrearAbierto(true)}>
          <PlusCircleFill /> Nuevo Proveedor
        </button>
      </div>

      <div style={styles.searchBarContainer}>
        <Search style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar proveedor..."
          style={styles.searchInput}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cargando ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Cargando proveedores...</div>
      ) : proveedoresFiltrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No hay registros.</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Documento</th>
                <th style={styles.th}>Razón Social</th>
                <th style={styles.th}>Nombre Comercial</th>
                <th style={styles.th}>Contacto</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.map((prov) => (
                <tr key={prov.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "600" }}>{prov.numeroDocumento}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{prov.tipoDocumentoNombre}</div>
                  </td>
                  <td style={{ ...styles.td, fontWeight: "600" }}>{prov.razonSocial}</td>
                  <td style={styles.td}>{prov.nombreComercial || "---"}</td>
                  <td style={styles.td}>
                    <div>{prov.telefono || "---"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{prov.correo || "---"}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge(prov.estado)}>
                      {prov.estado === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionsContainer}>
                      <button style={styles.btnAction("#f59e0b")} onClick={() => abrirEditar(prov)}>
                        <PencilSquare />
                      </button>
                      <button
                        style={styles.btnAction(prov.estado === 1 ? "#10b981" : "#64748b")}
                        onClick={() => handleCambiarEstado(prov.id)}
                      >
                        {prov.estado === 1 ? <ToggleOn size={18} /> : <ToggleOff size={18} />}
                      </button>
                      <button style={styles.btnAction("#ef4444")} onClick={() => handleEliminar(prov.id)}>
                        <Trash3Fill />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalCrearProveedor 
        show={modalCrearAbierto} 
        onClose={() => setModalCrearAbierto(false)} 
        onRefresh={cargarProveedores} 
      />

      {modalEditarAbierto && (
        <ModalEditarProveedor 
          show={modalEditarAbierto} 
          onClose={() => setModalEditarAbierto(false)} 
          proveedor={proveedorSeleccionado}
          onRefresh={cargarProveedores} 
        />
      )}
    </div>
  );
};

export default Proveedores;
