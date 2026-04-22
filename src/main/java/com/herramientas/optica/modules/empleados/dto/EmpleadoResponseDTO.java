package com.herramientas.optica.modules.empleados.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmpleadoResponseDTO {
    private Long id;
    private String dni;
    private String nombres;
    private String apellidos;
    private String username;
    private String correo;
    private String telefono;
    private String direccion;
    private Integer estado;
    private String perfilNombre;
}