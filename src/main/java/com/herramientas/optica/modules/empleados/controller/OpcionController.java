package com.herramientas.optica.modules.empleados.controller;

import java.util.List;
import java.util.Map;
import java.util.Comparator;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.herramientas.optica.modules.empleados.model.Opcion;
import com.herramientas.optica.modules.empleados.repository.OpcionRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;

@RestController
@RequestMapping("/api/v1/opciones")
@CrossOrigin(origins = "*")
public class OpcionController {

    private final OpcionRepository opcionRepository;
    private final PerfilRepository perfilRepository;

    public OpcionController(OpcionRepository opcionRepository, PerfilRepository perfilRepository) {
        this.opcionRepository = opcionRepository;
        this.perfilRepository = perfilRepository;
    }

    @GetMapping
    public ResponseEntity<List<Opcion>> listarOpciones() {
        return ResponseEntity.ok(opcionRepository.findAll().stream()
                .sorted(Comparator.comparing(op -> op.getOrden() != null ? op.getOrden() : 0))
                .collect(Collectors.toList()));
    }

    @PutMapping("/{id}/estructura")
    public ResponseEntity<?> actualizarEstructura(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        Opcion opcion = opcionRepository.findById(id).orElseThrow();

        if (data.containsKey("idPadre")) {
            Object idPadreObj = data.get("idPadre");
            if (idPadreObj != null && !idPadreObj.toString().isEmpty()) {
                Opcion padre = opcionRepository.findById(Long.parseLong(idPadreObj.toString())).orElseThrow();
                opcion.setPadre(padre);
            } else {
                opcion.setPadre(null);
            }
        }

        if (data.containsKey("orden")) {
            Object ordenObj = data.get("orden");
            if (ordenObj != null) {
                opcion.setOrden(Integer.parseInt(ordenObj.toString()));
            }
        }

        return ResponseEntity.ok(opcionRepository.save(opcion));
    }

    @PostMapping("/init-defaults")
    public ResponseEntity<String> initDefaults() {
        // 1. Crear o buscar Categoría "Administración"
        Opcion adminCat = opcionRepository.findByNombre("Administración")
                .orElseGet(() -> opcionRepository.save(Opcion.builder()
                        .nombre("Administración")
                        .icono("IconPerfiles")
                        .orden(10)
                        .build()));

        // 2. Crear o buscar Opción "Configuración Menú"
        Opcion configMenu = opcionRepository.findByNombre("Configuración Menú")
                .orElseGet(() -> opcionRepository.save(Opcion.builder()
                        .nombre("Configuración Menú")
                        .ruta("/configuracion-menu")
                        .icono("IconDashboard")
                        .padre(adminCat)
                        .orden(3)
                        .build()));

        // 3. Organizar Empleados y Perfiles
        opcionRepository.findByNombre("Listar Empleados").ifPresent(op -> {
            op.setPadre(adminCat);
            op.setOrden(1);
            opcionRepository.save(op);
        });
        opcionRepository.findByNombre("Perfiles").ifPresent(op -> {
            op.setPadre(adminCat);
            op.setOrden(2);
            opcionRepository.save(op);
        });

        // 4. Asignar al Perfil ADMINISTRADOR
        perfilRepository.findByNombre("ADMINISTRADOR").ifPresent(perfil -> {
            boolean hasAdminCat = perfil.getOpciones().stream().anyMatch(o -> o.getNombre().equals("Administración"));
            boolean hasConfigMenu = perfil.getOpciones().stream().anyMatch(o -> o.getNombre().equals("Configuración Menú"));
            
            if (!hasAdminCat) perfil.getOpciones().add(adminCat);
            if (!hasConfigMenu) perfil.getOpciones().add(configMenu);
            
            perfilRepository.save(perfil);
        });

        return ResponseEntity.ok("Estructura inicial creada y asignada al administrador");
    }
}
