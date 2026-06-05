import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { Toast, mostrarAlerta } from "../utils/alerts";
import { iconMap } from "../utils/iconUtils";

const normalizarTexto = (valor) => (valor || "").toString().toLowerCase();

const normalizarIdPadre = (opcion) => {
  const idPadre = opcion.idPadre !== undefined
    ? opcion.idPadre
    : opcion.padre?.id;

  if (idPadre === null || idPadre === undefined || idPadre === "") {
    return null;
  }

  return Number(idPadre);
};

const ConfiguracionMenu = () => {
  const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [opcionSeleccionadaId, setOpcionSeleccionadaId] = useState(null);

  const cargarOpciones = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/opciones");
      const ordenadas = [...res.data].sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setOpciones(ordenadas);
      setOpcionSeleccionadaId((actual) => actual || ordenadas[0]?.id || null);
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

  const opcionesPorId = useMemo(
    () => new Map(opciones.map((opcion) => [opcion.id, opcion])),
    [opciones],
  );

  const opcionesFiltradas = useMemo(() => {
    const texto = normalizarTexto(busqueda.trim());
    if (!texto) return opciones;

    return opciones.filter((opcion) => {
      const padre = opcionesPorId.get(opcion.idPadre);
      return [opcion.nombre, opcion.ruta, opcion.icono, padre?.nombre]
        .some((valor) => normalizarTexto(valor).includes(texto));
    });
  }, [busqueda, opciones, opcionesPorId]);

  const padresVisibles = useMemo(() => {
    const idsFiltrados = new Set(opcionesFiltradas.map((opcion) => opcion.id));
    const idsPadreConHijos = new Set(
      opcionesFiltradas
        .filter((opcion) => opcion.idPadre)
        .map((opcion) => opcion.idPadre),
    );

    return opciones
      .filter((opcion) => !opcion.idPadre && (idsFiltrados.has(opcion.id) || idsPadreConHijos.has(opcion.id)))
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  }, [opciones, opcionesFiltradas]);

  const hijosPorPadre = useMemo(() => {
    const idsFiltrados = new Set(opcionesFiltradas.map((opcion) => opcion.id));
    return opciones.reduce((acc, opcion) => {
      if (!opcion.idPadre || !idsFiltrados.has(opcion.id)) return acc;
      const lista = acc.get(opcion.idPadre) || [];
      lista.push(opcion);
      acc.set(opcion.idPadre, lista.sort((a, b) => (a.orden || 0) - (b.orden || 0)));
      return acc;
    }, new Map());
  }, [opciones, opcionesFiltradas]);

  const opcionSeleccionada = opciones.find((opcion) => opcion.id === opcionSeleccionadaId);

  useEffect(() => {
    if (!opciones.length || loading) return;
    if (opcionSeleccionadaId && opcionesFiltradas.some((opcion) => opcion.id === opcionSeleccionadaId)) return;
    setOpcionSeleccionadaId(opcionesFiltradas[0]?.id || opciones[0]?.id || null);
  }, [loading, opciones, opcionesFiltradas, opcionSeleccionadaId]);

  const handleChange = (id, field, value) => {
    setOpciones((prev) =>
      prev.map((op) => (op.id === id ? { ...op, [field]: value } : op)),
    );
  };

  const guardarCambios = async (opcion) => {
    try {
      await api.put(`/api/v1/opciones/${opcion.id}/estructura`, {
        nombre: opcion.nombre,
        ruta: opcion.ruta,
        idPadre: normalizarIdPadre(opcion),
        orden: Number(opcion.orden) || 0,
        icono: opcion.icono,
      });

      Toast.fire({ icon: "success", title: "Estructura actualizada" });
      cargarOpciones();
    } catch (err) {
      console.error(err);
      const mensaje = err.response?.data?.message
        || err.response?.data?.validations?.idPadre
        || "No se pudo guardar el cambio";
      mostrarAlerta("Error", mensaje, "error");
    }
  };

  const renderIcono = (icono) => iconMap[icono] || iconMap.IconDashboard;

  return (
    <div className="page-container menu-config-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración Menú</h1>
          <p className="page-subtitle">
            Ordena secciones, rutas e iconos desde un árbol navegable.
          </p>
        </div>
      </div>

      <div className="menu-config-layout">
        <aside className="menu-config-tree">
          <div className="menu-config-search">
            <label className="form-label" htmlFor="buscar-menu">Buscar opción</label>
            <input
              id="buscar-menu"
              className="input-control"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Nombre, ruta o icono"
            />
          </div>

          <div className="menu-tree-list">
            {loading ? (
              <div className="page-loading">Cargando menú...</div>
            ) : padresVisibles.length === 0 ? (
              <div className="table-empty">No se encontraron opciones.</div>
            ) : (
              padresVisibles.map((padre) => {
                const hijos = hijosPorPadre.get(padre.id) || [];
                const activo = padre.id === opcionSeleccionadaId;
                return (
                  <div className="menu-tree-group" key={padre.id}>
                    <button
                      type="button"
                      className={`menu-tree-item menu-tree-parent ${activo ? "active" : ""}`}
                      onClick={() => setOpcionSeleccionadaId(padre.id)}
                    >
                      <span className="menu-tree-icon">{renderIcono(padre.icono)}</span>
                      <span>
                        <strong>{padre.nombre}</strong>
                        <small>{padre.ruta || "Sin ruta"}</small>
                      </span>
                    </button>
                    {hijos.map((hijo) => (
                      <button
                        type="button"
                        key={hijo.id}
                        className={`menu-tree-item menu-tree-child ${hijo.id === opcionSeleccionadaId ? "active" : ""}`}
                        onClick={() => setOpcionSeleccionadaId(hijo.id)}
                      >
                        <span className="menu-tree-connector" />
                        <span>
                          <strong>{hijo.nombre}</strong>
                          <small>{hijo.ruta || "Sin ruta"}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <section className="menu-config-editor">
          {!opcionSeleccionada ? (
            <div className="table-empty">Selecciona una opción para editar.</div>
          ) : (
            <>
              <div className="menu-editor-header">
                <div className="menu-editor-preview">
                  {renderIcono(opcionSeleccionada.icono)}
                </div>
                <div>
                  <span className="placeholder-kicker">Opción seleccionada</span>
                  <h2>{opcionSeleccionada.nombre}</h2>
                  <p>{opcionSeleccionada.ruta || "Sin ruta asignada"}</p>
                </div>
              </div>

              <div className="form-grid">
                <div>
                  <label className="form-label" htmlFor="nombre-menu">Nombre</label>
                  <input
                    id="nombre-menu"
                    className="input-control"
                    value={opcionSeleccionada.nombre || ""}
                    onChange={(event) => handleChange(opcionSeleccionada.id, "nombre", event.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="ruta-menu">Ruta</label>
                  <input
                    id="ruta-menu"
                    className="input-control"
                    value={opcionSeleccionada.ruta || ""}
                    onChange={(event) => handleChange(opcionSeleccionada.id, "ruta", event.target.value)}
                    placeholder="/ruta"
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="padre-menu">Sección padre</label>
                  <select
                    id="padre-menu"
                    className="input-control"
                    value={opcionSeleccionada.idPadre ?? ""}
                    onChange={(event) => handleChange(opcionSeleccionada.id, "idPadre", event.target.value)}
                  >
                    <option value="">Sin padre</option>
                    {opciones
                      .filter((parent) => parent.id !== opcionSeleccionada.id)
                      .map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.nombre}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="orden-menu">Orden</label>
                  <input
                    id="orden-menu"
                    type="number"
                    className="input-control"
                    value={opcionSeleccionada.orden ?? 0}
                    onChange={(event) => handleChange(opcionSeleccionada.id, "orden", event.target.value)}
                  />
                </div>
              </div>

              <div className="menu-icon-section">
                <div className="menu-icon-section-header">
                  <div>
                    <label className="form-label" htmlFor="icono-menu">Icono</label>
                    <input
                      id="icono-menu"
                      className="input-control"
                      value={opcionSeleccionada.icono || ""}
                      onChange={(event) => handleChange(opcionSeleccionada.id, "icono", event.target.value)}
                      placeholder="IconDashboard"
                    />
                  </div>
                </div>
                <div className="menu-icon-grid">
                  {Object.keys(iconMap).map((key) => (
                    <button
                      type="button"
                      key={key}
                      className={`menu-icon-option ${opcionSeleccionada.icono === key ? "active" : ""}`}
                      onClick={() => handleChange(opcionSeleccionada.id, "icono", key)}
                    >
                      {iconMap[key]}
                      <span>{key}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="menu-editor-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => guardarCambios(opcionSeleccionada)}
                >
                  Guardar cambios
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ConfiguracionMenu;
