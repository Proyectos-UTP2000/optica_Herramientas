package com.herramientas.optica.security.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository; 

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        
        // Obtenemos los conteos reales de la BD
        stats.put("totalUsuarios", empleadoRepository.count());
        stats.put("totalClientes", clienteRepository.count());
        
        // Dejamos un valor estático o 0 para productos para no romper el frontend
        stats.put("totalProductos", 0L); 
        
        return ResponseEntity.ok(stats);
    }
}