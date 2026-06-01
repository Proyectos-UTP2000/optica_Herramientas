package com.herramientas.optica.modules.inventario.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.productos.model.Producto;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movimiento_inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento_inventario")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Enumerated(EnumType.STRING)
    @Column(name = "mov_tipo", nullable = false, length = 30)
    private TipoMovimientoInventario tipo;

    @Column(name = "mov_cantidad", nullable = false, precision = 12, scale = 3)
    private BigDecimal cantidad;

    @Column(name = "mov_stock_previo", nullable = false, precision = 12, scale = 3)
    private BigDecimal stockPrevio;

    @Column(name = "mov_stock_nuevo", nullable = false, precision = 12, scale = 3)
    private BigDecimal stockNuevo;

    @Column(name = "mov_motivo", nullable = false, length = 500)
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "mov_referencia_tipo", nullable = false, length = 50)
    private ReferenciaInventario referenciaTipo;

    @Column(name = "mov_referencia_id")
    private Long referenciaId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empleado")
    private Empleado empleado;

    @Column(name = "mov_fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
