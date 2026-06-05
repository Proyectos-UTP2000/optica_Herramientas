import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { XCircleFill, Save2Fill } from "react-bootstrap-icons";
import { Toast } from "../../utils/alerts";

const ModalEditarProveedor = ({ show, onClose, proveedor, onRefresh }) => {
  const [errores, setErrores] = useState({});
  const [formulario, setFormulario] = useState({
    idTipoDocumento: "1",
    numeroDocumento: "",
    razonSocial: "",
    nombreComercial: "",
    direccion: "",
    telefono: "",
    correo: ""
  });

  useEffect(() => {
    if (proveedor) {
      setFormulario({
        idTipoDocumento: proveedor.idTipoDocumento?.toString() || "1",
        numeroDocumento: proveedor.numeroDocumento || "",
        razonSocial: proveedor.razonSocial || "",
        nombreComercial: proveedor.nombreComercial || "",
        direccion: proveedor.direccion || "",
        telefono: proveedor.telefono || "",
        correo: proveedor.correo || ""
      });
      setErrores({});
    }
  }, [proveedor]);

  if (!show) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nuevoValor = name === "numeroDocumento"
      ? value.replace(/\D/g, "").slice(0, 11)
      : name === "telefono"
      ? value.replace(/\D/g, "").slice(0, 30)
      : value;
    setFormulario({ ...formulario, [name]: nuevoValor });
    if (errores[name]) {
      setErrores({ ...errores, [name]: null });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.razonSocial.trim()) {
      nuevosErrores.razonSocial = "La razón social debe venir de la consulta RUC.";
    }
    if (!formulario.nombreComercial.trim()) {
      nuevosErrores.nombreComercial = "El nombre comercial debe venir de la consulta RUC.";
    }
    if (!formulario.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria.";
    }
    if (!formulario.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (formulario.telefono.trim().length < 6) {
      nuevosErrores.telefono = "El teléfono debe tener al menos 6 dígitos.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formulario,
        idTipoDocumento: parseInt(formulario.idTipoDocumento)
      };

      await api.put(`/api/v1/proveedores/${proveedor.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Toast.fire({ icon: "success", title: "Proveedor actualizado con éxito" });
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      Toast.fire({ icon: "error", title: "Error al actualizar proveedor" });
    }
  };

  const styles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, backdropFilter: "blur(4px)" },
    content: { backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "550px", padding: "25px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "20px" },
    formGroup: { marginBottom: "15px", display: "flex", flexDirection: "column", gap: "5px" },
    label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
    input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" },
    inputError: { borderColor: "#ef4444" },
    inputDisabled: { backgroundColor: "#f1f5f9", color: "#64748b", cursor: "not-allowed" },
    errorText: { color: "#dc2626", fontSize: "11px", fontWeight: "600" },
    footer: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "25px", borderTop: "1px solid #e2e8f0", paddingTop: "15px" }
  };

  const inputStyle = (campo, extra = {}) => ({
    ...styles.input,
    ...(errores[campo] ? styles.inputError : {}),
    ...extra
  });

  const disabledInputStyle = (campo) => inputStyle(campo, styles.inputDisabled);

  const msgError = (campo) => errores[campo] && (
    <span style={styles.errorText}>{errores[campo]}</span>
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>Editar Proveedor</h3>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }} onClick={onClose}>
            <XCircleFill size={20} />
          </button>
        </div>
        <form onSubmit={handleActualizar}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo de Documento</label>
              <select name="idTipoDocumento" style={styles.input} value={formulario.idTipoDocumento} onChange={handleInputChange}>
                <option value="1">RUC</option>
                <option value="2">DNI</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nro. Documento</label>
              <input type="text" name="numeroDocumento" style={styles.input} required value={formulario.numeroDocumento} onChange={handleInputChange} />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Razón Social</label>
            <input type="text" name="razonSocial" style={disabledInputStyle("razonSocial")} required value={formulario.razonSocial} disabled />
            {msgError("razonSocial")}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre Comercial</label>
            <input type="text" name="nombreComercial" style={disabledInputStyle("nombreComercial")} value={formulario.nombreComercial} disabled />
            {msgError("nombreComercial")}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Dirección</label>
            <input type="text" name="direccion" style={disabledInputStyle("direccion")} value={formulario.direccion} disabled />
            {msgError("direccion")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Teléfono</label>
              <input type="text" name="telefono" style={inputStyle("telefono")} value={formulario.telefono} onChange={handleInputChange} />
              {msgError("telefono")}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Correo Electrónico</label>
              <input type="email" name="correo" style={styles.input} value={formulario.correo} onChange={handleInputChange} />
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" style={{ backgroundColor: "#64748b", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" style={{ backgroundColor: "#10b981", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Save2Fill /> Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarProveedor;
