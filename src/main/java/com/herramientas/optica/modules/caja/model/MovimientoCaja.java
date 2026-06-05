package com.herramientas.optica.modules.caja.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.empleados.model.Empleado;

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
@Table(name = "movimiento_caja")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento_caja")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_caja", nullable = false)
    private Caja caja;

    @Enumerated(EnumType.STRING)
    @Column(name = "mov_tipo", nullable = false, length = 20)
    private TipoMovimientoCaja tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "mov_origen", nullable = false, length = 30)
    private OrigenMovimientoCaja origen;

    @Enumerated(EnumType.STRING)
    @Column(name = "mov_metodo_pago", nullable = false, length = 30)
    private MetodoPagoCaja metodoPago;

    @Column(name = "mov_monto", nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(name = "mov_descripcion", nullable = false, length = 500)
    private String descripcion;

    @Column(name = "mov_referencia_tipo", length = 50)
    private String referenciaTipo;

    @Column(name = "mov_referencia_id")
    private Long referenciaId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @Column(name = "mov_fecha", nullable = false)
    private LocalDateTime fecha;

    @Builder.Default
    @Column(name = "mov_anulado", nullable = false)
    private Boolean anulado = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
