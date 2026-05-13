package com.herramientas.optica.modules.productos.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MarcaRequestDTO {
    @NotBlank(message = "El nombre de la marca es obligatorio")
    private String nombre;
    private LocalDate fecha;
}
