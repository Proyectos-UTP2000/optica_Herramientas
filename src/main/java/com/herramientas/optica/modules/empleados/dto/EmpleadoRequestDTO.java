package com.herramientas.optica.modules.empleados.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EmpleadoRequestDTO {
    
    @NotBlank(message = "El DNI es obligatorio")
    @Size(min = 8, max = 8, message = "El DNI debe tener 8 caracteres")
    private String dni;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    private String correo;

    @Size(min = 9, max = 15, message = "El teléfono debe tener entre 9 y 15 caracteres")
    private String telefono;

    @Size(max = 255, message = "La dirección no debe superar 255 caracteres")
    private String direccion;

    @NotNull(message = "El perfil es obligatorio")
    @Positive(message = "El perfil debe ser válido")
    private Long idPerfil;
}
