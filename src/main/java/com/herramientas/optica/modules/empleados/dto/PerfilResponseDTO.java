package com.herramientas.optica.modules.empleados.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PerfilResponseDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Integer estado;
    private List<OpcionDTO> opciones;

    @Data
    @Builder
    public static class OpcionDTO {
        private Long id;
        private String nombre;
        private String ruta;
        private Boolean visibleEnMenu;
    }
}