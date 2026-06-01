package com.herramientas.optica.modules.inventario.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.inventario.model.ReferenciaInventario;
import com.herramientas.optica.modules.inventario.model.TipoMovimientoInventario;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MovimientoInventarioResponseDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String productoCodigo;
    private TipoMovimientoInventario tipo;
    private BigDecimal cantidad;
    private BigDecimal stockPrevio;
    private BigDecimal stockNuevo;
    private String motivo;
    private ReferenciaInventario referenciaTipo;
    private Long referenciaId;
    private Long empleadoId;
    private String empleadoNombre;
    private LocalDateTime fecha;
}
