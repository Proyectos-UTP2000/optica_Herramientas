package com.herramientas.optica.modules.caja.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CierreCajaRequestDTO {

    @NotNull(message = "El monto real contado es obligatorio")
    @DecimalMin(value = "0.00", message = "El monto real no puede ser negativo")
    private BigDecimal montoReal;

    @Size(max = 500, message = "Las observaciones no deben superar 500 caracteres")
    private String observaciones;
}
