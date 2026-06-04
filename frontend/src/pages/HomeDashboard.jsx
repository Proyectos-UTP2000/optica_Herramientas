import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import {
  PersonFill,
  PeopleFill,
  Box2Fill,
  ExclamationTriangleFill,
  CheckCircleFill
} from "react-bootstrap-icons";

const HomeDashboard = () => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalClientes: 0,
    totalProductos: 0,
    productosBajoStock: []
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Hacemos ambas peticiones en paralelo para ahorrar tiempo
        const [resStats, resProductos] = await Promise.all([
          api.get("/api/v1/dashboard/stats").catch(() => ({ data: {} })),
          api.get("/api/v1/productos").catch(() => ({ data: [] })) // Cambia esta ruta si tu endpoint de productos es diferente
        ]);

        const listaProductos = resProductos.data || [];
        
        // React hace el trabajo del backend: Filtra los productos con stock crítico en vivo
        const alertasCriticas = listaProductos.filter(prod => {
          const cantidadActual = parseInt(prod.stock ?? 0);
          const cantidadMinima = parseInt(prod.stockMinimo ?? 1);
          return cantidadActual <= cantidadMinima;
        });

        setStats({
          totalUsuarios: resStats.data.totalUsuarios || 0,
          totalClientes: resStats.data.totalClientes || 0,
          totalProductos: listaProductos.length, // Usamos el tamaño real de tu catálogo
          productosBajoStock: alertasCriticas   // Guardamos las alertas filtradas en el navegador
        });
      } catch (error) {
        console.error("Error cargando estadísticas unificadas:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchDashboardData();
  }, []);

  const styles = {
    container: {
      padding: "30px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      marginBottom: "30px",
      borderBottom: "2px solid #e2e8f0",
      paddingBottom: "15px",
    },
    title: {
      fontSize: "28px",
      color: "#1e293b",
      margin: 0,
      fontWeight: "600",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "14px",
      marginTop: "5px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "25px",
      marginTop: "20px",
    },
    card: (color) => ({
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "25px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      borderLeft: `8px solid ${color}`,
      transition: "transform 0.2s ease",
      cursor: "default",
    }),
    iconCircle: (color) => ({
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: `${color}15`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      color: color,
    }),
    cardData: {
      display: "flex",
      flexDirection: "column",
    },
    cardLabel: {
      fontSize: "13px",
      color: "#64748b",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    cardValue: {
      fontSize: "36px",
      fontWeight: "800",
      color: "#1e293b",
      marginTop: "5px",
    },
    alertSection: {
      marginTop: "35px",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "25px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e2e8f0"
    },
    alertHeader: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    alertList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      maxHeight: "350px",
      overflowY: "auto",
      paddingRight: "5px"
    },
    alertItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 20px",
      backgroundColor: "#fff5f5",
      border: "1px solid #fed7d7",
      borderRadius: "12px",
      fontSize: "14px"
    },
    productInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "2px"
    },
    productName: {
      fontWeight: "600",
      color: "#9b2c2c"
    },
    productMeta: {
      fontSize: "12px",
      color: "#64748b"
    },
    badgeStock: {
      backgroundColor: "#fff",
      border: "1px solid #feb2b2",
      padding: "6px 12px",
      borderRadius: "8px",
      fontWeight: "700",
      color: "#9b2c2c",
      textAlign: "right",
      fontSize: "13px"
    },
    emptyAlerts: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      color: "#0f5132",
      backgroundColor: "#d1e7dd",
      border: "1px solid #badbcc",
      borderRadius: "12px",
      gap: "10px",
      fontSize: "15px"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Dashboard</h2>
        <p style={styles.subtitle}>Resumen operativo y alertas del sistema</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card("#3b82f6")}>
          <div style={styles.cardData}>
            <span style={styles.cardLabel}>Usuarios</span>
            <span style={styles.cardValue}>{stats.totalUsuarios}</span>
          </div>
          <div style={styles.iconCircle("#3b82f6")}>
            <PersonFill />
          </div>
        </div>

        <div style={styles.card("#10b981")}>
          <div style={styles.cardData}>
            <span style={styles.cardLabel}>Clientes</span>
            <span style={styles.cardValue}>{stats.totalClientes}</span>
          </div>
          <div style={styles.iconCircle("#10b981")}>
            <PeopleFill />
          </div>
        </div>

        <div style={styles.card("#f59e0b")}>
          <div style={styles.cardData}>
            <span style={styles.cardLabel}>Total Productos</span>
            <span style={styles.cardValue}>{stats.totalProductos}</span>
          </div>
          <div style={styles.iconCircle("#f59e0b")}>
            <Box2Fill />
          </div>
        </div>
      </div>

      <div style={styles.alertSection}>
        <h3 style={styles.alertHeader}>
          <ExclamationTriangleFill style={{ color: "#dc2626" }} />
          Alertas de Stock Crítico
        </h3>

        {cargando ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
            Sincronizando auditoría de almacén...
          </div>
        ) : stats.productosBajoStock.length === 0 ? (
          <div style={styles.emptyAlerts}>
            <CheckCircleFill size={24} />
            <span><strong>¡Todo en orden!</strong> Todos los productos cuentan con stock superior al mínimo establecido.</span>
          </div>
        ) : (
          <div style={styles.alertList}>
            {stats.productosBajoStock.map((prod) => (
              <div key={prod.id} style={styles.alertItem}>
                <div style={styles.productInfo}>
                  <span style={styles.productName}>{prod.nombre}</span>
                  <span style={styles.productMeta}>
                    Modelo: {prod.modelo || "Sin Modelo"} | Tipo: {prod.tipoProducto}
                  </span>
                </div>
                <div style={styles.badgeStock}>
                  <div>Stock Actual: {prod.stock} uds</div>
                  <div style={{ fontSize: "11px", fontWeight: "400", color: "#e53e3e", marginTop: "2px" }}>
                    Mínimo requerido: {prod.stockMinimo} uds
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeDashboard;