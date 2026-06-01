package com.herramientas.optica.modules.inventario.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventarioSaldoResponseDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String productoCodigo;
    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
    private Integer unidadVentaId;
    private String unidadVentaNombre;
    private Integer unidadCompraId;
    private String unidadCompraNombre;
    private Integer factorConversion;
    private Boolean bajoStock;
    private LocalDateTime updatedAt;
}
