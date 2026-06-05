package com.herramientas.optica.modules.ventas.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class VentaDetalleRequestDTO {

    @NotNull(message = "El producto es obligatorio")
    @Positive(message = "El producto debe ser valido")
    private Long productoId;

    @NotNull(message = "La cantidad es obligatoria")
    @DecimalMin(value = "0.001", message = "La cantidad debe ser mayor que cero")
    private BigDecimal cantidad;

    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio unitario debe ser mayor que cero")
    private BigDecimal precioUnitario;

    @DecimalMin(value = "0.00", message = "El descuento del detalle no puede ser negativo")
    private BigDecimal descuento;
}
