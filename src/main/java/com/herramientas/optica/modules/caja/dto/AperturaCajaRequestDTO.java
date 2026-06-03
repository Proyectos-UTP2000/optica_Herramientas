package com.herramientas.optica.modules.caja.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AperturaCajaRequestDTO {

    @NotNull(message = "El empleado responsable es obligatorio")
    @Positive(message = "El empleado responsable debe ser válido")
    private Long empleadoId;

    @NotNull(message = "El monto inicial es obligatorio")
    @DecimalMin(value = "0.00", message = "El monto inicial no puede ser negativo")
    private BigDecimal montoInicial;

    @Size(max = 500, message = "Las observaciones no deben superar 500 caracteres")
    private String observaciones;
}
