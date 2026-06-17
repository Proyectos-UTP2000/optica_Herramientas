package com.herramientas.optica.security.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardAnalyticsDTO {
    private List<VentaMensualDTO> ventasMensuales;
    private List<ProductoMasVendidoDTO> productosMasVendidos;
    private List<RentabilidadMarcaDTO> rentabilidadMarca;
    private List<RentabilidadCategoriaDTO> rentabilidadCategoria;
    private ValorizacionInventarioDTO valorizacionInventario;
    private List<FlujoCajaDiarioDTO> flujoCajaDiario;

    @Data
    @Builder
    public static class VentaMensualDTO {
        private String mes; // Ej: "Junio", "2026-06"
        private BigDecimal total;
    }

    @Data
    @Builder
    public static class ProductoMasVendidoDTO {
        private String productoNombre;
        private Long cantidad;
    }

    @Data
    @Builder
    public static class RentabilidadMarcaDTO {
        private String marca;
        private BigDecimal ingresos;
        private BigDecimal costos;
        private BigDecimal rentabilidad;
    }

    @Data
    @Builder
    public static class RentabilidadCategoriaDTO {
        private String categoria;
        private BigDecimal ingresos;
        private BigDecimal costos;
        private BigDecimal rentabilidad;
    }

    @Data
    @Builder
    public static class ValorizacionInventarioDTO {
        private BigDecimal valorCosto;
        private BigDecimal valorVenta;
    }

    @Data
    @Builder
    public static class FlujoCajaDiarioDTO {
        private String fecha; // YYYY-MM-DD
        private BigDecimal ingresos;
        private BigDecimal egresos;
        private BigDecimal neto;
    }
}
