package com.herramientas.optica.modules.usuarios.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
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

    @Column(name = "cli_nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "cli_apellido_paterno", length = 255)
    private String apellidoPaterno;

    @Column(name = "cli_apellido_materno", length = 255)
    private String apellidoMaterno;

    @Column(name = "cli_correo", length = 255)
    private String correo;

    @Column(name = "cli_telefono", length = 255)
    private String telefono;

    @Column(name = "cli_direccion", nullable = false, length = 255)
    private String direccion;

    @Column(name = "cli_ndocumento", nullable = false, length = 20)
    private String numeroDocumento;

    @Column(name = "cli_estado", nullable = false)
    @Builder.Default
    private Integer estado = 1;

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