package com.herramientas.optica.modules.compras.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.compras.dto.CompraRequestDTO;
import com.herramientas.optica.modules.compras.dto.CompraResponseDTO;
import com.herramientas.optica.modules.compras.service.CompraService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/compras")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @GetMapping
    public ResponseEntity<List<CompraResponseDTO>> listarCompras() {
        return ResponseEntity.ok(compraService.listarCompras());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraResponseDTO> buscarCompra(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CompraResponseDTO> registrarCompra(@Valid @RequestBody CompraRequestDTO dto) {
        return new ResponseEntity<>(compraService.registrarCompra(dto), HttpStatus.CREATED);
    }
}
