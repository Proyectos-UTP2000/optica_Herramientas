package com.herramientas.optica.modules.productos.dto;

import java.math.BigDecimal;
import java.util.List;
import com.herramientas.optica.modules.productos.model.TipoProducto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductoPublicResponseDTO {
    private Long id;
    private String nombre;
    private String codigo;
    private String modelo;
    private String descripcion;
    private String descripcionWeb;
    private BigDecimal precio;
    private String slug;
    private TipoProducto tipoProducto;
    private String categoriaNombre;
    private String marcaNombre;
    private List<ProductoImagenResponseDTO> imagenes;
    private List<String> etiquetas;
    private Integer orden;
    private Boolean conStock;
    private Boolean destacado;
}
