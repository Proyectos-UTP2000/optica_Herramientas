package com.herramientas.optica.modules.clientes.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteRegisterDTO {

    @NotBlank(message = "Nombre es obligatorio")
    private String nombre;

    private String apellidoPaterno;

    private String apellidoMaterno;

    @NotBlank(message = "Número de documento es obligatorio")
    private String numeroDocumento;

    @NotNull(message = "Tipo de documento es obligatorio")
    private Long idTipoDocumento;

    @NotBlank(message = "Dirección es obligatoria")
    private String direccion;

    @NotBlank(message = "Teléfono es obligatorio")
    private String telefono;

    @NotBlank(message = "Correo es obligatorio")
    @Email(message = "Correo inválido")
    private String correo;

    @NotBlank(message = "Contraseña es obligatoria")
    @Size(min = 6, message = "Contraseña debe tener al menos 6 caracteres")
    private String contrasena;
}
