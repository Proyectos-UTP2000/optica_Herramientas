import { useEffect, useState } from "react";
import axios from "axios";
import { EyeFill, PencilSquare, Trash3 } from "react-bootstrap-icons";
import { Toast, confirmarAccion, mostrarAlerta } from "../utils/alerts";
import ModalCrearEmpleado from "./empleados/ModalCrearEmpleado";
import ModalEditarEmpleado from "./empleados/ModalEditarEmpleado";
import ModalVerEmpleado from "./empleados/ModalVerEmpleado";
import ToggleEstado from "../components/ui/ToggleEstado";

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalVer, setShowModalVer] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const cargarEmpleados = () => {
    setLoading(true);
    axios
      .get("/api/v1/empleados", { headers })
      .then((res) => setEmpleados(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarEmpleados();
    axios
      .get("/api/v1/perfiles", { headers })
      .then((res) => setPerfiles(res.data.filter((p) => p.estado === 1)))
      .catch((err) => console.error(err));
  }, []);

  const cambiarEstado = async (id) => {
    const confirmacion = await confirmarAccion(
      "¿Cambiar estado?",
      "El empleado cambiará su nivel de acceso al sistema.",
      "Sí, cambiar",
      "info",
    );
    if (confirmacion.isConfirmed) {
      try {
        await axios.patch(`/api/v1/empleados/${id}/estado`, {}, { headers });
        cargarEmpleados();
        Toast.fire({ icon: "success", title: "Estado modificado" });
      } catch (e) {
        mostrarAlerta(
          "Error",
          e.response?.data?.message || "No se pudo cambiar el estado",
          "error",
        );
      }
    }
  };

  const eliminar = async (id) => {
    const confirmacion = await confirmarAccion(
      "¿Eliminar empleado?",
      "Esta acción desactivará al empleado y no podrá ingresar al sistema.",
      "Sí, eliminar",
      "warning",
    );
    if (confirmacion.isConfirmed) {
      try {
        await axios.delete(`/api/v1/empleados/${id}`, { headers });
        cargarEmpleados();
        Toast.fire({
          icon: "success",
          title: "Empleado eliminado del sistema",
        });
      } catch (e) {
        mostrarAlerta(
          "Acción denegada",
          e.response?.data?.message || "Hubo un error al eliminar",
          "error",
        );
      }
    }
  };

  const abrirEditar = (emp) => {
    setEmpleadoSeleccionado(emp);
    setShowModalEditar(true);
  };

  const abrirVer = (emp) => {
    setEmpleadoSeleccionado(emp);
    setShowModalVer(true);
  };

  const filtrados = empleados.filter(
    (e) =>
      e.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.dni?.includes(busqueda),
  );
  const totalPaginas = Math.ceil(filtrados.length / registrosPorPagina);
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const paginados = filtrados.slice(inicio, inicio + registrosPorPagina);

  return (
    <div>
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "var(--text-main)", margin: 0 }}>
          Lista de Empleados
        </h2>
        <button className="btn-primary" onClick={() => setShowModalCrear(true)}>
          + Nuevo Empleado
        </button>
      </div>

      {/* Controles */}
      <div className="form-grid" style={{ marginBottom: "15px" }}>
        <div>
          <label className="label-control">Mostrar registros</label>
          <select
            className="input-control"
            value={registrosPorPagina}
            onChange={(e) => {
              setRegistrosPorPagina(Number(e.target.value));
              setPaginaActual(1);
            }}
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-control">Buscar</label>
          <input
            className="input-control"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Nombre o DNI..."
          />
        </div>
      </div>

      {/* Tabla */}
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
              <th style={{ padding: "12px" }}>Nombre Completo</th>
              <th style={{ padding: "12px" }}>Usuario</th>
              <th style={{ padding: "12px" }}>Perfil</th>
              <th style={{ padding: "12px" }}>DNI</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Cargando...
                </td>
              </tr>
            ) : paginados.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No hay registros.
                </td>
              </tr>
            ) : (
              paginados.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{e.id}</td>
                  <td style={{ padding: "12px", fontWeight: "500" }}>
                    {e.nombres} {e.apellidos}
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-muted)" }}>
                    {e.username}
                  </td>
                  <td style={{ padding: "12px" }}>{e.perfilNombre}</td>
                  <td style={{ padding: "12px" }}>{e.dni}</td>
                  <td style={{ padding: "12px" }}>
                    <label
                      className="toggle-switch"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        cambiarEstado(e.id);
                      }}
                    >
                      <input type="checkbox" readOnly checked={e.estado === 1} />
                      <span className="toggle-track" />
                      <span className="toggle-label">
                        {e.estado === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </td>
                  <td style={{ padding: "12px", display: "flex", gap: "5px" }}>
                    <button
                      className="btn-icon view"
                      onClick={() => abrirVer(e)}
                      title="Ver"
                    >
                      <EyeFill />
                    </button>
                    <button
                      className="btn-icon edit"
                      onClick={() => abrirEditar(e)}
                      title="Editar"
                    >
                      <PencilSquare />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => eliminar(e.id)}
                      title="Eliminar"
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

      {/* Paginación */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "15px",
          fontSize: "13px",
          color: "var(--text-muted)",
        }}
      >
        <span>
          Mostrando del {inicio + 1} al{" "}
          {Math.min(inicio + registrosPorPagina, filtrados.length)} de{" "}
          {filtrados.length}
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            className="btn-secondary"
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              setPaginaActual((p) => Math.min(p + 1, totalPaginas))
            }
            disabled={paginaActual >= totalPaginas}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* ════════ LLAMADA A MODALES ════════ */}
      {showModalCrear && (
        <ModalCrearEmpleado
          cerrarModal={() => setShowModalCrear(false)}
          recargarTabla={cargarEmpleados}
          perfiles={perfiles}
        />
      )}

      {showModalEditar && (
        <ModalEditarEmpleado
          empleado={empleadoSeleccionado}
          cerrarModal={() => setShowModalEditar(false)}
          recargarTabla={cargarEmpleados}
          perfiles={perfiles}
        />
      )}

      {showModalVer && (
        <ModalVerEmpleado
          empleado={empleadoSeleccionado}
          cerrarModal={() => setShowModalVer(false)}
        />
      )}
    </div>
  );
};

export default Empleados;
