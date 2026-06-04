package com.herramientas.optica.modules.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteCajaResponseDTO {

    private LocalDate desde;
    private LocalDate hasta;
    private Integer cantidadCajas;
    private BigDecimal totalIngresos;
    private BigDecimal totalEgresos;
    private List<ReporteCajaItemDTO> cajas;
}
