package com.herramientas.optica.modules.empleados.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpcionRequestDTO {
    
    @NotBlank(message = "El nombre de la opción es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
    private String nombre;

    @Size(max = 100, message = "La ruta no puede exceder los 100 caracteres")
    private String ruta;

    @Size(max = 100, message = "El icono no puede exceder los 100 caracteres")
    private String icono;

    private Long idPadre;

    private Integer orden;
}
