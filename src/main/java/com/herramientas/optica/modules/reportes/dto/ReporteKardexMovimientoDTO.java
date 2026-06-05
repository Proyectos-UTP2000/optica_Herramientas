package com.herramientas.optica.modules.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.inventario.model.ReferenciaInventario;
import com.herramientas.optica.modules.inventario.model.TipoMovimientoInventario;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteKardexMovimientoDTO {

    private Long movimientoId;
    private LocalDateTime fecha;
    private TipoMovimientoInventario tipo;
    private BigDecimal cantidad;
    private BigDecimal stockPrevio;
    private BigDecimal stockNuevo;
    private String motivo;
    private ReferenciaInventario referenciaTipo;
    private Long referenciaId;
    private String empleadoNombre;
}
