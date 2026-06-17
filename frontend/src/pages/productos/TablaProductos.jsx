import { useState, useEffect } from "react";
import axios from "axios";
import { PencilSquare, EyeFill, Trash3 } from "react-bootstrap-icons";
import { Toast, confirmarAccion } from "../../utils/alerts";

const TablaProductos = ({
  productos,
  cargando,
  recargarTabla,
  onEditarProducto,
  onVerProducto,
}) => {
  const [busqueda, setBusqueda] = useState("");

  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStock, setFiltroStock] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const filtrosActivosCount =
    (filtroCategoria ? 1 : 0) +
    (filtroMarca ? 1 : 0) +
    (filtroTipo ? 1 : 0) +
    (filtroStock ? 1 : 0) +
    (filtroEstado ? 1 : 0) +
    (precioMin ? 1 : 0) +
    (precioMax ? 1 : 0);

  const limpiarFiltros = () => {
    setFiltroCategoria("");
    setFiltroMarca("");
    setFiltroTipo("");
    setFiltroStock("");
    setFiltroEstado("");
    setPrecioMin("");
    setPrecioMax("");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get("/api/v1/categorias", { headers })
      .then((res) => setCategorias(res.data.filter((c) => c.estado === 1)))
      .catch((e) => console.error(e));
    axios
      .get("/api/v1/marcas", { headers })
      .then((res) => setMarcas(res.data.filter((m) => m.estado === 1)))
      .catch((e) => console.error(e));
  }, []);

  const handleCambiarEstado = async (id, nombre) => {
    const confirmacion = await confirmarAccion(
      "¿Cambiar estado?",
      `Se modificará la visibilidad del producto: ${nombre}`,
      "Sí, cambiar",
      "warning",
    );

    if (confirmacion.isConfirmed) {
      const token = localStorage.getItem("token");
      try {
        await axios.patch(
          `/api/v1/productos/${id}/estado`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        Toast.fire({
          icon: "success",
          title: "Estado actualizado correctamente",
        });
        recargarTabla();
      } catch {
        Toast.fire({ icon: "error", title: "No se pudo cambiar el estado" });
      }
    }
  };

  const handleEliminar = async (id, nombre) => {
    const confirmacion = await confirmarAccion(
      "¿Eliminar producto?",
      `¿Está seguro de eliminar "${nombre}"? Esta acción desactivará el producto del almacén.`,
      "Sí, eliminar",
      "warning",
    );

    if (confirmacion.isConfirmed) {
      const token = localStorage.getItem("token");
      try {
        await axios.delete(`/api/v1/productos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Toast.fire({
          icon: "success",
          title: "Producto eliminado correctamente",
        });
        recargarTabla();
      } catch (error) {
        Toast.fire({
          icon: "error",
          title:
            error.response?.data?.message || "No se pudo eliminar el producto",
        });
      }
    }
  };

  const requiereRevisionCatalogo = (p) =>
    p.requiereRevisionCatalogo ||
    p.categoriaEstado === 2 ||
    p.marcaEstado === 2 ||
    p.categoriaNombre?.trim().toUpperCase() === "INDEFINIDO" ||
    p.marcaNombre?.trim().toUpperCase() === "INDEFINIDO";

  const productosFiltrados = productos.filter((p) => {
    const matchesSearch =
      !busqueda ||
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marcaNombre?.toLowerCase().includes(busqueda.toLowerCase());

    const matchesCategoria =
      !filtroCategoria || String(p.idCategoria) === filtroCategoria;
    const matchesMarca = !filtroMarca || String(p.idMarca) === filtroMarca;
    const matchesTipo = !filtroTipo || p.tipoProducto === filtroTipo;
    const matchesEstado = !filtroEstado || String(p.estado) === filtroEstado;

    let matchesStock = true;
    if (filtroStock === "CON_STOCK") {
      matchesStock = p.stock > 0;
    } else if (filtroStock === "BAJO_STOCK") {
      matchesStock = p.stock <= p.stockMinimo && p.stock > 0;
    } else if (filtroStock === "SIN_STOCK") {
      matchesStock = p.stock === 0;
    }

    const matchesPrecioMin = !precioMin || p.precio >= parseFloat(precioMin);
    const matchesPrecioMax = !precioMax || p.precio <= parseFloat(precioMax);

    return (
      matchesSearch &&
      matchesCategoria &&
      matchesMarca &&
      matchesTipo &&
      matchesStock &&
      matchesEstado &&
      matchesPrecioMin &&
      matchesPrecioMax
    );
  });

  if (cargando) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Cargando catálogo...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          className="input-control"
          placeholder="Buscar por nombre, SKU o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: "360px", flex: 1 }}
        />
        <button
          className={`btn-secondary ${showFiltros ? "active" : ""}`}
          onClick={() => setShowFiltros(!showFiltros)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            height: "38px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {showFiltros ? "Ocultar Filtros" : "Filtros"}
          {filtrosActivosCount > 0 && (
            <span
              style={{
                background: "var(--primary-color, #3b82f6)",
                color: "white",
                borderRadius: "50%",
                padding: "1px 6px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              {filtrosActivosCount}
            </span>
          )}
        </button>
      </div>

      {showFiltros && (
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "15px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            alignItems: "end",
          }}
        >
          <div>
            <label className="label-control">Categoría</label>
            <select
              className="input-control"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-control">Marca</label>
            <select
              className="input-control"
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
            >
              <option value="">Todas</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-control">Tipo Producto</label>
            <select
              className="input-control"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="ARMAZON">Armazón</option>
              <option value="CRISTAL">Cristal</option>
              <option value="CONTACTO">Lente de Contacto</option>
              <option value="ACCESORIO">Accesorio</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>
          <div>
            <label className="label-control">Estado Stock</label>
            <select
              className="input-control"
              value={filtroStock}
              onChange={(e) => setFiltroStock(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="CON_STOCK">Con Stock</option>
              <option value="BAJO_STOCK">Bajo Stock Mínimo</option>
              <option value="SIN_STOCK">Sin Stock</option>
            </select>
          </div>
          <div>
            <label className="label-control">Visibilidad Web</label>
            <select
              className="input-control"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="1">Visibles</option>
              <option value="0">Ocultos</option>
            </select>
          </div>
          <div>
            <label className="label-control">Precio Mín (S/.)</label>
            <input
              type="number"
              className="input-control"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label-control">Precio Máx (S/.)</label>
            <input
              type="number"
              className="input-control"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              placeholder="999"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn-secondary"
              onClick={limpiarFiltros}
              style={{ width: "100%", height: "38px" }}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}

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
                borderBottom: "2px solid #edf2f7",
                textAlign: "left",
                color: "#475569",
              }}
            >
              <th style={{ padding: "12px 8px" }}>Código / SKU</th>
              <th style={{ padding: "12px 8px" }}>Producto</th>
              <th style={{ padding: "12px 8px" }}>Marca / Tipo</th>
              <th style={{ padding: "12px 8px" }}>
                Logística (Compra → Venta)
              </th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>
                Precio Venta
              </th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>
                Stock
              </th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>
                Estado
              </th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  No se encontraron productos registrados.
                </td>
              </tr>
            ) : (
              productosFiltrados.map((p) => {
                const revisarCatalogo = requiereRevisionCatalogo(p);
                return (
                  <tr
                    key={p.id}
                    className={revisarCatalogo ? "catalog-review-row" : ""}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      color: "#334155",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 8px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      {p.codigo || "S/N"}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>
                        {p.nombre}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {p.modelo || "Sin modelo"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          marginTop: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        {p.visibleWeb && (
                          <span
                            style={{
                              fontSize: "10px",
                              background: "#dcfce7",
                              color: "#166534",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontWeight: "700",
                            }}
                          >
                            Web
                          </span>
                        )}
                        {p.destacado && (
                          <span
                            style={{
                              fontSize: "10px",
                              background: "#fef9c3",
                              color: "#854d0e",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontWeight: "700",
                            }}
                          >
                            ★ Destacado
                          </span>
                        )}
                      </div>
                      {revisarCatalogo && (
                        <span
                          className="catalog-review-badge"
                          style={{ marginTop: "4px", display: "inline-block" }}
                        >
                          ⚠ Revisar catálogo
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <div>{p.marcaNombre || "Sin marca"}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        {p.categoriaNombre || "Sin categoría"} ·{" "}
                        {p.tipoProducto}
                      </div>
                      {(p.marcaEstado === 2 || p.categoriaEstado === 2) && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#92400e",
                            marginTop: "2px",
                            fontWeight: 700,
                          }}
                        >
                          Marca/Categoría En Desuso
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          background: "#f1f5f9",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        1 {p.unidadCompraNombre || "Caja"} ={" "}
                        {p.factorConversion} {p.unidadVentaNombre || "Und"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      S/. {p.precio?.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        fontWeight: 600,
                        color: p.stock <= p.stockMinimo ? "#ef4444" : "#10b981",
                      }}
                    >
                      {p.stock}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <label
                        className="toggle-switch"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCambiarEstado(p.id, p.nombre);
                        }}
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={p.estado === 1}
                        />
                        <span className="toggle-track" />
                        <span className="toggle-label">
                          {p.estado === 1 ? "Activo" : "Inactivo"}
                        </span>
                      </label>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="btn-icon view"
                          onClick={() => onVerProducto(p)}
                          title="Ver"
                        >
                          <EyeFill />
                        </button>

                        <button
                          className="btn-icon edit"
                          onClick={() => onEditarProducto(p)}
                          title="Editar"
                        >
                          <PencilSquare />
                        </button>

                        <button
                          className="btn-icon delete"
                          onClick={() => handleEliminar(p.id, p.nombre)}
                          title="Eliminar"
                        >
                          <Trash3 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaProductos;
