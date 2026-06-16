package com.herramientas.optica.modules.empleados.controller;

import com.herramientas.optica.modules.empleados.dto.EmpleadoRequestDTO;
import com.herramientas.optica.modules.empleados.dto.EmpleadoResponseDTO;
import com.herramientas.optica.modules.empleados.service.EmpleadoService;
import com.herramientas.optica.modules.shared.dto.CambiarContrasenaRequestDTO;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/empleados")
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
    public ResponseEntity<EmpleadoResponseDTO> crearEmpleado(
        @Valid @RequestBody EmpleadoRequestDTO dto
    ) {
        EmpleadoResponseDTO nuevoEmpleado = empleadoService.crearEmpleado(dto);
        return new ResponseEntity<>(nuevoEmpleado, HttpStatus.CREATED);
    }

    @PatchMapping("/reactivar/{dni}")
    public ResponseEntity<EmpleadoResponseDTO> reactivarEmpleado(
        @PathVariable String dni
    ) {
        EmpleadoResponseDTO empleadoReactivado =
            empleadoService.reactivarEmpleado(dni);
        return ResponseEntity.ok(empleadoReactivado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpleadoResponseDTO> buscarEmpleado(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(empleadoService.buscarPorId(id));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<EmpleadoResponseDTO> cambiarEstado(
        @PathVariable Long id
    ) {
        EmpleadoResponseDTO empleadoActualizado = empleadoService.cambiarEstado(
            id
        );
        return ResponseEntity.ok(empleadoActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable Long id) {
        empleadoService.borradoLogico(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpleadoResponseDTO> actualizarEmpleado(
        @PathVariable Long id,
        @Valid @RequestBody EmpleadoRequestDTO dto
    ) {
        EmpleadoResponseDTO actualizado = empleadoService.actualizarEmpleado(
            id,
            dto
        );
        return ResponseEntity.ok(actualizado);
    }

    @PutMapping("/perfil/contrasena")
    public ResponseEntity<?> cambiarContrasena(
        @Valid @RequestBody CambiarContrasenaRequestDTO dto
    ) {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        empleadoService.cambiarContrasena(username, dto);
        return ResponseEntity.ok(
            java.util.Map.of("message", "Contraseña cambiada exitosamente.")
        );
    }
}
