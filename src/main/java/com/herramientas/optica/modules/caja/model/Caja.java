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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "caja")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Caja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_caja")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @Column(name = "caja_fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "caja_fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "caja_monto_inicial", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoInicial;

    @Column(name = "caja_monto_esperado", precision = 12, scale = 2)
    private BigDecimal montoEsperado;

    @Column(name = "caja_monto_real", precision = 12, scale = 2)
    private BigDecimal montoReal;

    @Column(name = "caja_diferencia", precision = 12, scale = 2)
    private BigDecimal diferencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "caja_estado", nullable = false, length = 20)
    private EstadoCaja estado;

    @Column(name = "caja_observaciones", length = 500)
    private String observaciones;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
