import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Toast, mostrarAlerta } from "../utils/alerts";

const ConfiguracionMenu = () => {
  const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarOpciones = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/opciones");
      setOpciones(res.data);
    } catch (err) {
      console.error(err);
      mostrarAlerta("Error", "No se pudieron cargar las opciones del menú", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOpciones();
  }, []);

  const handleChange = (id, field, value) => {
    setOpciones((prev) =>
      prev.map((op) => (op.id === id ? { ...op, [field]: value } : op))
    );
  };

  const guardarCambios = async (opcion) => {
    try {
      const payload = {
        idPadre: opcion.idPadre || (opcion.padre ? opcion.padre.id : null),
        orden: opcion.orden,
      };

      // Si el usuario seleccionó un nuevo padre en el select, usamos ese
      // Si no, mantenemos el que ya tenía.
      // Pero espera, el select manejará 'idPadre' localmente en el estado.
      
      await api.put(`/api/v1/opciones/${opcion.id}/estructura`, {
        idPadre: opcion.idPadre !== undefined ? (opcion.idPadre === "" ? null : opcion.idPadre) : (opcion.padre ? opcion.padre.id : null),
        orden: opcion.orden
      });
      
      Toast.fire({ icon: "success", title: "Estructura actualizada" });
      cargarOpciones();
    } catch (err) {
      console.error(err);
      mostrarAlerta("Error", "No se pudo guardar el cambio", "error");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "var(--text-main)", margin: 0 }}>
          Configuración de Menú Jerárquico
        </h2>
      </div>

      <div
        style={{
          overflowX: "auto",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
          background: "white",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13.5px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "var(--bg-light)",
                textAlign: "left",
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              <th style={{ padding: "12px" }}>ID</th>
              <th style={{ padding: "12px" }}>Nombre</th>
              <th style={{ padding: "12px" }}>Ruta</th>
              <th style={{ padding: "12px" }}>Padre</th>
              <th style={{ padding: "12px" }}>Orden</th>
              <th style={{ padding: "12px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  Cargando...
                </td>
              </tr>
            ) : opciones.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No hay registros.
                </td>
              </tr>
            ) : (
              opciones.map((op) => (
                <tr key={op.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{op.id}</td>
                  <td style={{ padding: "12px", fontWeight: "500" }}>{op.nombre}</td>
                  <td style={{ padding: "12px", color: "var(--text-muted)" }}>{op.ruta}</td>
                  <td style={{ padding: "12px" }}>
                    <select
                      className="input-control"
                      style={{ padding: "4px 8px", fontSize: "13px" }}
                      value={op.idPadre !== undefined ? op.idPadre : (op.padre ? op.padre.id : "")}
                      onChange={(e) => handleChange(op.id, "idPadre", e.target.value)}
                    >
                      <option value="">(Sin Padre)</option>
                      {opciones
                        .filter((parent) => parent.id !== op.id)
                        .map((parent) => (
                          <option key={parent.id} value={parent.id}>
                            {parent.nombre}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <input
                      type="number"
                      className="input-control"
                      style={{ width: "70px", padding: "4px 8px", fontSize: "13px" }}
                      value={op.orden || 0}
                      onChange={(e) => handleChange(op.id, "orden", parseInt(e.target.value))}
                    />
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      className="btn-primary"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => guardarCambios(op)}
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfiguracionMenu;
