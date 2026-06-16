package com.herramientas.optica.security.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestablecerContrasenaRequest {

    @NotBlank(message = "El correo o usuario es obligatorio")
    private String emailOrUsername;

    @NotBlank(message = "El código de recuperación es obligatorio")
    private String codigo;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?\\\":{}|<>_\\\\\\-+=\\\\[\\\\]~;\\\\/\\\\\\\\]).{8,}$",
        message = "La nueva contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una letra minúscula y un carácter especial"
    )
    private String nuevaContrasena;
}
