package com.herramientas.optica.modules.productos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UnidadRequestDTO {
    @NotBlank(message = "El nombre de la unidad es obligatorio")
    private String nombre;
}
