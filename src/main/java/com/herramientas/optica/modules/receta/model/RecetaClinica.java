package com.herramientas.optica.modules.receta.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.*;
import lombok.*;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.empleados.model.Empleado;

@Entity
@Table(name = "receta_clinica")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecetaClinica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_receta")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @Column(name = "fecha_evaluacion", nullable = false)
    private LocalDateTime fechaEvaluacion;

    @Column(name = "od_esfera", precision = 5, scale = 2)
    private BigDecimal odEsfera;

    @Column(name = "od_cilindro", precision = 5, scale = 2)
    private BigDecimal odCilindro;

    @Column(name = "od_eje")
    private Integer odEje;

    @Column(name = "od_av_lejos", length = 50)
    private String odAvLejos;

    @Column(name = "od_av_cerca", length = 50)
    private String odAvCerca;

    @Column(name = "oi_esfera", precision = 5, scale = 2)
    private BigDecimal oiEsfera;

    @Column(name = "oi_cilindro", precision = 5, scale = 2)
    private BigDecimal oiCilindro;

    @Column(name = "oi_eje")
    private Integer oiEje;

    @Column(name = "oi_av_lejos", length = 50)
    private String oiAvLejos;

    @Column(name = "oi_av_cerca", length = 50)
    private String oiAvCerca;

    @Column(name = "distancia_pupilar", precision = 5, scale = 2)
    private BigDecimal distanciaPupilar;

    @Column(name = "adicion", precision = 5, scale = 2)
    private BigDecimal adicion;

    @Column(name = "tipo_luna", length = 100)
    private String tipoLuna;

    @Column(name = "material_sugerido", length = 100)
    private String materialSugerido;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "receta_tratamiento", joinColumns = @JoinColumn(name = "id_receta"))
    @Column(name = "tratamiento")
    @Builder.Default
    private Set<String> tratamientos = new HashSet<>();

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.fechaEvaluacion == null) {
            this.fechaEvaluacion = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
