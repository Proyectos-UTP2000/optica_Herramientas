import {
  ModalShell,
  SeccionLabel,
  Divider,
} from "../../components/ui/ModalShell";

const MostrarDato = ({ label, valor }) => (
  <div
    style={{
      padding: "8px 0",
      borderBottom: "1px solid #f8fafc",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "var(--text-muted)",
        fontWeight: "600",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: "13px",
        color: "var(--text-main)",
        fontWeight: "500",
        textAlign: "right",
        maxWidth: "60%",
      }}
    >
      {valor || "—"}
    </span>
  </div>
);

const ModalVerEmpleado = ({ empleado, cerrarModal }) => {
  return (
    <ModalShell
      titulo="Ficha Técnica del Empleado"
      onClose={cerrarModal}
      footer={
        <button className="btn-secondary" onClick={cerrarModal}>
          Cerrar Detalle
        </button>
      }
    >
      <div
        style={{
          background: "var(--bg-light)",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h4
            style={{
              margin: "0 0 5px 0",
              color: "var(--text-main)",
              fontSize: "16px",
            }}
          >
            {empleado.nombres} {empleado.apellidos}
          </h4>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            @{empleado.username}
          </span>
        </div>
        <span
          className={`badge ${empleado.estado === 1 ? "badge-active" : "badge-inactive"}`}
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          {empleado.estado === 1 ? "Activo en Sistema" : "Acceso Suspendido"}
        </span>
      </div>

      <SeccionLabel text="Información Personal" />
      <MostrarDato
        label="Tipo de Documento"
        valor="Documento Nacional de Identidad (DNI)"
      />
      <MostrarDato label="Número de Documento" valor={empleado.dni} />
      <MostrarDato label="Dirección de Residencia" valor={empleado.direccion} />

      <Divider />

      <SeccionLabel text="Contacto y Seguridad" />
      <MostrarDato label="Correo Corporativo" valor={empleado.correo} />
      <MostrarDato label="Teléfono de Contacto" valor={empleado.telefono} />
      <MostrarDato label="Rol Asignado" valor={empleado.perfilNombre} />
    </ModalShell>
  );
};

export default ModalVerEmpleado;
