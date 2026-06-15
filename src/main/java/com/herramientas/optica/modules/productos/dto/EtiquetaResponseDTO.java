package com.herramientas.optica.modules.productos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EtiquetaResponseDTO {
    private Long id;
    private String nombre;
    private Integer estado;
}
