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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.empleados.dto.PerfilRequestDTO;
import com.herramientas.optica.modules.empleados.dto.PerfilResponseDTO;
import com.herramientas.optica.modules.empleados.service.PerfilService;

@RestController
@RequestMapping("/api/v1/perfiles")
@CrossOrigin(origins = "*")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public ResponseEntity<List<PerfilResponseDTO>> listarTodos() {
        return ResponseEntity.ok(perfilService.listarPerfiles());
    }

    @PostMapping
    public ResponseEntity<PerfilResponseDTO> crearPerfil(@RequestBody PerfilRequestDTO dto) {
        PerfilResponseDTO nuevo = perfilService.crearPerfil(dto);
        return new ResponseEntity<>(nuevo, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/opciones")
    public ResponseEntity<PerfilResponseDTO> actualizarAccesos(
            @PathVariable Long id,
            @RequestBody List<Long> idsOpciones) {

        PerfilResponseDTO perfilActualizado = perfilService.actualizarOpcionesDePerfil(id, idsOpciones);
        return ResponseEntity.ok(perfilActualizado);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<PerfilResponseDTO> cambiarEstado(@PathVariable Long id) {
        return ResponseEntity.ok(perfilService.cambiarEstado(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPerfil(@PathVariable Long id) {
        perfilService.borradoLogico(id);
        return ResponseEntity.noContent().build();
    }
}