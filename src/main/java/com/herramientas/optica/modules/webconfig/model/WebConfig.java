package com.herramientas.optica.modules.webconfig.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "web_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_web_config")
    private Long id;

    @Column(name = "web_logo_url", length = 500)
    private String logoUrl;

    @Column(name = "web_telefono_contacto", length = 50)
    private String telefonoContacto;

    @Column(name = "web_correo_contacto", length = 100)
    private String correoContacto;

    @Column(name = "web_direccion", length = 255)
    private String direccion;

    @Column(name = "web_horario_atencion", length = 255)
    private String horarioAtencion;

    @Column(name = "web_enlace_facebook", length = 255)
    private String enlaceFacebook;

    @Column(name = "web_enlace_instagram", length = 255)
    private String enlaceInstagram;

    @Column(name = "web_enlace_tiktok", length = 255)
    private String enlaceTiktok;

    @OneToMany(mappedBy = "webConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    @OrderBy("orden ASC")
    @ToString.Exclude
    private List<WebCarouselImagen> carouselImagenes = new ArrayList<>();

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
