package com.herramientas.optica.modules.productos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.productos.dto.UnidadRequestDTO;
import com.herramientas.optica.modules.productos.dto.UnidadResponseDTO;
import com.herramientas.optica.modules.productos.service.UnidadService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/unidades")
@CrossOrigin(origins = "*")
public class UnidadController {

    private final UnidadService unidadService;

    public UnidadController(UnidadService unidadService) {
        this.unidadService = unidadService;
    }

    @GetMapping
    public ResponseEntity<List<UnidadResponseDTO>> listar() {
        return ResponseEntity.ok(unidadService.listarGestion());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<UnidadResponseDTO>> listarActivos() {
        return ResponseEntity.ok(unidadService.listarActivos());
    }

    @PostMapping
    public ResponseEntity<UnidadResponseDTO> crear(@Valid @RequestBody UnidadRequestDTO dto) {
        return new ResponseEntity<>(unidadService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnidadResponseDTO> actualizar(@PathVariable Integer id,
            @Valid @RequestBody UnidadRequestDTO dto) {
        return ResponseEntity.ok(unidadService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<UnidadResponseDTO> cambiarEstado(@PathVariable Integer id) {
        return ResponseEntity.ok(unidadService.cambiarEstado(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        unidadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
