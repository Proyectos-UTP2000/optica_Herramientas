import { BagFill, Trash3Fill, Whatsapp, XLg } from "react-bootstrap-icons";

const formatoMoneda = (valor) =>
  Number(valor || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });

const CartDrawer = ({
  isOpen,
  onClose,
  carrito,
  onUpdateQty,
  onRemove,
  isLoggedIn,
  enviandoCotizacion,
  tipoDestinatario,
  setTipoDestinatario,
  clienteNombre,
  setClienteNombre,
  clienteDocumento,
  setClienteDocumento,
  clienteTelefono,
  setClienteTelefono,
  clienteCorreo,
  setClienteCorreo,
  direccion,
  setDireccion,
  observaciones,
  setObservaciones,
  onSubmitCotizacion,
}) => {
  if (!isOpen) return null;

  const handleSelectDestinatario = (mode) => {
    if (mode === "mi" && !isLoggedIn) {
      window.dispatchEvent(new CustomEvent("open-login-modal"));
      return;
    }
    setTipoDestinatario(mode);
  };

  return (
    <div
      className="animate-fade"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-right"
        style={{
          width: "min(420px, 100vw)",
          height: "100%",
          backgroundColor: "#fff",
          boxShadow: "-15px 0 30px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#F8FAFC",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <BagFill style={{ color: "var(--color-primary)" }} /> Tu Solicitud
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <XLg size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {carrito.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--color-text-muted)",
                padding: "60px 0",
              }}
            >
              <span style={{ fontSize: "36px" }}>🛒</span>
              <p
                style={{
                  fontSize: "14px",
                  marginTop: "12px",
                  lineHeight: "1.5",
                }}
              >
                Tu solicitud de cotización está vacía. Añade algunas monturas
                del catálogo.
              </p>
            </div>
          ) : (
            <>
              {/* Product List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {carrito.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: "12px",
                      borderBottom: "1px solid var(--color-border)",
                      paddingBottom: "14px",
                    }}
                  >
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      style={{
                        width: "65px",
                        height: "65px",
                        objectFit: "contain",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--border-radius-sm)",
                        backgroundColor: "#F8FAFC",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "13.5px",
                          color: "var(--color-text-main)",
                        }}
                      >
                        {item.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--color-text-muted)",
                          margin: "2px 0 4px 0",
                        }}
                      >
                        Cod: {item.codigo}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "var(--color-primary)",
                        }}
                      >
                        {formatoMoneda(item.precio)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            border: "1px solid var(--color-border)",
                            width: "26px",
                            height: "26px",
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => onUpdateQty(item.id, -1)}
                        >
                          -
                        </button>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            width: "16px",
                            textAlign: "center",
                          }}
                        >
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          style={{
                            border: "1px solid var(--color-border)",
                            width: "26px",
                            height: "26px",
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => onUpdateQty(item.id, 1)}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          style={{
                            border: "none",
                            background: "none",
                            color: "#E53E3E",
                            marginLeft: "auto",
                            cursor: "pointer",
                            padding: "4px",
                          }}
                          title="Eliminar"
                        >
                          <Trash3Fill size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "800",
                  fontSize: "15px",
                  color: "var(--color-text-main)",
                }}
              >
                <span>Total Estimado:</span>
                <span style={{ color: "var(--color-primary)" }}>
                  {formatoMoneda(
                    carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
                  )}
                </span>
              </div>

              {/* Formulario de Cotización */}
              <form
                onSubmit={onSubmitCotizacion}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "16px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "12px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Datos del Destinatario
                </h4>

                {/* Toggle Mode */}
                <div
                  style={{
                    display: "flex",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--border-radius-sm)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectDestinatario("mi")}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor:
                        tipoDestinatario === "mi"
                          ? "var(--color-primary)"
                          : "#F8FAFC",
                      color:
                        tipoDestinatario === "mi"
                          ? "#fff"
                          : "var(--color-text-muted)",
                      transition: "var(--transition-smooth)",
                    }}
                  >
                    Para Mí
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDestinatario("otro")}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor:
                        tipoDestinatario === "otro"
                          ? "var(--color-primary)"
                          : "#F8FAFC",
                      color:
                        tipoDestinatario === "otro"
                          ? "#fff"
                          : "var(--color-text-muted)",
                      transition: "var(--transition-smooth)",
                    }}
                  >
                    Para Otra Persona
                  </button>
                </div>

                {!isLoggedIn && (
                  <div
                    style={{
                      padding: "10px",
                      backgroundColor: "#FFF2F0",
                      border: "1px solid rgba(255, 111, 97, 0.15)",
                      borderRadius: "var(--border-radius-sm)",
                      fontSize: "11px",
                      color: "#A54035",
                      lineHeight: "1.4",
                    }}
                  >
                    💡 Inicia sesión para autocompletar con tus datos y ver tu
                    historial.{" "}
                    <span
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("open-login-modal"),
                        )
                      }
                      style={{
                        textDecoration: "underline",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Iniciar Sesión
                    </span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Nombre Completo"
                  required
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="form-control"
                  disabled={tipoDestinatario === "mi" && isLoggedIn}
                />

                <input
                  type="text"
                  placeholder="Documento (DNI o RUC)"
                  value={clienteDocumento}
                  onChange={(e) => setClienteDocumento(e.target.value)}
                  className="form-control"
                  disabled={tipoDestinatario === "mi" && isLoggedIn}
                />

                <input
                  type="tel"
                  placeholder="Teléfono / Celular"
                  required
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  className="form-control"
                  disabled={tipoDestinatario === "mi" && isLoggedIn}
                />

                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={clienteCorreo}
                  onChange={(e) => setClienteCorreo(e.target.value)}
                  className="form-control"
                  disabled={tipoDestinatario === "mi" && isLoggedIn}
                />

                <input
                  type="text"
                  placeholder="Dirección de envío / entrega"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="form-control"
                  disabled={tipoDestinatario === "mi" && isLoggedIn}
                />

                <textarea
                  placeholder="Observaciones o indicaciones especiales de lunas..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="form-control"
                  style={{ resize: "none" }}
                />

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#25D366",
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#20BA5A")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#25D366")
                  }
                  disabled={enviandoCotizacion}
                >
                  <Whatsapp size={18} />
                  {enviandoCotizacion ? "Procesando..." : "Enviar a WhatsApp"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
