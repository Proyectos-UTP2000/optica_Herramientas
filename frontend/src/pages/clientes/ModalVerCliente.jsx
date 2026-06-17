import { ModalShell } from "../../components/ui/ModalShell";

const ModalVerCliente = ({ cliente, cerrarModal }) => {
  return (
    <ModalShell
      titulo="Detalle del Cliente"
      onClose={cerrarModal}
      footer={
        <button className="btn-secondary" onClick={cerrarModal}>
          Cerrar
        </button>
      }
    >
      <p>
        <b>Nombre:</b> {cliente.nombreCompleto}
      </p>
      <p>
        <b>Documento:</b> {cliente.tipoDocumentoNombre}{" "}
        {cliente.numeroDocumento}
      </p>
      <p>
        <b>Correo:</b> {cliente.correo}
      </p>
      <p>
        <b>Teléfono:</b> {cliente.telefono}
      </p>
      <p>
        <b>Dirección:</b> {cliente.direccion}
      </p>
    </ModalShell>
  );
};

export default ModalVerCliente;
