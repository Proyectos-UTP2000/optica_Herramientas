export const ModalShell = ({ titulo, onClose, children, footer }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3 style={{ margin: 0 }}>{titulo}</h3>
        <button className="btn-icon" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

export const SeccionLabel = ({ text }) => (
  <p
    style={{
      fontSize: "11px",
      fontWeight: "700",
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "10px",
    }}
  >
    {text}
  </p>
);

export const Divider = () => (
  <hr
    style={{
      border: "none",
      borderTop: "1px solid var(--border-color)",
      margin: "8px 0 14px",
    }}
  />
);
