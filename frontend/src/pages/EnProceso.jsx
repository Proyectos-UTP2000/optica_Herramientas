import { Gear, Tools } from "react-bootstrap-icons";

const EnProceso = ({
  titulo = "En proceso",
  descripcion = "Esta sección estará disponible en una próxima actualización.",
}) => (
  <div className="page-container">
    <div className="placeholder-page">
      <div className="placeholder-copy">
        <span className="placeholder-kicker">Módulo pendiente</span>
        <h1>{titulo}</h1>
        <p>{descripcion}</p>
        <div className="placeholder-status">
          <Gear />
          <span>En proceso...</span>
        </div>
      </div>

      <div className="placeholder-illustration" aria-label="Módulo en proceso">
        <div className="placeholder-window">
          <div className="placeholder-window-bar">
            <span />
            <span />
            <span />
          </div>
          <div className="placeholder-window-body">
            <div className="placeholder-tool">
              <Tools />
            </div>
            <div className="placeholder-lines">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default EnProceso;
