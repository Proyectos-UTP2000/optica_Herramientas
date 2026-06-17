package com.herramientas.optica.modules.empleados.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpcionResponseDTO {
    private Long id;
    private String nombre;
    private String ruta;
    private String icono;
    private Long idPadre;
    private Integer orden;
    private Boolean visibleEnMenu;
}
