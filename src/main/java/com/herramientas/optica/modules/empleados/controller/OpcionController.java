package com.herramientas.optica.modules.empleados.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.empleados.dto.OpcionRequestDTO;
import com.herramientas.optica.modules.empleados.dto.OpcionResponseDTO;
import com.herramientas.optica.modules.empleados.service.OpcionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/opciones")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OpcionController {

    private final OpcionService opcionService;

    @GetMapping
    public ResponseEntity<List<OpcionResponseDTO>> listarOpciones() {
        return ResponseEntity.ok(opcionService.listarTodas());
    }

    @PutMapping("/{id}/estructura")
    public ResponseEntity<OpcionResponseDTO> actualizarEstructura(
            @PathVariable Long id, 
            @Valid @RequestBody OpcionRequestDTO dto) {
        return ResponseEntity.ok(opcionService.actualizarEstructura(id, dto));
    }

    @PostMapping("/init-defaults")
    public ResponseEntity<String> initDefaults() {
        return ResponseEntity.ok(opcionService.initDefaults());
    }
}
