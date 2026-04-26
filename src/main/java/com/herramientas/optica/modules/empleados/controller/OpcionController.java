package com.herramientas.optica.modules.empleados.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.herramientas.optica.modules.empleados.model.Opcion;
import com.herramientas.optica.modules.empleados.repository.OpcionRepository;

@RestController
@RequestMapping("/api/v1/opciones")
@CrossOrigin(origins = "*")
public class OpcionController {

    private final OpcionRepository opcionRepository;

    public OpcionController(OpcionRepository opcionRepository) {
        this.opcionRepository = opcionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Opcion>> listarOpciones() {
        return ResponseEntity.ok(opcionRepository.findAll());
    }
}