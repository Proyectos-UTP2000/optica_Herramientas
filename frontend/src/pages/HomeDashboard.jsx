import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import {
  PersonFill,
  PeopleFill,
  Box2Fill,
  ExclamationTriangleFill,
  CheckCircleFill,
  Coin,
  GraphUpArrow,
  PieChartFill,
  BookmarkFill,
} from "react-bootstrap-icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

const HomeDashboard = () => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalClientes: 0,
    totalProductos: 0,
    productosBajoStock: [],
  });
  const [analytics, setAnalytics] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resStats, resProductos, resAnalytics] = await Promise.all([
          api.get("/api/v1/dashboard/stats").catch(() => ({ data: {} })),
          api.get("/api/v1/productos").catch(() => ({ data: [] })),
          api.get("/api/v1/dashboard/analytics").catch(() => ({ data: null })),
        ]);

        const listaProductos = resProductos.data || [];

        const alertasCriticas = listaProductos.filter((prod) => {
          const cantidadActual = parseInt(prod.stock ?? 0);
          const cantidadMinima = parseInt(prod.stockMinimo ?? 1);
          return cantidadActual <= cantidadMinima;
        });

        setStats({
          totalUsuarios: resStats.data.totalUsuarios || 0,
          totalClientes: resStats.data.totalClientes || 0,
          totalProductos: listaProductos.length,
          productosBajoStock: alertasCriticas,
        });

        if (resAnalytics.data) {
          setAnalytics(resAnalytics.data);
        }
      } catch (error) {
        console.error("Error cargando estadísticas unificadas:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatoMoneda = (val) =>
    Number(val || 0).toLocaleString("es-PE", {
      style: "currency",
      currency: "PEN",
    });

  const styles = {
    container: {
      padding: "30px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
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
      fontWeight: "700",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "14px",
      marginTop: "5px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
      fontSize: "12px",
      color: "#64748b",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    cardValue: {
      fontSize: "32px",
      fontWeight: "800",
      color: "#1e293b",
      marginTop: "5px",
    },
    chartsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
      gap: "30px",
      marginTop: "35px",
    },
    chartCard: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "25px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e2e8f0",
      minHeight: "380px",
    },
    chartTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    alertSection: {
      marginTop: "35px",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "25px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e2e8f0",
    },
    alertHeader: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    alertList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      maxHeight: "350px",
      overflowY: "auto",
      paddingRight: "5px",
    },
    alertItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 20px",
      backgroundColor: "#fff5f5",
      border: "1px solid #fed7d7",
      borderRadius: "12px",
      fontSize: "14px",
    },
    productInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    },
    productName: {
      fontWeight: "600",
      color: "#9b2c2c",
    },
    productMeta: {
      fontSize: "12px",
      color: "#64748b",
    },
    badgeStock: {
      backgroundColor: "#fff",
      border: "1px solid #feb2b2",
      padding: "6px 12px",
      borderRadius: "8px",
      fontWeight: "700",
      color: "#9b2c2c",
      textAlign: "right",
      fontSize: "13px",
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
      fontSize: "15px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Dashboard de Negocio</h2>
        <p style={styles.subtitle}>Reportes detallados y análisis de rendimiento operativo</p>
      </div>

      {/* KPI Cards */}
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

        {analytics?.valorizacionInventario && (
          <div style={styles.card("#8b5cf6")}>
            <div style={styles.cardData}>
              <span style={styles.cardLabel}>Valorización de Inventario</span>
              <span style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginTop: "5px" }}>
                Venta: {formatoMoneda(analytics.valorizacionInventario.valorVenta)}
              </span>
              <span style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                Costo: {formatoMoneda(analytics.valorizacionInventario.valorCosto)}
              </span>
            </div>
            <div style={styles.iconCircle("#8b5cf6")}>
              <Coin />
            </div>
          </div>
        )}
      </div>

      {/* Business Intelligence Charts */}
      {cargando ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#64748b", fontSize: "16px" }}>
          Sincronizando analíticas detalladas...
        </div>
      ) : (
        <>
          <div style={styles.chartsGrid}>
            {/* Ventas Mensuales */}
            {analytics?.ventasMensuales && (
              <div style={styles.chartCard}>
                <h4 style={styles.chartTitle}>
                  <GraphUpArrow style={{ color: "#3b82f6" }} />
                  Ventas Mensuales (Últimos 6 meses)
                </h4>
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={analytics.ventasMensuales}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip formatter={(value) => [formatoMoneda(value), "Total"]} />
                      <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Flujo Neto de Caja Diaria */}
            {analytics?.flujoCajaDiario && (
              <div style={styles.chartCard}>
                <h4 style={styles.chartTitle}>
                  <Coin style={{ color: "#10b981" }} />
                  Flujo Neto de Caja Diaria (Últimos 15 días)
                </h4>
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <AreaChart data={analytics.flujoCajaDiario}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip formatter={(value) => [formatoMoneda(value), "Neto"]} />
                      <Area type="monotone" dataKey="neto" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Productos Más Vendidos */}
            {analytics?.productosMasVendidos && (
              <div style={styles.chartCard}>
                <h4 style={styles.chartTitle}>
                  <BookmarkFill style={{ color: "#f59e0b" }} />
                  Top 5 Productos Más Vendidos
                </h4>
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={analytics.productosMasVendidos} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                      <YAxis dataKey="productoNombre" type="category" stroke="#94a3b8" width={120} fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Rentabilidad por Marca */}
            {analytics?.rentabilidadMarca && (
              <div style={styles.chartCard}>
                <h4 style={styles.chartTitle}>
                  <PieChartFill style={{ color: "#8b5cf6" }} />
                  Rentabilidad por Marca Comercial
                </h4>
                <div style={{ width: "100%", height: 280, display: "flex", alignItems: "center" }}>
                  <div style={{ width: "60%", height: "100%" }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={analytics.rentabilidadMarca}
                          dataKey="rentabilidad"
                          nameKey="marca"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {analytics.rentabilidadMarca.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatoMoneda(value), "Rentabilidad"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px", maxHeight: "250px", overflowY: "auto" }}>
                    {analytics.rentabilidadMarca.map((entry, index) => (
                      <div key={entry.marca} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ width: "10px", height: "10px", backgroundColor: COLORS[index % COLORS.length], borderRadius: "50%", display: "inline-block" }}></span>
                        <span style={{ fontWeight: "600", color: "#475569" }}>{entry.marca}:</span>
                        <span style={{ color: "#64748b" }}>{formatoMoneda(entry.rentabilidad)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rentabilidad por Categoría */}
            {analytics?.rentabilidadCategoria && (
              <div style={styles.chartCard}>
                <h4 style={styles.chartTitle}>
                  <PieChartFill style={{ color: "#ec4899" }} />
                  Rentabilidad por Categoría
                </h4>
                <div style={{ width: "100%", height: 280, display: "flex", alignItems: "center" }}>
                  <div style={{ width: "60%", height: "100%" }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={analytics.rentabilidadCategoria}
                          dataKey="rentabilidad"
                          nameKey="categoria"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {analytics.rentabilidadCategoria.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatoMoneda(value), "Rentabilidad"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px", maxHeight: "250px", overflowY: "auto" }}>
                    {analytics.rentabilidadCategoria.map((entry, index) => (
                      <div key={entry.categoria} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ width: "10px", height: "10px", backgroundColor: COLORS[index % COLORS.length], borderRadius: "50%", display: "inline-block" }}></span>
                        <span style={{ fontWeight: "600", color: "#475569" }}>{entry.categoria}:</span>
                        <span style={{ color: "#64748b" }}>{formatoMoneda(entry.rentabilidad)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Critical Stock Alerts */}
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
            <span>
              <strong>¡Todo en orden!</strong> Todos los productos cuentan con stock superior al mínimo establecido.
            </span>
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
