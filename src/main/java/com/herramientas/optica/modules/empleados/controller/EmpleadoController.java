package com.herramientas.optica.modules.empleados.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.empleados.dto.EmpleadoRequestDTO;
import com.herramientas.optica.modules.empleados.dto.EmpleadoResponseDTO;
import com.herramientas.optica.modules.empleados.service.EmpleadoService;

@RestController
@RequestMapping("/api/v1/empleados")
@CrossOrigin(origins = "*")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    public EmpleadoController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    @GetMapping
    public ResponseEntity<List<EmpleadoResponseDTO>> listarEmpleados() {
        return ResponseEntity.ok(empleadoService.listarActivosEInactivos());
    }

    @PostMapping
    public ResponseEntity<EmpleadoResponseDTO> crearEmpleado(@RequestBody EmpleadoRequestDTO dto) {
        EmpleadoResponseDTO nuevoEmpleado = empleadoService.crearEmpleado(dto);
        return new ResponseEntity<>(nuevoEmpleado, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpleadoResponseDTO> buscarEmpleado(@PathVariable Long id) {
        return ResponseEntity.ok(empleadoService.buscarPorId(id));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<EmpleadoResponseDTO> cambiarEstado(@PathVariable Long id) {
        EmpleadoResponseDTO empleadoActualizado = empleadoService.cambiarEstado(id);
        return ResponseEntity.ok(empleadoActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable Long id) {
        empleadoService.borradoLogico(id);
        return ResponseEntity.noContent().build();
    }
}