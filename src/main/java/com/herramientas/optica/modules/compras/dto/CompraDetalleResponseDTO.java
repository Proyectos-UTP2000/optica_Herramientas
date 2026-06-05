package com.herramientas.optica.modules.compras.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompraDetalleResponseDTO {
    private Long productoId;
    private String productoNombre;
    private String productoCodigo;
    private BigDecimal cantidadCompra;
    private Integer factorConversionAplicado;
    private BigDecimal cantidadInventario;
    private BigDecimal costoUnitario;
    private BigDecimal subtotal;
    private BigDecimal stockPrevio;
    private BigDecimal stockActual;
}
