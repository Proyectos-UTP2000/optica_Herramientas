package com.herramientas.optica.modules.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteKardexResponseDTO {

    private Long productoId;
    private String productoNombre;
    private String productoCodigo;
    private LocalDate desde;
    private LocalDate hasta;
    private BigDecimal stockFinal;
    private List<ReporteKardexMovimientoDTO> movimientos;
}
