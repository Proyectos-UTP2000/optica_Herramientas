package com.herramientas.optica.modules.webconfig.service;

import com.herramientas.optica.modules.productos.service.CloudinaryService;
import com.herramientas.optica.modules.webconfig.dto.WebConfigDTO;
import com.herramientas.optica.modules.webconfig.model.WebCarouselImagen;
import com.herramientas.optica.modules.webconfig.model.WebConfig;
import com.herramientas.optica.modules.webconfig.repository.WebCarouselImagenRepository;
import com.herramientas.optica.modules.webconfig.repository.WebConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class WebConfigService {

    private final WebConfigRepository webConfigRepository;
    private final WebCarouselImagenRepository webCarouselImagenRepository;
    private final CloudinaryService cloudinaryService;

    public WebConfigService(WebConfigRepository webConfigRepository,
                             WebCarouselImagenRepository webCarouselImagenRepository,
                             CloudinaryService cloudinaryService) {
        this.webConfigRepository = webConfigRepository;
        this.webCarouselImagenRepository = webCarouselImagenRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional(readOnly = true)
    public WebConfigDTO obtenerConfiguracion() {
        WebConfig config = webConfigRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Configuración web no encontrada"));
        return mapToDTO(config);
    }

    @Transactional
    public WebConfigDTO actualizarConfiguracion(WebConfigDTO dto, MultipartFile logoArchivo, List<MultipartFile> carruselArchivos) throws IOException {
        WebConfig config = webConfigRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Configuración web no encontrada"));

        // 1. Actualizar campos de texto
        config.setTelefonoContacto(dto.getTelefonoContacto());
        config.setCorreoContacto(dto.getCorreoContacto());
        config.setDireccion(dto.getDireccion());
        config.setHorarioAtencion(dto.getHorarioAtencion());
        config.setEnlaceFacebook(dto.getEnlaceFacebook());
        config.setEnlaceInstagram(dto.getEnlaceInstagram());
        config.setEnlaceTiktok(dto.getEnlaceTiktok());

        // 2. Subir nuevo logo si se proporciona
        if (logoArchivo != null && !logoArchivo.isEmpty()) {
            // Eliminar logo anterior de Cloudinary si existe
            if (config.getLogoUrl() != null) {
                String oldPublicId = extraerPublicId(config.getLogoUrl());
                if (oldPublicId != null) {
                    try {
                        cloudinaryService.eliminarImagen(oldPublicId);
                    } catch (Exception e) {
                        System.out.println("No se pudo eliminar el logo anterior de Cloudinary: " + e.getMessage());
                    }
                }
            }
            String logoUrl = cloudinaryService.subirImagen(logoArchivo, "web_config");
            config.setLogoUrl(logoUrl);
        } else if (dto.getLogoUrl() == null || dto.getLogoUrl().isEmpty()) {
            // Si el DTO manda el logo nulo/vacío, se interpreta como eliminación
            if (config.getLogoUrl() != null) {
                String oldPublicId = extraerPublicId(config.getLogoUrl());
                if (oldPublicId != null) {
                    try {
                        cloudinaryService.eliminarImagen(oldPublicId);
                    } catch (Exception e) {
                        System.out.println("No se pudo eliminar el logo anterior de Cloudinary: " + e.getMessage());
                    }
                }
            }
            config.setLogoUrl(null);
        }

        // 3. Gestionar imágenes del carrusel si se proporciona configuración
        if (dto.getCarouselImagenes() != null) {
            List<WebCarouselImagen> existingImages = config.getCarouselImagenes();

            // Identificar cuáles IDs ya no vienen en el DTO (fueron eliminadas)
            Set<Long> dtoIds = dto.getCarouselImagenes().stream()
                    .map(WebConfigDTO.CarouselImagenDTO::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            List<WebCarouselImagen> toDelete = existingImages.stream()
                    .filter(img -> !dtoIds.contains(img.getId()))
                    .collect(Collectors.toList());

            // Eliminar de BD y Cloudinary
            for (WebCarouselImagen img : toDelete) {
                String publicId = extraerPublicId(img.getUrl());
                if (publicId != null) {
                    try {
                        cloudinaryService.eliminarImagen(publicId);
                    } catch (Exception e) {
                        System.out.println("No se pudo eliminar imagen del carrusel de Cloudinary: " + e.getMessage());
                    }
                }
                config.getCarouselImagenes().remove(img);
                webCarouselImagenRepository.delete(img);
            }

            // Actualizar orden de imágenes existentes
            for (WebConfigDTO.CarouselImagenDTO imgDto : dto.getCarouselImagenes()) {
                if (imgDto.getId() != null) {
                    existingImages.stream()
                            .filter(img -> img.getId().equals(imgDto.getId()))
                            .findFirst()
                            .ifPresent(img -> {
                                img.setOrden(imgDto.getOrden() != null ? imgDto.getOrden() : 0);
                            });
                }
            }

            // Subir y agregar nuevas imágenes
            for (WebConfigDTO.CarouselImagenDTO imgDto : dto.getCarouselImagenes()) {
                if (imgDto.getId() == null) {
                    Integer fileIdx = imgDto.getFileIndex();
                    if (fileIdx != null && carruselArchivos != null && fileIdx >= 0 && fileIdx < carruselArchivos.size()) {
                        MultipartFile file = carruselArchivos.get(fileIdx);
                        if (file != null && !file.isEmpty()) {
                            String url = cloudinaryService.subirImagen(file, "web_config/carrusel");
                            WebCarouselImagen newImg = WebCarouselImagen.builder()
                                    .webConfig(config)
                                    .url(url)
                                    .orden(imgDto.getOrden() != null ? imgDto.getOrden() : 0)
                                    .build();
                            config.getCarouselImagenes().add(newImg);
                        }
                    }
                }
            }
        }

        WebConfig saved = webConfigRepository.save(config);
        return mapToDTO(saved);
    }

    private WebConfigDTO mapToDTO(WebConfig config) {
        List<WebConfigDTO.CarouselImagenDTO> imgs = config.getCarouselImagenes().stream()
                .map(img -> WebConfigDTO.CarouselImagenDTO.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .orden(img.getOrden())
                        .build())
                .collect(Collectors.toList());

        return WebConfigDTO.builder()
                .logoUrl(config.getLogoUrl())
                .telefonoContacto(config.getTelefonoContacto())
                .correoContacto(config.getCorreoContacto())
                .direccion(config.getDireccion())
                .horarioAtencion(config.getHorarioAtencion())
                .enlaceFacebook(config.getEnlaceFacebook())
                .enlaceInstagram(config.getEnlaceInstagram())
                .enlaceTiktok(config.getEnlaceTiktok())
                .carouselImagenes(imgs)
                .build();
    }

    private String extraerPublicId(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        try {
            int uploadIdx = url.indexOf("/image/upload/");
            if (uploadIdx == -1) {
                return null;
            }
            String path = url.substring(uploadIdx + "/image/upload/".length());
            if (path.startsWith("v")) {
                int firstSlash = path.indexOf('/');
                if (firstSlash != -1) {
                    String versionStr = path.substring(1, firstSlash);
                    if (versionStr.matches("\\d+")) {
                        path = path.substring(firstSlash + 1);
                    }
                }
            }
            int lastDotIdx = path.lastIndexOf('.');
            if (lastDotIdx != -1) {
                path = path.substring(0, lastDotIdx);
            }
            return path;
        } catch (Exception e) {
            return null;
        }
    }
}
