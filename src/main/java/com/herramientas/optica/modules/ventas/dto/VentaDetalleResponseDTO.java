package com.herramientas.optica.modules.ventas.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VentaDetalleResponseDTO {
    private Long productoId;
    private String productoNombre;
    private String productoCodigo;
    private BigDecimal cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal descuento;
    private BigDecimal subtotal;
    private BigDecimal stockPrevio;
    private BigDecimal stockActual;
}
