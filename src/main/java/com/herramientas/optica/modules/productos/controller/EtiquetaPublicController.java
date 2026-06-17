package com.herramientas.optica.modules.productos.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.herramientas.optica.modules.productos.dto.EtiquetaResponseDTO;
import com.herramientas.optica.modules.productos.service.EtiquetaService;

@RestController
@RequestMapping("/api/v1/public/etiquetas")
public class EtiquetaPublicController {

    private final EtiquetaService etiquetaService;

    public EtiquetaPublicController(EtiquetaService etiquetaService) {
        this.etiquetaService = etiquetaService;
    }

    @GetMapping
    public ResponseEntity<List<EtiquetaResponseDTO>> listarActivos() {
        return ResponseEntity.ok(etiquetaService.listarActivos());
    }
}
