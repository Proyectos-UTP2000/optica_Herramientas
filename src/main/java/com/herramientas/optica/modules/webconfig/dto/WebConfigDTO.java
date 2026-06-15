package com.herramientas.optica.modules.webconfig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebConfigDTO {
    private String logoUrl;
    private String telefonoContacto;
    private String correoContacto;
    private String direccion;
    private String horarioAtencion;
    private String enlaceFacebook;
    private String enlaceInstagram;
    private String enlaceTiktok;
    private List<CarouselImagenDTO> carouselImagenes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CarouselImagenDTO {
        private Long id;
        private String url;
        private Integer orden;
        private Integer fileIndex;
    }
}
