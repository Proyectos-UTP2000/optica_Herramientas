package com.herramientas.optica.modules.productos.dto;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MarcaResponseDTO {
    private Long id;
    private String nombre;
    private LocalDate fecha;
    private Integer estado;
    private Long cantidadProductosRelacionados;
}
