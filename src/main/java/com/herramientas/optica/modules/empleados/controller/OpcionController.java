package com.herramientas.optica.modules.empleados.controller;

import java.util.List;
import java.util.Map;

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

    @PutMapping("/{id}/estructura")
    public ResponseEntity<?> actualizarEstructura(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return opcionRepository.findById(id).map(opcion -> {
            if (payload.containsKey("idPadre")) {
                Object idPadreObj = payload.get("idPadre");
                if (idPadreObj != null) {
                    Long idPadre = Long.valueOf(idPadreObj.toString());
                    opcionRepository.findById(idPadre).ifPresent(opcion::setPadre);
                } else {
                    opcion.setPadre(null);
                }
            }
            if (payload.containsKey("orden")) {
                Object ordenObj = payload.get("orden");
                if (ordenObj != null) {
                    opcion.setOrden(Integer.valueOf(ordenObj.toString()));
                }
            }
            opcionRepository.save(opcion);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}