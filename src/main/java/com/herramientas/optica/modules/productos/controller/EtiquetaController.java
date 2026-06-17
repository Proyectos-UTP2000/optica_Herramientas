package com.herramientas.optica.modules.productos.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.herramientas.optica.modules.productos.dto.EtiquetaRequestDTO;
import com.herramientas.optica.modules.productos.dto.EtiquetaResponseDTO;
import com.herramientas.optica.modules.productos.service.EtiquetaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/etiquetas")
public class EtiquetaController {

    private final EtiquetaService etiquetaService;

    public EtiquetaController(EtiquetaService etiquetaService) {
        this.etiquetaService = etiquetaService;
    }

    @GetMapping
    public ResponseEntity<List<EtiquetaResponseDTO>> listar() {
        return ResponseEntity.ok(etiquetaService.listarTodos());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<EtiquetaResponseDTO>> listarActivos() {
        return ResponseEntity.ok(etiquetaService.listarActivos());
    }

    @PostMapping
    public ResponseEntity<EtiquetaResponseDTO> crear(@Valid @RequestBody EtiquetaRequestDTO dto) {
        return new ResponseEntity<>(etiquetaService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EtiquetaResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody EtiquetaRequestDTO dto) {
        return ResponseEntity.ok(etiquetaService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<EtiquetaResponseDTO> cambiarEstado(@PathVariable Long id) {
        return ResponseEntity.ok(etiquetaService.cambiarEstado(id));
    }

    @PatchMapping("/cambiar-estado/{id}")
    public ResponseEntity<EtiquetaResponseDTO> cambiarEstadoTabla(@PathVariable Long id) {
        return ResponseEntity.ok(etiquetaService.cambiarEstado(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        etiquetaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
