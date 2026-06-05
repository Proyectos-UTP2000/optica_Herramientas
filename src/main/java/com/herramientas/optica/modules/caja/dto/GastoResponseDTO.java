package com.herramientas.optica.modules.caja.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.caja.model.EstadoGasto;
import com.herramientas.optica.modules.caja.model.MetodoPagoCaja;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GastoResponseDTO {
    private Long id;
    private Long cajaId;
    private Long movimientoCajaId;
    private Long empleadoId;
    private String empleadoNombre;
    private String categoria;
    private String descripcion;
    private BigDecimal monto;
    private MetodoPagoCaja metodoPago;
    private LocalDateTime fecha;
    private EstadoGasto estado;
}
