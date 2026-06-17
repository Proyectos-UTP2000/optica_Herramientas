package com.herramientas.optica.modules.webconfig.controller;

import com.herramientas.optica.modules.webconfig.dto.WebConfigDTO;
import com.herramientas.optica.modules.webconfig.service.WebConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/web-config")
public class WebConfigPublicController {

    private final WebConfigService webConfigService;

    public WebConfigPublicController(WebConfigService webConfigService) {
        this.webConfigService = webConfigService;
    }

    @GetMapping
    public ResponseEntity<WebConfigDTO> obtenerConfiguracionPublica() {
        return ResponseEntity.ok(webConfigService.obtenerConfiguracion());
    }
}
