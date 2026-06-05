package com.herramientas.optica.modules.caja.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.caja.dto.AperturaCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.CajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.CierreCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.GastoRequestDTO;
import com.herramientas.optica.modules.caja.dto.GastoResponseDTO;
import com.herramientas.optica.modules.caja.dto.MovimientoCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.MovimientoCajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.ReporteDiarioCajaResponseDTO;
import com.herramientas.optica.modules.caja.service.CajaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/cajas")
public class CajaController {

    private final CajaService cajaService;

    public CajaController(CajaService cajaService) {
        this.cajaService = cajaService;
    }

    @PostMapping("/aperturas")
    public ResponseEntity<CajaResponseDTO> abrirCaja(@Valid @RequestBody AperturaCajaRequestDTO dto) {
        return new ResponseEntity<>(cajaService.abrirCaja(dto), HttpStatus.CREATED);
    }

    @GetMapping("/actual")
    public ResponseEntity<CajaResponseDTO> obtenerCajaActual(@RequestParam Long empleadoId) {
        return ResponseEntity.ok(cajaService.obtenerCajaActual(empleadoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CajaResponseDTO> buscarCaja(@PathVariable Long id) {
        return ResponseEntity.ok(cajaService.buscarCaja(id));
    }

    @GetMapping("/{id}/reporte-diario")
    public ResponseEntity<ReporteDiarioCajaResponseDTO> obtenerReporteDiario(@PathVariable Long id) {
        return ResponseEntity.ok(cajaService.obtenerReporteDiario(id));
    }

    @GetMapping("/{id}/movimientos")
    public ResponseEntity<List<MovimientoCajaResponseDTO>> listarMovimientos(@PathVariable Long id) {
        return ResponseEntity.ok(cajaService.listarMovimientos(id));
    }

    @PostMapping("/{id}/movimientos")
    public ResponseEntity<MovimientoCajaResponseDTO> registrarMovimiento(
            @PathVariable Long id,
            @Valid @RequestBody MovimientoCajaRequestDTO dto) {
        return new ResponseEntity<>(cajaService.registrarMovimiento(id, dto), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/gastos")
    public ResponseEntity<GastoResponseDTO> registrarGasto(
            @PathVariable Long id,
            @Valid @RequestBody GastoRequestDTO dto) {
        return new ResponseEntity<>(cajaService.registrarGasto(id, dto), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/cierres")
    public ResponseEntity<CajaResponseDTO> cerrarCaja(
            @PathVariable Long id,
            @Valid @RequestBody CierreCajaRequestDTO dto) {
        return ResponseEntity.ok(cajaService.cerrarCaja(id, dto));
    }
}
