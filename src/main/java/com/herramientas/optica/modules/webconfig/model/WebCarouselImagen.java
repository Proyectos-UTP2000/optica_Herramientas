package com.herramientas.optica.modules.webconfig.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "web_carousel_imagen")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebCarouselImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_web_carousel_imagen")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_web_config", nullable = false)
    @ToString.Exclude
    private WebConfig webConfig;

    @Column(name = "imag_url", nullable = false, length = 500)
    private String url;

    @Builder.Default
    @Column(name = "imag_orden", nullable = false)
    private Integer orden = 0;
}
