package com.herramientas.optica.modules.productos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EtiquetaRequestDTO {
    @NotBlank(message = "El nombre de la etiqueta es obligatorio")
    @Size(max = 100, message = "El nombre no debe superar los 100 caracteres")
    private String nombre;
}
