import { useState, useEffect } from "react";
import axios from "axios";
import {
  BoxSeam,
  ArrowRepeat,
  ShieldExclamation,
  ListColumns,
} from "react-bootstrap-icons";
import TablaInventario from "./inventario/TablaInventario";
import ModalAjusteInventario from "./inventario/ModalAjusteInventario";
import ModalHistorialInventario from "./inventario/ModalHistorialInventario";
import { Toast } from "../utils/alerts";

const Inventario = () => {
  const [saldos, setSaldos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [soloBajoStock, setSoloBajoStock] = useState(false);

  // Estados para el Modal de Ajustes (Ingreso/Egreso)
  const [modalAjusteAbierto, setModalAjusteAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [tipoAjuste, setTipoAjuste] = useState("positivo");

  // Estados para el Modal de Historial (Kárdex)
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [productoHistorial, setProductoHistorial] = useState(null);

  const cargarInventario = async () => {
    setCargando(true);
    const token = localStorage.getItem("token");
    try {
      const url = "http://localhost:8080/api/v1/inventario/saldos";
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaldos(response.data || []);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
      Toast.fire({
        icon: "error",
        title: "No se pudieron obtener los saldos de almacén",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const handleAbrirAjuste = (producto, tipo) => {
    setTipoAjuste(tipo);
    setProductoSeleccionado(producto);
    setModalAjusteAbierto(true);
  };

  const handleAbrirHistorial = (producto) => {
    setProductoHistorial(producto);
    setModalHistorialAbierto(true);
  };

  const saldosAExhibir = soloBajoStock
    ? saldos.filter((item) => {
        const actual = parseFloat(item.stockActual) || 0;
        const minimo = parseFloat(item.stockMinimo) || 0;
        return actual <= minimo && minimo > 0;
      })
    : saldos;

  return (
    <div className="container-fluid" style={{ padding: "10px 0" }}>
      {/* CABECERA */}
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
            <BoxSeam style={{ marginRight: "10px", verticalAlign: "middle" }} />
            Control de Inventario y Almacén
          </h2>
          <p
            style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}
          >
            Gestión de existencias en tiempo real y auditoría de variaciones de
            stock.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-secondary"
            onClick={() => setSoloBajoStock(!soloBajoStock)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: soloBajoStock ? "#fef2f2" : "",
              borderColor: soloBajoStock ? "#fca5a5" : "",
              color: soloBajoStock ? "#991b1b" : "",
            }}
          >
            {soloBajoStock ? <ListColumns /> : <ShieldExclamation />}
            {soloBajoStock ? "Ver Todo el Stock" : "Alertas Bajo Stock"}
          </button>

          <button
            className="btn-secondary"
            onClick={cargarInventario}
            disabled={cargando}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowRepeat className={cargando ? "spin-animation" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
        }}
      >
        <TablaInventario
          saldos={saldosAExhibir}
          cargando={cargando}
          onAjuste={handleAbrirAjuste}
          onVerHistorial={handleAbrirHistorial}
        />
      </div>

      {/* MODAL 1: ENTRADAS Y SALIDAS DE STOCK */}
      {modalAjusteAbierto && productoSeleccionado && (
        <ModalAjusteInventario
          producto={productoSeleccionado}
          tipoAjuste={tipoAjuste}
          cerrarModal={() => {
            setModalAjusteAbierto(false);
            setProductoSeleccionado(null);
          }}
          recargarTabla={cargarInventario}
        />
      )}

      {/* MODAL 2: HISTORIAL COMPLETO (KÁRDEX) */}
      {modalHistorialAbierto && productoHistorial && (
        <ModalHistorialInventario
          producto={productoHistorial}
          cerrarModal={() => {
            setModalHistorialAbierto(false);
            setProductoHistorial(null);
          }}
        />
      )}
    </div>
  );
};

export default Inventario;
