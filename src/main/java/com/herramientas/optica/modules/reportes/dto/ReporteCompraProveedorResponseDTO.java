package com.herramientas.optica.modules.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteCompraProveedorResponseDTO {

    private Long proveedorId;
    private LocalDate desde;
    private LocalDate hasta;
    private Integer cantidadCompras;
    private BigDecimal totalCompras;
    private List<ReporteCompraItemDTO> compras;
}
