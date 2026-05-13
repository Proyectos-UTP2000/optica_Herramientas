package com.herramientas.optica.modules.productos.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long id;

    @Column(name = "produc_nombre", nullable = false, length = 255)
    private String nombre;

    @Column(name = "produc_codigo", unique = true, length = 255)
    private String codigo;

    @Column(name = "produc_modelo", length = 255)
    private String modelo;

    @Column(name = "produc_descripcion", nullable = false, length = 255)
    private String descripcion;

    @Column(name = "produc_precio", precision = 38, scale = 2)
    private BigDecimal precio;

    @Column(name = "produc_costo", precision = 10, scale = 2)
    private BigDecimal costo;

    @Column(name = "produc_fecha_creacion")
    private LocalDate fechaCreacion;

    @Column(name = "produc_fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Builder.Default
    @Column(name = "produc_stock")
    private Integer stock = 0;

    @Builder.Default
    @Column(name = "produc_stock_minimo")
    private Integer stockMinimo = 1;

    @Builder.Default
    @Column(name = "produc_estado", nullable = false)
    private Integer estado = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_producto", nullable = false)
    private TipoProducto tipoProducto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_marca", nullable = false)
    private Marca marca;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_unidad_venta", nullable = false)
    private Unidad unidadVenta;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_unidad_compra", nullable = false)
    private Unidad unidadCompra;

    @Builder.Default
    @Column(name = "produc_factor_conversion", nullable = false)
    private Integer factorConversion = 1;

    @Builder.Default
    @jakarta.persistence.OneToMany(mappedBy = "producto", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ProductoImagen> imagenes = new java.util.ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
