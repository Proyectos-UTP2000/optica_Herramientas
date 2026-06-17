package com.herramientas.optica.modules.productos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoImagenResponseDTO {
    private Long id;
    private String rutaImagen;
    private Boolean esPrincipal;
    private Integer orden;
}
