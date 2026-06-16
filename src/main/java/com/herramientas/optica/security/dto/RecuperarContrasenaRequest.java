package com.herramientas.optica.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecuperarContrasenaRequest {
    @NotBlank(message = "El correo o usuario es obligatorio")
    private String correo;
}
