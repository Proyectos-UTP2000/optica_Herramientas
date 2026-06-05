package com.herramientas.optica.modules.ventas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.ventas.dto.VentaRequestDTO;
import com.herramientas.optica.modules.ventas.dto.VentaResponseDTO;
import com.herramientas.optica.modules.ventas.service.VentaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping
    public ResponseEntity<List<VentaResponseDTO>> listarVentas() {
        return ResponseEntity.ok(ventaService.listarVentas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponseDTO> buscarVenta(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<VentaResponseDTO> emitirVenta(@Valid @RequestBody VentaRequestDTO dto) {
        return new ResponseEntity<>(ventaService.emitirVenta(dto), HttpStatus.CREATED);
    }
}
