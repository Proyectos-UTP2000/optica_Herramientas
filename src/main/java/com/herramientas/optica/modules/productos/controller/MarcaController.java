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

import com.herramientas.optica.modules.productos.dto.MarcaRequestDTO;
import com.herramientas.optica.modules.productos.dto.MarcaResponseDTO;
import com.herramientas.optica.modules.productos.service.MarcaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/marcas")
@CrossOrigin(origins = "*")
public class MarcaController {

    private final MarcaService marcaService;

    public MarcaController(MarcaService marcaService) {
        this.marcaService = marcaService;
    }

    @GetMapping
    public ResponseEntity<List<MarcaResponseDTO>> listar() {
        return ResponseEntity.ok(marcaService.listarGestion());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<MarcaResponseDTO>> listarActivos() {
        return ResponseEntity.ok(marcaService.listarActivos());
    }

    @PostMapping
    public ResponseEntity<MarcaResponseDTO> crear(@Valid @RequestBody MarcaRequestDTO dto) {
        return new ResponseEntity<>(marcaService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarcaResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody MarcaRequestDTO dto) {
        return ResponseEntity.ok(marcaService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<MarcaResponseDTO> cambiarEstado(@PathVariable Long id) {
        return ResponseEntity.ok(marcaService.cambiarEstado(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        marcaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
