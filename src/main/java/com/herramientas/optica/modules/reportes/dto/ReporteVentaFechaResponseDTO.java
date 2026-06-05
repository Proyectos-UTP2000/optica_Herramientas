package com.herramientas.optica.modules.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteVentaFechaResponseDTO {

    private LocalDate desde;
    private LocalDate hasta;
    private Integer cantidadVentas;
    private BigDecimal totalVentas;
    private List<ReporteVentaItemDTO> ventas;
}
