import { useState, useEffect } from "react";
import axios from "axios";
import { Toast, mostrarAlerta } from "../../utils/alerts";

const ModalEditarMarca = ({ marca, cerrarModal, recargarTabla }) => {
    const [nombre, setNombre] = useState("");
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { if (marca) setNombre(marca.nombre || ""); }, [marca]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            mostrarAlerta("Campo requerido", "El nombre de la marca es obligatorio.", "warning");
            return;
        }
        setLoading(true);
        try {
            await axios.put(`/api/v1/marcas/${marca.id}`, { nombre: nombre.trim() }, { headers });
            Toast.fire({ icon: "success", title: "Marca actualizada correctamente" });
            recargarTabla();
            cerrarModal();
        } catch (e) {
            mostrarAlerta("Error al actualizar", e.response?.data?.message || "No se pudo actualizar.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
            <div style={S.modal}>
                <div style={S.header}>
                    <h3 style={S.titulo}>Editar Marca</h3>
                    <button style={S.btnX} onClick={cerrarModal}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={S.body}>
                        <label className="label-control">Nombre *</label>
                        <input className="input-control" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Nike, Adidas..." autoFocus />
                    </div>
                    <div style={S.footer}>
                        <button type="button" className="btn-secondary" onClick={cerrarModal} disabled={loading}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Actualizando..." : "Actualizar"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const S = {
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modal: { background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid #e2e8f0" },
    titulo: { margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" },
    btnX: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#94a3b8" },
    body: { padding: "20px", display: "flex", flexDirection: "column", gap: "4px" },
    footer: { display: "flex", justifyContent: "flex-end", gap: "8px", padding: "14px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" },
};

export default ModalEditarMarca;