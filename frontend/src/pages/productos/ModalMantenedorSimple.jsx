import { useState, useEffect } from "react";
import axios from "axios";
import { Toast, mostrarAlerta } from "../../utils/alerts";
import { ModalShell } from "../../components/ui/ModalShell";

const ModalMantenedorSimple = ({
  titulo,
  endpoint,
  item,
  cerrarModal,
  recargar,
}) => {
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (item) {
      setNombre(item.nombre || "");
    }
  }, [item]);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      if (item) {
        // Modo Edición (PUT)
        await axios.put(
          `/api/v1/${endpoint}/${item.id}`,
          { nombre },
          { headers },
        );
        Toast.fire({ icon: "success", title: `${titulo} actualizada` });
      } else {
        // Modo Creación (POST)
        await axios.post(`/api/v1/${endpoint}`, { nombre }, { headers });
        Toast.fire({ icon: "success", title: `${titulo} registrada` });
      }
      recargar();
      cerrarModal();
    } catch (err) {
      mostrarAlerta(
        "Error",
        err.response?.data?.message || "Ocurrió un error",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalShell
      titulo={`${item ? "Editar" : "Registrar"} ${titulo}`}
      onClose={cerrarModal}
      footer={
        <>
          <button className="btn-secondary" onClick={cerrarModal}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label-control">Nombre de la {titulo} *</label>
        <input
          className={`input-control ${error ? "border-red-500" : ""}`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={`Ej. Ingrese ${titulo.toLowerCase()}`}
        />
        {error && (
          <span style={{ color: "var(--danger)", fontSize: "11px" }}>
            {error}
          </span>
        )}
      </div>
    </ModalShell>
  );
};

export default ModalMantenedorSimple;
