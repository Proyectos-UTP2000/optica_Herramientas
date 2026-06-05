package com.herramientas.optica.modules.productos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UnidadRequestDTO {
    @NotBlank(message = "El nombre de la unidad es obligatorio")
    @Size(max = 255, message = "El nombre no debe superar 255 caracteres")
    private String nombre;
}
