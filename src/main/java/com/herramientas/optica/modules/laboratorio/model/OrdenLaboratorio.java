package com.herramientas.optica.modules.laboratorio.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;
import com.herramientas.optica.modules.ventas.model.Venta;
import com.herramientas.optica.modules.receta.model.RecetaClinica;

@Entity
@Table(name = "orden_laboratorio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenLaboratorio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_venta", nullable = false)
    private Venta venta;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_receta", nullable = false)
    private RecetaClinica recetaClinica;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_orden", nullable = false)
    @Builder.Default
    private EstadoOrden estadoOrden = EstadoOrden.PENDIENTE;

    @Column(name = "fecha_promesa_entrega")
    private LocalDate fechaPromesaEntrega;

    @Column(name = "laboratorio_nombre", length = 150)
    private String laboratorioNombre;

    @Column(name = "notas", columnDefinition = "TEXT")
    private String notas;

    @Column(name = "created_at")
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
