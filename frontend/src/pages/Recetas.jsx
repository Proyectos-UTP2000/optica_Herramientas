import { useState, useEffect } from "react";
import axios from "axios";
import { EyeFill, PlusLg, ArrowLeft } from "react-bootstrap-icons";
import { Toast, mostrarAlerta } from "../utils/alerts";
import { getRecetasPorCliente, registrarReceta } from "../api/clinicaService";

const Recetas = () => {
  const [clientes, setClientes] = useState([]);
  const [empleadoActualId, setEmpleadoActualId] = useState(null);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState("");
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [verDetalle, setVerDetalle] = useState(null);
  const [creandoNueva, setCreandoNueva] = useState(false);

  // Form states
  const [odEsfera, setOdEsfera] = useState("");
  const [odCilindro, setOdCilindro] = useState("");
  const [odEje, setOdEje] = useState("");
  const [odAvLejos, setOdAvLejos] = useState("");
  const [odAvCerca, setOdAvCerca] = useState("");
  const [oiEsfera, setOiEsfera] = useState("");
  const [oiCilindro, setOiCilindro] = useState("");
  const [oiEje, setOiEje] = useState("");
  const [oiAvLejos, setOiAvLejos] = useState("");
  const [oiAvCerca, setOiAvCerca] = useState("");
  const [distanciaPupilar, setDistanciaPupilar] = useState("");
  const [adicion, setAdicion] = useState("");
  const [tipoLuna, setTipoLuna] = useState("Monofocal");
  const [materialSugerido, setMaterialSugerido] = useState("Policarbonato");
  const [tratamientos, setTratamientos] = useState({
    "Antireflex Básico": false,
    "Filtro Azul (Blue Defense)": false,
    "Fotocromático (Transition)": false,
    "Filtro UV 400": false,
    "Super Hidrofóbico": false,
    "Antirrayas (Hard Coat)": false,
  });
  const [observaciones, setObservaciones] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Load clients and current employee
  useEffect(() => {
    setLoadingClientes(true);
    axios
      .get("/api/v1/clientes", { headers })
      .then((res) => {
        const activos = (res.data || []).filter((c) => c.estado === 1);
        setClientes(activos);
      })
      .catch((err) => console.error("Error al cargar clientes", err))
      .finally(() => setLoadingClientes(false));

    // Get current employee
    axios
      .get("/api/v1/empleados", { headers })
      .then((res) => {
        const username = JSON.parse(atob(token.split(".")[1]))?.sub;
        const lista = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];
        const emp = lista.find(
          (e) =>
            e.username === username ||
            e.usuario === username ||
            e.correo === username ||
            e.email === username ||
            e.nombreUsuario === username,
        );
        if (emp) {
          setEmpleadoActualId(emp.id ?? emp.idEmpleado);
        }
      })
      .catch((err) => console.error("Error al obtener empleado", err));
  }, []);

  // Load prescriptions when client changes
  useEffect(() => {
    if (clienteSeleccionadoId) {
      setLoading(true);
      getRecetasPorCliente(clienteSeleccionadoId)
        .then((data) => {
          setRecetas(data);
          setVerDetalle(null);
          setCreandoNueva(false);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setRecetas([]);
      setVerDetalle(null);
      setCreandoNueva(false);
    }
  }, [clienteSeleccionadoId]);

  const handleTratamientoChange = (key) => {
    setTratamientos((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetForm = () => {
    setOdEsfera("");
    setOdCilindro("");
    setOdEje("");
    setOdAvLejos("");
    setOdAvCerca("");
    setOiEsfera("");
    setOiCilindro("");
    setOiEje("");
    setOiAvLejos("");
    setOiAvCerca("");
    setDistanciaPupilar("");
    setAdicion("");
    setTipoLuna("Monofocal");
    setMaterialSugerido("Policarbonato");
    setTratamientos({
      "Antireflex Básico": false,
      "Filtro Azul (Blue Defense)": false,
      "Fotocromático (Transition)": false,
      "Filtro UV 400": false,
      "Super Hidrofóbico": false,
      "Antirrayas (Hard Coat)": false,
    });
    setObservaciones("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteSeleccionadoId) {
      mostrarAlerta("Error", "Debe seleccionar un cliente.", "error");
      return;
    }
    if (!empleadoActualId) {
      mostrarAlerta(
        "Error",
        "No se pudo identificar al empleado actual.",
        "error",
      );
      return;
    }

    const tratamientosSeleccionados = Object.keys(tratamientos).filter(
      (key) => tratamientos[key],
    );

    const dto = {
      clienteId: Number(clienteSeleccionadoId),
      empleadoId: Number(empleadoActualId),
      odEsfera: odEsfera ? Number(odEsfera) : null,
      odCilindro: odCilindro ? Number(odCilindro) : null,
      odEje: odEje ? Number(odEje) : null,
      odAvLejos: odAvLejos || null,
      odAvCerca: odAvCerca || null,
      oiEsfera: oiEsfera ? Number(oiEsfera) : null,
      oiCilindro: oiCilindro ? Number(oiCilindro) : null,
      oiEje: oiEje ? Number(oiEje) : null,
      oiAvLejos: oiAvLejos || null,
      oiAvCerca: oiAvCerca || null,
      distanciaPupilar: distanciaPupilar ? Number(distanciaPupilar) : null,
      adicion: adicion ? Number(adicion) : null,
      tipoLuna,
      materialSugerido,
      tratamientos: tratamientosSeleccionados,
      observaciones,
    };

    try {
      await registrarReceta(dto);
      Toast.fire({ icon: "success", title: "Receta registrada con éxito" });
      resetForm();
      setCreandoNueva(false);
      // Reload prescriptions
      const data = await getRecetasPorCliente(clienteSeleccionadoId);
      setRecetas(data);
    } catch (err) {
      mostrarAlerta(
        "Error",
        err.response?.data?.message || "No se pudo registrar la receta.",
        "error",
      );
    }
  };

  const getNombreClienteCompleto = (c) => {
    if (c.nombreEmpresa) return c.nombreEmpresa;
    return `${c.nombre || ""} ${c.apellidoPaterno || ""} ${c.apellidoMaterno || ""}`.trim();
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "var(--text-main)", margin: 0 }}>
          Historial Clínico de Recetas
        </h2>
      </div>

      {/* Select Cliente */}
      <div
        className="form-grid"
        style={{
          marginBottom: "25px",
          background: "white",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
        }}
      >
        <div>
          <label className="label-control" style={{ fontWeight: "600" }}>
            Seleccionar Cliente (Paciente)
          </label>
          <select
            className="input-control"
            value={clienteSeleccionadoId}
            onChange={(e) => setClienteSeleccionadoId(e.target.value)}
            disabled={loadingClientes}
          >
            <option value="">-- Seleccionar Paciente --</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {getNombreClienteCompleto(c)} - {c.numeroDocumento}
              </option>
            ))}
          </select>
        </div>
      </div>

      {clienteSeleccionadoId ? (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}
        >
          {/* List and Details section */}
          {!creandoNueva && !verDetalle && (
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    color: "var(--text-main)",
                  }}
                >
                  Recetas Médicas Registradas
                </h3>
                <button
                  className="btn-primary"
                  onClick={() => setCreandoNueva(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                  }}
                >
                  <PlusLg /> Registrar Medida
                </button>
              </div>

              {loading ? (
                <p>Cargando historial...</p>
              ) : recetas.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <p>Este cliente no tiene recetas ópticas registradas.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
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
                          background: "#f8fafc",
                          borderBottom: "2px solid var(--border-color)",
                          fontWeight: "600",
                          textAlign: "left",
                        }}
                      >
                        <th style={{ padding: "10px" }}>Fecha Evaluación</th>
                        <th style={{ padding: "10px" }}>Optometrista</th>
                        <th style={{ padding: "10px" }}>OD (Esf/Cil/Eje)</th>
                        <th style={{ padding: "10px" }}>OI (Esf/Cil/Eje)</th>
                        <th style={{ padding: "10px" }}>Tipo Luna</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recetas.map((r) => (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <td style={{ padding: "10px" }}>
                            {new Date(r.fechaEvaluacion).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {r.empleadoNombre}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {r.odEsfera || "0.00"} / {r.odCilindro || "0.00"} /{" "}
                            {r.odEje || "0"}°
                          </td>
                          <td style={{ padding: "10px" }}>
                            {r.oiEsfera || "0.00"} / {r.oiCilindro || "0.00"} /{" "}
                            {r.oiEje || "0"}°
                          </td>
                          <td style={{ padding: "10px" }}>{r.tipoLuna}</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <button
                              className="btn-secondary"
                              onClick={() => setVerDetalle(r)}
                              style={{ padding: "4px 8px" }}
                            >
                              <EyeFill /> Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Form Create */}
          {creandoNueva && (
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <button
                  className="btn-secondary"
                  onClick={() => setCreandoNueva(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 12px",
                  }}
                >
                  <ArrowLeft /> Volver
                </button>
                <h3 style={{ margin: 0, fontSize: "16px" }}>
                  Registrar Nueva Medida Óptica
                </h3>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Table OD / OI */}
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#3b82f6",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "6px",
                    marginBottom: "12px",
                  }}
                >
                  REFRACCIÓN CLÍNICA
                </h4>
                <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                      minWidth: "600px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f8fafc",
                          borderBottom: "2px solid #e2e8f0",
                          textAlign: "left",
                        }}
                      >
                        <th style={{ padding: "8px" }}>OJO</th>
                        <th style={{ padding: "8px" }}>ESFERA (SPH)</th>
                        <th style={{ padding: "8px" }}>CILINDRO (CYL)</th>
                        <th style={{ padding: "8px" }}>EJE (AXIS)</th>
                        <th style={{ padding: "8px" }}>AV LEJOS</th>
                        <th style={{ padding: "8px" }}>AV CERCA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td
                          style={{
                            padding: "8px",
                            fontWeight: "600",
                            color: "#ef4444",
                          }}
                        >
                          OD (Derecho)
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="number"
                            step="0.25"
                            className="input-control"
                            placeholder="0.00"
                            value={odEsfera}
                            onChange={(e) => setOdEsfera(e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="number"
                            step="0.25"
                            className="input-control"
                            placeholder="0.00"
                            value={odCilindro}
                            onChange={(e) => setOdCilindro(e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="number"
                            step="1"
                            className="input-control"
                            placeholder="0"
                            value={odEje}
                            onChange={(e) => setOdEje(e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="20/20"
                            value={odAvLejos}
                            onChange={(e) => setOdAvLejos(e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="20/20"
                            value={odAvCerca}
                            onChange={(e) => setOdAvCerca(e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: "8px",
                            fontWeight: "600",
                            color: "#3b82f6",
                          }}
                        >
                          OI (Izquierdo)
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="number"
                            step="0.25"
                            className="input-control"
                            placeholder="0.00"
                            value={oiEsfera}
                            onChange={(e) => setOiEsfera(e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="number"
                            step="0.25"
                            className="input-control"
                            placeholder="0.00"
                            value={oiCilindro}
                            onChange={(e) => setOiCilindro(e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="number"
                            step="1"
                            className="input-control"
                            placeholder="0"
                            value={oiEje}
                            onChange={(e) => setOiEje(e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="20/20"
                            value={oiAvLejos}
                            onChange={(e) => setOiAvLejos(e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="20/20"
                            value={oiAvCerca}
                            onChange={(e) => setOiAvCerca(e.target.value)}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* DP & Adición */}
                <div className="form-grid" style={{ marginBottom: "20px" }}>
                  <div>
                    <label className="label-control">
                      Distancia Pupilar (DP)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="62 mm"
                      className="input-control"
                      value={distanciaPupilar}
                      onChange={(e) => setDistanciaPupilar(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-control">
                      Adición (Para Presbicia / Multifocales)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      placeholder="+1.75"
                      className="input-control"
                      value={adicion}
                      onChange={(e) => setAdicion(e.target.value)}
                    />
                  </div>
                </div>

                {/* Luna & Material */}
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#3b82f6",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "6px",
                    marginBottom: "12px",
                  }}
                >
                  SUGERENCIA COMERCIAL
                </h4>
                <div className="form-grid" style={{ marginBottom: "20px" }}>
                  <div>
                    <label className="label-control">
                      Tipo de Luna sugerida
                    </label>
                    <select
                      className="input-control"
                      value={tipoLuna}
                      onChange={(e) => setTipoLuna(e.target.value)}
                    >
                      <option value="Monofocal">Monofocal</option>
                      <option value="Bifocal">Bifocal</option>
                      <option value="Progresivo">Progresivo</option>
                      <option value="Ocupacional">Ocupacional</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-control">Material sugerido</label>
                    <select
                      className="input-control"
                      value={materialSugerido}
                      onChange={(e) => setMaterialSugerido(e.target.value)}
                    >
                      <option value="Resina Básica">
                        Resina Básica (1.56)
                      </option>
                      <option value="Policarbonato">
                        Policarbonato (1.59)
                      </option>
                      <option value="Resina Alto Índice">
                        Resina Alto Índice (1.67 / 1.74)
                      </option>
                      <option value="Cristal">Cristal</option>
                    </select>
                  </div>
                </div>

                {/* Tratamientos */}
                <div style={{ marginBottom: "20px" }}>
                  <label
                    className="label-control"
                    style={{ fontWeight: "600" }}
                  >
                    Tratamientos recomendados
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: "8px",
                      marginTop: "6px",
                    }}
                  >
                    {Object.keys(tratamientos).map((key) => (
                      <label
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={tratamientos[key]}
                          onChange={() => handleTratamientoChange(key)}
                          style={{ width: "16px", height: "16px" }}
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Observaciones */}
                <div style={{ marginBottom: "20px" }}>
                  <label className="label-control">
                    Observaciones Clínicas / Recomendaciones
                  </label>
                  <textarea
                    className="input-control"
                    style={{ height: "80px", fontSize: "13px" }}
                    placeholder="Paciente requiere lentes de uso permanente..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      resetForm();
                      setCreandoNueva(false);
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Guardar Receta
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Details View */}
          {verDetalle && (
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <button
                  className="btn-secondary"
                  onClick={() => setVerDetalle(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 12px",
                  }}
                >
                  <ArrowLeft /> Volver
                </button>
                <h3 style={{ margin: 0, fontSize: "16px" }}>
                  Detalle de Receta Médica -{" "}
                  {new Date(verDetalle.fechaEvaluacion).toLocaleDateString()}
                </h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  fontSize: "13.5px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "15px",
                    borderRadius: "6px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "14px",
                      color: "#ef4444",
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "4px",
                    }}
                  >
                    OJO DERECHO (OD)
                  </h4>
                  <p>
                    <strong>Esfera (SPH):</strong>{" "}
                    {verDetalle.odEsfera || "0.00"}
                  </p>
                  <p>
                    <strong>Cilindro (CYL):</strong>{" "}
                    {verDetalle.odCilindro || "0.00"}
                  </p>
                  <p>
                    <strong>Eje (AXIS):</strong> {verDetalle.odEje || "0"}°
                  </p>
                  <p>
                    <strong>AV Lejos:</strong> {verDetalle.odAvLejos || "N/A"}
                  </p>
                  <p>
                    <strong>AV Cerca:</strong> {verDetalle.odAvCerca || "N/A"}
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "15px",
                    borderRadius: "6px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "14px",
                      color: "#3b82f6",
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "4px",
                    }}
                  >
                    OJO IZQUIERDO (OI)
                  </h4>
                  <p>
                    <strong>Esfera (SPH):</strong>{" "}
                    {verDetalle.oiEsfera || "0.00"}
                  </p>
                  <p>
                    <strong>Cilindro (CYL):</strong>{" "}
                    {verDetalle.oiCilindro || "0.00"}
                  </p>
                  <p>
                    <strong>Eje (AXIS):</strong> {verDetalle.oiEje || "0"}°
                  </p>
                  <p>
                    <strong>AV Lejos:</strong> {verDetalle.oiAvLejos || "N/A"}
                  </p>
                  <p>
                    <strong>AV Cerca:</strong> {verDetalle.oiAvCerca || "N/A"}
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "15px",
                    borderRadius: "6px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "14px",
                      color: "var(--accent, #3b82f6)",
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "4px",
                    }}
                  >
                    RECOMENDACIONES GENERALES
                  </h4>
                  <p>
                    <strong>Distancia Pupilar (DP):</strong>{" "}
                    {verDetalle.distanciaPupilar
                      ? `${verDetalle.distanciaPupilar} mm`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Adición:</strong>{" "}
                    {verDetalle.adicion ? `+${verDetalle.adicion}` : "N/A"}
                  </p>
                  <p>
                    <strong>Tipo de Luna:</strong>{" "}
                    {verDetalle.tipoLuna || "N/A"}
                  </p>
                  <p>
                    <strong>Material sugerido:</strong>{" "}
                    {verDetalle.materialSugerido || "N/A"}
                  </p>
                  <p>
                    <strong>Tratamientos:</strong>{" "}
                    {verDetalle.tratamientos &&
                    verDetalle.tratamientos.length > 0
                      ? verDetalle.tratamientos.join(", ")
                      : "Ninguno"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #e2e8f0",
                  padding: "15px",
                  borderRadius: "6px",
                  marginTop: "15px",
                  fontSize: "13.5px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "14px",
                    color: "#64748b",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "4px",
                  }}
                >
                  OBSERVACIONES Y PERSONAL
                </h4>
                <p>
                  <strong>Optometrista a cargo:</strong>{" "}
                  {verDetalle.empleadoNombre}
                </p>
                <p>
                  <strong>Observaciones:</strong>{" "}
                  {verDetalle.observaciones || "Sin observaciones adicionales."}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          <p>
            Selecciona un paciente para ver su historial clínico o ingresar una
            receta médica.
          </p>
        </div>
      )}
    </div>
  );
};

export default Recetas;
