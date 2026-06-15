package com.herramientas.optica.modules.receta.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.herramientas.optica.modules.receta.dto.RecetaRequestDTO;
import com.herramientas.optica.modules.receta.dto.RecetaResponseDTO;
import com.herramientas.optica.modules.receta.service.RecetaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/recetas")
public class RecetaController {
    private final RecetaService service;

    public RecetaController(RecetaService service) {
        this.service = service;
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<RecetaResponseDTO>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(service.listarPorCliente(clienteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecetaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<RecetaResponseDTO> registrar(@Valid @RequestBody RecetaRequestDTO dto) {
        return new ResponseEntity<>(service.registrar(dto), HttpStatus.CREATED);
    }
}
