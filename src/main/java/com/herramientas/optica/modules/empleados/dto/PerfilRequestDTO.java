package com.herramientas.optica.modules.empleados.dto;

import java.util.List;

import lombok.Data;

@Data
public class PerfilRequestDTO {
    private String nombre;
    private String descripcion;
    private List<Long> idsOpciones;
}