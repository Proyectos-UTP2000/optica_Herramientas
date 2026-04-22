package com.herramientas.optica.modules.empleados.dto;

import lombok.Data;

@Data
public class EmpleadoRequestDTO {
    private String dni;
    private String correo;
    private String telefono;
    private String direccion;
    private Long idPerfil;
}