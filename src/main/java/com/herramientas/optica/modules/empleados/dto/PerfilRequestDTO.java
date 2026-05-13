package com.herramientas.optica.modules.empleados.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PerfilRequestDTO {
    
    @NotBlank(message = "El nombre del perfil es obligatorio")
    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    private String nombre;

    @Size(max = 255, message = "La descripción no puede exceder los 255 caracteres")
    private String descripcion;

    @NotEmpty(message = "Debe seleccionar al menos una opción para el perfil")
    private List<Long> idsOpciones;
}