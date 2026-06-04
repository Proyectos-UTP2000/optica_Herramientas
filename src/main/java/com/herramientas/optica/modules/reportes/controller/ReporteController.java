package com.herramientas.optica.modules.reportes.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.caja.dto.CajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.ReporteDiarioCajaResponseDTO;
import com.herramientas.optica.modules.caja.model.EstadoCaja;
import com.herramientas.optica.modules.caja.service.CajaService;
import com.herramientas.optica.modules.compras.dto.CompraResponseDTO;
import com.herramientas.optica.modules.compras.service.CompraService;
import com.herramientas.optica.modules.reportes.dto.ReporteCajaDetalleResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteCajaResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteCompraProveedorResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteKardexResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteVentaFechaResponseDTO;
import com.herramientas.optica.modules.reportes.service.ReporteService;
import com.herramientas.optica.modules.ventas.dto.VentaResponseDTO;
import com.herramientas.optica.modules.ventas.model.MedioPagoVenta;
import com.herramientas.optica.modules.ventas.service.VentaService;

@RestController
@RequestMapping("/api/v1/reportes")
public class ReporteController {

    private final ReporteService reporteService;
    private final CajaService cajaService;
    private final VentaService ventaService;
    private final CompraService compraService;

    public ReporteController(ReporteService reporteService, CajaService cajaService, VentaService ventaService,
            CompraService compraService) {
        this.reporteService = reporteService;
        this.cajaService = cajaService;
        this.ventaService = ventaService;
        this.compraService = compraService;
    }

    @GetMapping("/caja-diaria/actual")
    public ResponseEntity<ReporteDiarioCajaResponseDTO> obtenerCajaDiariaActual(@RequestParam Long empleadoId) {
        CajaResponseDTO caja = cajaService.obtenerCajaActual(empleadoId);
        return ResponseEntity.ok(cajaService.obtenerReporteDiario(caja.getId()));
    }

    @GetMapping("/caja")
    public ResponseEntity<ReporteCajaResponseDTO> obtenerCajas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long empleadoId,
            @RequestParam(required = false) EstadoCaja estado) {
        return ResponseEntity.ok(reporteService.obtenerCajas(desde, hasta, empleadoId, estado));
    }

    @GetMapping("/caja/{id}")
    public ResponseEntity<ReporteCajaDetalleResponseDTO> obtenerDetalleCaja(@PathVariable Long id) {
        return ResponseEntity.ok(reporteService.obtenerDetalleCaja(id));
    }

    @GetMapping("/ventas")
    public ResponseEntity<ReporteVentaFechaResponseDTO> obtenerVentasPorFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long empleadoId,
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) String producto,
            @RequestParam(required = false) String numeroVenta,
            @RequestParam(required = false) MedioPagoVenta medioPago) {
        return ResponseEntity.ok(reporteService.obtenerVentas(desde, hasta, empleadoId, texto, producto, numeroVenta,
                medioPago));
    }

    @GetMapping("/ventas/{id}")
    public ResponseEntity<VentaResponseDTO> obtenerDetalleVenta(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.buscarPorId(id));
    }

    @GetMapping("/compras")
    public ResponseEntity<ReporteCompraProveedorResponseDTO> obtenerComprasPorProveedor(
            @RequestParam(required = false) String proveedor,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(reporteService.obtenerCompras(proveedor, desde, hasta));
    }

    @GetMapping("/compras/{id}")
    public ResponseEntity<CompraResponseDTO> obtenerDetalleCompra(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.buscarPorId(id));
    }

    @GetMapping("/kardex")
    public ResponseEntity<ReporteKardexResponseDTO> obtenerKardex(
            @RequestParam Long productoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(reporteService.obtenerKardex(productoId, desde, hasta));
    }
}
