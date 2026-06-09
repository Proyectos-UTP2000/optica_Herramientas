package com.herramientas.optica.modules.productos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class MigrarProductosRequestDTO {
    @NotNull(message = "El destino es obligatorio")
    @Positive(message = "El destino debe ser válido")
    private Long destinoId;
}
