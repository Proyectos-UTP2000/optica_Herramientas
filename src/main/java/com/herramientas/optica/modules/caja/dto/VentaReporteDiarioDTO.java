package com.herramientas.optica.modules.caja.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VentaReporteDiarioDTO {
    private Long ventaId;
    private LocalDateTime fecha;
    private String clienteNombre;
    private String medioPago;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;
    private String numeroComprobante;
}
