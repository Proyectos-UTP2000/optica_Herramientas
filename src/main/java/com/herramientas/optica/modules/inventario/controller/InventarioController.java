package com.herramientas.optica.modules.inventario.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.inventario.dto.AjusteInventarioRequestDTO;
import com.herramientas.optica.modules.inventario.dto.InventarioSaldoResponseDTO;
import com.herramientas.optica.modules.inventario.dto.MovimientoInventarioResponseDTO;
import com.herramientas.optica.modules.inventario.service.InventarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/inventario")
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @GetMapping("/saldos")
    public ResponseEntity<List<InventarioSaldoResponseDTO>> listarSaldos() {
        return ResponseEntity.ok(inventarioService.listarSaldos());
    }

    @GetMapping("/saldos/bajo-stock")
    public ResponseEntity<List<InventarioSaldoResponseDTO>> listarProductosBajoStock() {
        return ResponseEntity.ok(inventarioService.listarProductosBajoStock());
    }

    @GetMapping("/productos/{productoId}/saldo")
    public ResponseEntity<InventarioSaldoResponseDTO> obtenerSaldoPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioService.obtenerSaldoPorProducto(productoId));
    }

    @GetMapping("/productos/{productoId}/movimientos")
    public ResponseEntity<List<MovimientoInventarioResponseDTO>> listarMovimientosPorProducto(
            @PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioService.listarMovimientosPorProducto(productoId));
    }

    @PostMapping("/productos/{productoId}/ajustes/positivos")
    public ResponseEntity<MovimientoInventarioResponseDTO> ajustarStockPositivo(
            @PathVariable Long productoId,
            @Valid @RequestBody AjusteInventarioRequestDTO dto) {
        return new ResponseEntity<>(inventarioService.ajustarStockPositivo(productoId, dto), HttpStatus.CREATED);
    }

    @PostMapping("/productos/{productoId}/ajustes/negativos")
    public ResponseEntity<MovimientoInventarioResponseDTO> ajustarStockNegativo(
            @PathVariable Long productoId,
            @Valid @RequestBody AjusteInventarioRequestDTO dto) {
        return new ResponseEntity<>(inventarioService.ajustarStockNegativo(productoId, dto), HttpStatus.CREATED);
    }
}
