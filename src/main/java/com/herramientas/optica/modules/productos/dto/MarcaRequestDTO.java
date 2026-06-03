package com.herramientas.optica.modules.productos.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MarcaRequestDTO {
    @NotBlank(message = "El nombre de la marca es obligatorio")
    @Size(max = 255, message = "El nombre no debe superar 255 caracteres")
    private String nombre;

    @PastOrPresent(message = "La fecha de la marca no puede ser futura")
    private LocalDate fecha;
}
