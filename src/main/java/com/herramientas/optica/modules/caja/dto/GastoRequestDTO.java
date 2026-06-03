package com.herramientas.optica.modules.caja.dto;

import java.math.BigDecimal;

import com.herramientas.optica.modules.caja.model.MetodoPagoCaja;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GastoRequestDTO {

    @NotNull(message = "El empleado que registra el gasto es obligatorio")
    @Positive(message = "El empleado debe ser válido")
    private Long empleadoId;

    @NotBlank(message = "La categoria del gasto es obligatoria")
    @Size(max = 80, message = "La categoria no debe superar 80 caracteres")
    private String categoria;

    @NotBlank(message = "La descripcion del gasto es obligatoria")
    @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
    private String descripcion;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor que cero")
    private BigDecimal monto;

    @NotNull(message = "El metodo de pago es obligatorio")
    private MetodoPagoCaja metodoPago;
}
