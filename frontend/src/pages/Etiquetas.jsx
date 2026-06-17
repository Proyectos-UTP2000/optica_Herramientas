import { Tags } from "react-bootstrap-icons";
import TablaMantenedorSimple from "./productos/TablaMantenedorSimple";

const Etiquetas = () => {
  return (
    <div className="container-fluid" style={{ padding: "10px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            <Tags style={{ marginRight: "10px", verticalAlign: "middle" }} />
            Gestión de Etiquetas B2C
          </h2>
          <p
            style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}
          >
            Crea y administra etiquetas para clasificar productos en el catálogo
            web público.
          </p>
        </div>
      </div>

      <TablaMantenedorSimple titulo="Etiquetas" endpoint="etiquetas" />
    </div>
  );
};

export default Etiquetas;
