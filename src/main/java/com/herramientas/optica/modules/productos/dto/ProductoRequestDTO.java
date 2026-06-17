package com.herramientas.optica.modules.productos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.herramientas.optica.modules.productos.model.TipoProducto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProductoRequestDTO {
    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 255, message = "El nombre no debe superar 255 caracteres")
    private String nombre;

    @Size(max = 255, message = "El código no debe superar 255 caracteres")
    private String codigo;

    @Size(max = 255, message = "El modelo no debe superar 255 caracteres")
    private String modelo;

    @NotBlank(message = "La descripción del producto es obligatorio")
    @Size(max = 255, message = "La descripción no debe superar 255 caracteres")
    private String descripcion;

    @NotNull(message = "El precio del producto es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor que cero")
    private BigDecimal precio;

    @NotNull(message = "El costo del producto es obligatorio")
    @DecimalMin(value = "0.00", message = "El costo no puede ser negativo")
    private BigDecimal costo;

    @Future(message = "La fecha de vencimiento debe ser una fecha futura")
    private LocalDate fechaVencimiento;

    @JsonAlias("stock")
    @PositiveOrZero(message = "El stock inicial no puede ser negativo")
    private Integer stockInicial;

    @PositiveOrZero(message = "El stock mínimo no puede ser negativo")
    private Integer stockMinimo;

    @NotNull(message = "El tipo de producto es obligatorio")
    private TipoProducto tipoProducto;

    @NotNull(message = "La categoría es obligatoria")
    @Positive(message = "La categoría debe ser válida")
    private Long idCategoria;

    @NotNull(message = "La marca es obligatoria")
    @Positive(message = "La marca debe ser válida")
    private Long idMarca;

    @NotNull(message = "La unidad de venta es obligatoria")
    @Positive(message = "La unidad de venta debe ser válida")
    private Integer idUnidadVenta;

    @NotNull(message = "La unidad de compra es obligatoria")
    @Positive(message = "La unidad de compra debe ser válida")
    private Integer idUnidadCompra;

    @Positive(message = "El factor de conversión debe ser mayor que cero")
    private Integer factorConversion;

    private Boolean visibleWeb;
    private Boolean destacado;
    private String slug;
    private String descripcionWeb;
    private java.util.List<Long> idEtiquetas;
    private Integer orden;
    private java.util.List<ProductoImagenRequestDTO> imagenesConfig;
}
