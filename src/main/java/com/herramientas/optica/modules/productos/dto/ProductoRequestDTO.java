package com.herramientas.optica.modules.productos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.herramientas.optica.modules.productos.model.TipoProducto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductoRequestDTO {
    @NotBlank(message = "El nombre del producto es obligatorio")
    private String nombre;

    private String codigo;

    private String modelo;

    @NotBlank(message = "La descripción del producto es obligatorio")
    private String descripcion;

    private BigDecimal precio;
    private BigDecimal costo;
    private LocalDate fechaVencimiento;
    private Integer stock;
    private Integer stockMinimo;

    @NotNull(message = "El tipo de producto es obligatorio")
    private TipoProducto tipoProducto;

    @NotNull(message = "La categoría es obligatoria")
    private Long idCategoria;

    @NotNull(message = "La marca es obligatoria")
    private Long idMarca;

    @NotNull(message = "La unidad de venta es obligatoria")
    private Integer idUnidadVenta;

    @NotNull(message = "La unidad de compra es obligatoria")
    private Integer idUnidadCompra;

    private Integer factorConversion;

    private java.util.List<String> rutasImagenes;
}
