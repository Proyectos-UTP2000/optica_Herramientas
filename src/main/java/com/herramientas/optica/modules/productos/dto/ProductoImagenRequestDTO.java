package com.herramientas.optica.modules.productos.dto;

import lombok.Data;

@Data
public class ProductoImagenRequestDTO {
    private Long id;
    private Integer fileIndex;
    private Boolean esPrincipal;
    private Integer orden;
}
