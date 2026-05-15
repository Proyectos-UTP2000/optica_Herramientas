const ToggleEstado = ({ activo, onChange }) => {
    return (
        <label className="toggle-switch" onClick={(e) => { e.stopPropagation(); onChange(); }}>
            <input type="checkbox" readOnly checked={activo} />
            <span className="toggle-track" />
            <span className="toggle-label">{activo ? "Activo" : "Inactivo"}</span>
        </label>
    );
};

export default ToggleEstado;