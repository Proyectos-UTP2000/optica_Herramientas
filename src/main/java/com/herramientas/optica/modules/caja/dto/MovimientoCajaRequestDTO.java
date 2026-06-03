package com.herramientas.optica.modules.caja.dto;

import java.math.BigDecimal;

import com.herramientas.optica.modules.caja.model.MetodoPagoCaja;
import com.herramientas.optica.modules.caja.model.OrigenMovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MovimientoCajaRequestDTO {

    @NotNull(message = "El empleado que registra el movimiento es obligatorio")
    @Positive(message = "El empleado debe ser válido")
    private Long empleadoId;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimientoCaja tipo;

    @NotNull(message = "El origen del movimiento es obligatorio")
    private OrigenMovimientoCaja origen;

    @NotNull(message = "El metodo de pago es obligatorio")
    private MetodoPagoCaja metodoPago;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor que cero")
    private BigDecimal monto;

    @NotBlank(message = "La descripcion es obligatoria")
    @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
    private String descripcion;

    @Size(max = 50, message = "El tipo de referencia no debe superar 50 caracteres")
    private String referenciaTipo;

    @Positive(message = "La referencia debe ser válida")
    private Long referenciaId;
}
