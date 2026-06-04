package com.herramientas.optica.modules.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.ventas.model.MedioPagoVenta;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteVentaItemDTO {

    private Long ventaId;
    private LocalDateTime fecha;
    private String numeroComprobante;
    private String clienteNombre;
    private String empleadoNombre;
    private String productosResumen;
    private MedioPagoVenta medioPago;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;
}
