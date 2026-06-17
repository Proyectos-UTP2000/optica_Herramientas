package com.herramientas.optica.modules.clientes.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;

    @Column(name = "cli_nombre", length = 100)
    private String nombre;

    @Column(name = "cli_apellido_paterno", length = 255)
    private String apellidoPaterno;

    @Column(name = "cli_apellido_materno", length = 255)
    private String apellidoMaterno;

    @Column(name = "cli_nombre_empresa", length = 100)
    private String nombreEmpresa;

    @Column(name = "cli_direccion_empresa", length = 100)
    private String direccionEmpresa;

    @Column(name = "cli_correo", length = 255)
    private String correo;

    @Column(name = "cli_telefono", length = 255)
    private String telefono;

    @Column(name = "cli_direccion", nullable = false, length = 255)
    private String direccion;

    @Column(name = "cli_ndocumento", nullable = false, length = 20)
    private String numeroDocumento;

    @Builder.Default
    @Column(name = "cli_estado", nullable = false)
    private Integer estado = 1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipodocumento", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "cli_contrasena", length = 255)
    private String contrasena;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "cli_reset_codigo", length = 6)
    private String resetCodigo;

    @Column(name = "cli_reset_expiracion")
    private LocalDateTime resetExpiracion;

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
