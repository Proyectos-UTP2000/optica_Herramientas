package com.herramientas.optica.modules.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.caja.model.EstadoCaja;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteCajaItemDTO {

    private Long cajaId;
    private Long empleadoId;
    private String empleadoNombre;
    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;
    private EstadoCaja estado;
    private BigDecimal montoInicial;
    private BigDecimal totalIngresos;
    private BigDecimal totalEgresos;
    private BigDecimal montoEsperado;
    private BigDecimal montoReal;
    private BigDecimal diferencia;
}
