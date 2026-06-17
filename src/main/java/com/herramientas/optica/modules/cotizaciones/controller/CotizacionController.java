package com.herramientas.optica.modules.cotizaciones.controller;

import com.herramientas.optica.modules.cotizaciones.dto.CotizacionDTO;
import com.herramientas.optica.modules.cotizaciones.service.CotizacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cotizaciones")
public class CotizacionController {

    private final CotizacionService cotizacionService;

    public CotizacionController(CotizacionService cotizacionService) {
        this.cotizacionService = cotizacionService;
    }

    @GetMapping
    public ResponseEntity<List<CotizacionDTO>> listarTodas() {
        return ResponseEntity.ok(cotizacionService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CotizacionDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cotizacionService.obtenerPorId(id));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<CotizacionDTO> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isEmpty()) {
            throw new IllegalArgumentException("El estado es obligatorio");
        }
        return ResponseEntity.ok(cotizacionService.actualizarEstado(id, nuevoEstado));
    }
}
