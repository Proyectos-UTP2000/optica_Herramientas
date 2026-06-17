const ModalVerMarca = ({ marca, cerrarModal }) => {
  if (!marca) return null;

  const badgeEstado = (estado) => {
    if (estado === 1) return <span className="badge badge-active">Activo</span>;
    if (estado === 2)
      return (
        <span
          className="badge badge-inactive"
          style={{ background: "#fef3c7", color: "#92400e" }}
        >
          En Desuso
        </span>
      );
    return <span className="badge badge-inactive">Inactivo</span>;
  };

  return (
    <div
      style={S.overlay}
      onClick={(e) => e.target === e.currentTarget && cerrarModal()}
    >
      <div style={S.modal}>
        <div style={S.header}>
          <h3 style={S.titulo}>Detalle de Marca</h3>
          <button style={S.btnX} onClick={cerrarModal}>
            ✕
          </button>
        </div>

        <div style={S.body}>
          <div style={S.fila}>
            <span style={S.etiqueta}>ID</span>
            <span style={S.valor}>{marca.id}</span>
          </div>
          <div style={S.fila}>
            <span style={S.etiqueta}>Nombre</span>
            <span style={S.valor}>{marca.nombre}</span>
          </div>
          <div style={S.fila}>
            <span style={S.etiqueta}>Productos relacionados</span>
            <span style={S.valor}>
              {marca.cantidadProductosRelacionados ?? 0} producto(s)
            </span>
          </div>
          <div style={S.fila}>
            <span style={S.etiqueta}>Estado</span>
            <span style={S.valor}>{badgeEstado(marca.estado)}</span>
          </div>
        </div>

        <div style={S.footer}>
          <button className="btn-primary" onClick={cerrarModal}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom: "1px solid #e2e8f0",
  },
  titulo: { margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  btnX: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#94a3b8",
  },
  body: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  fila: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid #f1f5f9",
  },
  etiqueta: { fontSize: "13px", color: "#64748b", fontWeight: "500" },
  valor: { fontSize: "13.5px", color: "#0f172a", fontWeight: "600" },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "14px 20px",
    borderTop: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
};

export default ModalVerMarca;
