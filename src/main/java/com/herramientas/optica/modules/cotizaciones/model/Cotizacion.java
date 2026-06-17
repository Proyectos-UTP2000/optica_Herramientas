package com.herramientas.optica.modules.cotizaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cotizacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cotizacion")
    private Long id;

    @Column(name = "coti_cliente_nombre", nullable = false, length = 150)
    private String clienteNombre;

    @Column(name = "coti_cliente_documento", length = 20)
    private String clienteDocumento;

    @Column(name = "coti_cliente_telefono", length = 50)
    private String clienteTelefono;

    @Column(name = "coti_cliente_correo", length = 100)
    private String clienteCorreo;

    @Column(name = "coti_total_estimado", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalEstimado;

    @Builder.Default
    @Column(name = "coti_estado", nullable = false, length = 30)
    private String estado = "PENDIENTE";

    @Column(name = "coti_fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "coti_observaciones", length = 500)
    private String observaciones;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente_usuario")
    private com.herramientas.optica.modules.clientes.model.Cliente clienteUsuario;

    @Column(name = "coti_direccion", length = 255)
    private String direccion;

    @OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    @ToString.Exclude
    private List<CotizacionDetalle> detalles = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
