package com.herramientas.optica.modules.clientes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClienteRequestDTO {
    
    @NotBlank(message = "El número de documento es obligatorio")
    @Size(min = 8, max = 11, message = "El número de documento debe tener entre 8 y 11 caracteres")
    private String numeroDocumento;

    @NotNull(message = "El tipo de documento es obligatorio")
    private Long idTipoDocumento;

    @Email(message = "El formato del correo electrónico no es válido")
    private String correo;

    @Size(min = 9, max = 15, message = "El teléfono debe tener entre 9 y 15 caracteres")
    private String telefono;

    private String direccion;
}
