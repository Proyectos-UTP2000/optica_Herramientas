package com.herramientas.optica.modules.inventario.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AjusteInventarioRequestDTO {

    @NotNull(message = "El empleado es obligatorio")
    @Positive(message = "El empleado debe ser válido")
    private Long empleadoId;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor que cero")
    private BigDecimal cantidad;

    @NotBlank(message = "El motivo del ajuste es obligatorio")
    @Size(max = 500, message = "El motivo no debe superar 500 caracteres")
    private String motivo;
}
