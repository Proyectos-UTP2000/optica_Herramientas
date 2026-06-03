package com.herramientas.optica.modules.proveedores.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProveedorRequestDTO {

    @NotNull(message = "El tipo de documento es obligatorio")
    @Positive(message = "El tipo de documento debe ser válido")
    private Long idTipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(min = 8, max = 11, message = "El número de documento debe tener entre 8 y 11 caracteres")
    private String numeroDocumento;

    @Size(max = 255, message = "La razón social no debe superar 255 caracteres")
    private String razonSocial;

    @Size(max = 150, message = "El nombre comercial no debe superar 150 caracteres")
    private String nombreComercial;

    @Size(max = 255, message = "La dirección no debe superar 255 caracteres")
    private String direccion;

    @Size(min = 6, max = 30, message = "El teléfono debe tener entre 6 y 30 caracteres")
    private String telefono;

    @Email(message = "El formato del correo electrónico no es válido")
    @Size(max = 255, message = "El correo no debe superar 255 caracteres")
    private String correo;
}
