import React, { useState } from "react";
import api from "../../api/axiosConfig";
import { Search, XCircleFill, Save2Fill } from "react-bootstrap-icons";
import { Toast } from "../../utils/alerts";

const ModalCrearProveedor = ({ show, onClose, onRefresh }) => {
  const [consultandoRuc, setConsultandoRuc] = useState(false);
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

  const consultarRuc = async () => {
    const ruc = formulario.numeroDocumento.trim();
    if (ruc.length !== 11) {
      Toast.fire({ icon: "warning", title: "Ingrese un RUC de 11 dígitos" });
      return;
    }

    setConsultandoRuc(true);
    try {
      const response = await api.get(`/api/v1/ruc/${ruc}`);
      if (!response.data?.success || !response.data?.datos) {
        Toast.fire({ icon: "error", title: "RUC no encontrado" });
        return;
      }

      const datos = response.data.datos;
      const razonSocial = datos.razon_social || datos.razonSocial || "";
      const direccion = datos.domiciliado?.direccion || "";

      setFormulario((prev) => ({
        ...prev,
        numeroDocumento: ruc,
        razonSocial,
        nombreComercial: prev.nombreComercial || razonSocial,
        direccion: direccion || prev.direccion
      }));
      setErrores((prev) => ({
        ...prev,
        razonSocial: null,
        nombreComercial: null,
        direccion: direccion ? null : prev.direccion
      }));
      Toast.fire({ icon: "success", title: "Datos de RUC cargados" });
    } catch (error) {
      console.error("Error al consultar RUC:", error);
      Toast.fire({ icon: "error", title: "Error al consultar RUC" });
    } finally {
      setConsultandoRuc(false);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.razonSocial.trim()) {
      nuevosErrores.razonSocial = "Debe consultar el RUC para cargar la razón social.";
    }
    if (!formulario.nombreComercial.trim()) {
      nuevosErrores.nombreComercial = "Debe consultar el RUC para cargar el nombre comercial.";
    }
    if (!formulario.direccion.trim()) {
      nuevosErrores.direccion = "Debe consultar el RUC para cargar la dirección.";
    }
    if (!formulario.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (formulario.telefono.trim().length < 6) {
      nuevosErrores.telefono = "El teléfono debe tener al menos 6 dígitos.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formulario,
        idTipoDocumento: parseInt(formulario.idTipoDocumento)
      };

      await api.post("/api/v1/proveedores", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Toast.fire({ icon: "success", title: "Proveedor registrado con éxito" });
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      Toast.fire({ icon: "error", title: "Error al registrar proveedor" });
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
    inputWithButton: { display: "flex", gap: "8px" },
    btnSearch: { backgroundColor: "#2563eb", color: "#fff", border: "none", width: "42px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
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
          <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>Registrar Proveedor</h3>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }} onClick={onClose}>
            <XCircleFill size={20} />
          </button>
        </div>
        <form onSubmit={handleGuardar}>
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
              <div style={styles.inputWithButton}>
                <input type="text" name="numeroDocumento" style={{ ...styles.input, flex: 1 }} required value={formulario.numeroDocumento} onChange={handleInputChange} />
                <button type="button" style={styles.btnSearch} onClick={consultarRuc} disabled={consultandoRuc} title="Buscar RUC">
                  {consultandoRuc ? "..." : <Search />}
                </button>
              </div>
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
              <Save2Fill /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearProveedor;
