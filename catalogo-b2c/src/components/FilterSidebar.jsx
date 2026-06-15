import { Search, Filter, XLg } from "react-bootstrap-icons";

const FilterSidebar = ({
  busqueda,
  setBusqueda,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  categorias,
  marcaSeleccionada,
  setMarcaSeleccionada,
  marcas,
  soloDestacados,
  setSoloDestacados,
  etiquetas,
  etiquetasSeleccionadas,
  handleToggleEtiqueta,
  cleanFilters,
  isMobileDrawer = false,
  onCloseDrawer = null,
}) => {
  const content = (
    <>
      {/* Header (Solo Mobile) */}
      {isMobileDrawer && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
            Filtrar Catálogo
          </h3>
          <button
            onClick={onCloseDrawer}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <XLg size={16} />
          </button>
        </div>
      )}

      {/* Búsqueda */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "8px",
          }}
        >
          Búsqueda
        </label>
        <div style={{ position: "relative" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Código o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="form-control"
            style={{ paddingLeft: "36px" }}
          />
        </div>
      </div>

      {/* Categoría */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "8px",
          }}
        >
          Categoría
        </label>
        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          className="form-control"
          style={{ cursor: "pointer" }}
        >
          <option value="">Todas las Categorías</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Marca */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "8px",
          }}
        >
          Marca
        </label>
        <select
          value={marcaSeleccionada}
          onChange={(e) => setMarcaSeleccionada(e.target.value)}
          className="form-control"
          style={{ cursor: "pointer" }}
        >
          <option value="">Todas las Marcas</option>
          {marcas.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros Especiales */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "8px",
          }}
        >
          Opciones
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={soloDestacados}
              onChange={(e) => setSoloDestacados(e.target.checked)}
              style={{
                width: "16px",
                height: "16px",
                accentColor: "var(--color-primary)",
              }}
            />
            Solo destacados ⭐
          </label>
        </div>
      </div>

      {/* Etiquetas B2C */}
      {etiquetas && etiquetas.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "8px",
            }}
          >
            Filtros Rápidos
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {etiquetas.map((etiq) => (
              <label
                key={etiq.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={etiquetasSeleccionadas.includes(etiq.nombre)}
                  onChange={() => handleToggleEtiqueta(etiq.nombre)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "var(--color-primary)",
                  }}
                />
                {etiq.nombre}
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          cleanFilters();
          if (isMobileDrawer) onCloseDrawer();
        }}
        className="btn-outline"
        style={{ width: "100%", fontSize: "13px", padding: "8px 12px" }}
      >
        Limpiar Filtros
      </button>
    </>
  );

  if (isMobileDrawer) {
    return (
      <div
        className="animate-fade"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          zIndex: 900,
          display: "flex",
          justifyContent: "flex-end",
        }}
        onClick={onCloseDrawer}
      >
        <div
          className="animate-slide-right"
          style={{
            width: "300px",
            height: "100%",
            backgroundColor: "#fff",
            padding: "24px",
            boxShadow: "-10px 0 25px rgba(0,0,0,0.08)",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <aside
      style={{
        backgroundColor: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--border-radius-lg)",
        padding: "24px",
        height: "fit-content",
        boxShadow: "var(--shadow-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: "16px",
          fontWeight: "700",
          color: "var(--color-text-main)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "8px",
        }}
      >
        <Filter size={18} style={{ color: "var(--color-primary)" }} /> Filtros
      </h3>
      {content}
    </aside>
  );
};

export default FilterSidebar;
