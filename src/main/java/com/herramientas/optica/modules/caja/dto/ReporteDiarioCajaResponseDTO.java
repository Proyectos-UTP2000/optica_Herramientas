package com.herramientas.optica.modules.caja.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.herramientas.optica.modules.caja.model.EstadoCaja;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteDiarioCajaResponseDTO {
    private Long cajaId;
    private Long empleadoId;
    private String empleadoNombre;
    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;
    private EstadoCaja estadoCaja;
    private BigDecimal montoInicial;
    private BigDecimal totalVentas;
    private Integer cantidadVentas;
    private Map<String, BigDecimal> totalPorMedioPago;
    private List<VentaReporteDiarioDTO> ventas;
}
