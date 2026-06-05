package com.herramientas.optica.modules.compras.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CompraDetalleRequestDTO {

    @NotNull(message = "El producto es obligatorio")
    @Positive(message = "El producto debe ser valido")
    private Long productoId;

    @NotNull(message = "La cantidad de compra es obligatoria")
    @DecimalMin(value = "0.001", message = "La cantidad de compra debe ser mayor que cero")
    private BigDecimal cantidadCompra;

    @NotNull(message = "El costo unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El costo unitario debe ser mayor que cero")
    private BigDecimal costoUnitario;
}
