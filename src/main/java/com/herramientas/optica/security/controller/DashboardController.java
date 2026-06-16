package com.herramientas.optica.security.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository; 
import com.herramientas.optica.modules.productos.repository.ProductoRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private com.herramientas.optica.security.service.DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        
        // Obtenemos los conteos reales de la BD
        stats.put("totalUsuarios", empleadoRepository.count());
        stats.put("totalClientes", clienteRepository.count());
        
        // Obtenemos el conteo real de productos
        stats.put("totalProductos", productoRepository.count()); 
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics")
    public ResponseEntity<com.herramientas.optica.security.dto.DashboardAnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(dashboardService.obtenerAnaliticas());
    }
}