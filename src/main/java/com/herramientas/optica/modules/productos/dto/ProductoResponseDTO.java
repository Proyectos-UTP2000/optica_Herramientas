package com.herramientas.optica.modules.productos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.productos.model.TipoProducto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductoResponseDTO {
    private Long id;
    private String nombre;
    private String codigo;
    private String modelo;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal costo;
    private LocalDate fechaCreacion;
    private LocalDate fechaVencimiento;
    private Integer stock;
    private Integer stockMinimo;
    private Integer estado;
    private TipoProducto tipoProducto;

    private Long idCategoria;
    private String categoriaNombre;

    private Long idMarca;
    private String marcaNombre;

    private Integer idUnidadVenta;
    private String unidadVentaNombre;

    private Integer idUnidadCompra;
    private String unidadCompraNombre;

    private Integer factorConversion;

    private java.util.List<String> rutasImagenes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
