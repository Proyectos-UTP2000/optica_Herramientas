package com.herramientas.optica.modules.productos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UnidadResponseDTO {
    private Integer id;
    private String nombre;
    private Integer estado;
    private Long cantidadProductosRelacionados;
}
