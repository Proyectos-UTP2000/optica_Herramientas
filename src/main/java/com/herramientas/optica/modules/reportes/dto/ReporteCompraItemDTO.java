package com.herramientas.optica.modules.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.compras.model.EstadoCompra;
import com.herramientas.optica.modules.compras.model.MedioPagoCompra;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteCompraItemDTO {

    private Long compraId;
    private LocalDateTime fecha;
    private String numeroComprobante;
    private Long proveedorId;
    private String proveedorNombre;
    private String empleadoNombre;
    private MedioPagoCompra medioPago;
    private EstadoCompra estado;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;
}
