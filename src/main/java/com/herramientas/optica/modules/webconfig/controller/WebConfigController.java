package com.herramientas.optica.modules.webconfig.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.herramientas.optica.modules.webconfig.dto.WebConfigDTO;
import com.herramientas.optica.modules.webconfig.service.WebConfigService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/contenido-web")
public class WebConfigController {

    private final WebConfigService webConfigService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    public WebConfigController(WebConfigService webConfigService, Validator validator) {
        this.webConfigService = webConfigService;
        this.objectMapper = new ObjectMapper().findAndRegisterModules();
        this.validator = validator;
    }

    @GetMapping
    public ResponseEntity<WebConfigDTO> obtenerConfiguracion() {
        return ResponseEntity.ok(webConfigService.obtenerConfiguracion());
    }

    @PutMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<WebConfigDTO> actualizar(
            @RequestPart("config") String configJson,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile,
            @RequestPart(value = "carrusel", required = false) List<MultipartFile> carruselArchivos) throws Exception {

        WebConfigDTO dto = leerYValidarConfig(configJson);
        return ResponseEntity.ok(webConfigService.actualizarConfiguracion(dto, logoFile, carruselArchivos));
    }

    private WebConfigDTO leerYValidarConfig(String json) throws Exception {
        WebConfigDTO dto = objectMapper.readValue(json, WebConfigDTO.class);
        Set<ConstraintViolation<WebConfigDTO>> errores = validator.validate(dto);
        if (!errores.isEmpty()) {
            throw new ConstraintViolationException(errores);
        }
        return dto;
    }
}
