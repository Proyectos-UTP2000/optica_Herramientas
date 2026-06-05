package com.herramientas.optica.modules.caja.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.caja.model.MetodoPagoCaja;
import com.herramientas.optica.modules.caja.model.OrigenMovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MovimientoCajaResponseDTO {
    private Long id;
    private Long cajaId;
    private TipoMovimientoCaja tipo;
    private OrigenMovimientoCaja origen;
    private MetodoPagoCaja metodoPago;
    private BigDecimal monto;
    private String descripcion;
    private String referenciaTipo;
    private Long referenciaId;
    private Long empleadoId;
    private String empleadoNombre;
    private LocalDateTime fecha;
    private Boolean anulado;
}
