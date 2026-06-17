package com.herramientas.optica.modules.laboratorio.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.herramientas.optica.modules.laboratorio.model.EstadoOrden;
import com.herramientas.optica.modules.laboratorio.dto.ActualizarEstadoOrdenDTO;
import com.herramientas.optica.modules.laboratorio.dto.OrdenLaboratorioResponseDTO;
import com.herramientas.optica.modules.laboratorio.service.OrdenLaboratorioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/ordenes-laboratorio")
public class OrdenLaboratorioController {
    private final OrdenLaboratorioService service;

    public OrdenLaboratorioController(OrdenLaboratorioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<OrdenLaboratorioResponseDTO>> listarTodas(
            @RequestParam(required = false) EstadoOrden estado) {
        return ResponseEntity.ok(service.listarTodas(estado));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<OrdenLaboratorioResponseDTO>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(service.listarPorCliente(clienteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenLaboratorioResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<OrdenLaboratorioResponseDTO> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoOrdenDTO dto) {
        return ResponseEntity.ok(service.actualizarEstado(id, dto));
    }
}
