package com.herramientas.optica.modules.proveedores.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.proveedores.dto.ProveedorRequestDTO;
import com.herramientas.optica.modules.proveedores.dto.ProveedorResponseDTO;
import com.herramientas.optica.modules.proveedores.service.ProveedorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/proveedores")
public class ProveedorController {

    private final ProveedorService proveedorService;

    public ProveedorController(ProveedorService proveedorService) {
        this.proveedorService = proveedorService;
    }

    @GetMapping
    public ResponseEntity<List<ProveedorResponseDTO>> listarProveedores() {
        return ResponseEntity.ok(proveedorService.listarActivosEInactivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProveedorResponseDTO> buscarProveedor(@PathVariable Long id) {
        return ResponseEntity.ok(proveedorService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProveedorResponseDTO> crearProveedor(@Valid @RequestBody ProveedorRequestDTO dto) {
        ProveedorResponseDTO proveedor = proveedorService.crearProveedor(dto);
        return new ResponseEntity<>(proveedor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProveedorResponseDTO> actualizarProveedor(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorRequestDTO dto) {
        return ResponseEntity.ok(proveedorService.actualizarProveedor(id, dto));
    }

    @PatchMapping("/reactivar/{numeroDocumento}")
    public ResponseEntity<ProveedorResponseDTO> reactivarProveedor(@PathVariable String numeroDocumento) {
        return ResponseEntity.ok(proveedorService.reactivarProveedor(numeroDocumento));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ProveedorResponseDTO> cambiarEstado(@PathVariable Long id) {
        return ResponseEntity.ok(proveedorService.cambiarEstado(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProveedor(@PathVariable Long id) {
        proveedorService.borradoLogico(id);
        return ResponseEntity.noContent().build();
    }
}
