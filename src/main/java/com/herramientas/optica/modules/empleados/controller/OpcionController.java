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
        // 1. Categorías Principales (Padres Raíz)
        Opcion adminCat = buscarOCrear("Administración", null, "IconPerfiles", 10, null);
        Opcion inventarioCat = buscarOCrear("Inventario", null, "IconDashboard", 20, null);
        Opcion clientesCat = buscarOCrear("Clientes y Ventas", null, "IconClientes", 30, null);

        // 2. Opciones de Administración
        Opcion configMenu = buscarOCrear("Configuración Menú", "/configuracion-menu", "IconDashboard", 3, adminCat);
        Opcion listarEmpleados = buscarOCrear("Listar Empleados", "/empleados", "IconEmpleados", 1, adminCat);
        Opcion perfiles = buscarOCrear("Perfiles", "/perfiles", "IconPerfiles", 2, adminCat);

        // 3. Opciones de Inventario (Jerarquía)
        Opcion productos = buscarOCrear("Productos", "/productos", "IconDashboard", 1, inventarioCat);
        Opcion marcas = buscarOCrear("Marcas", "/marcas", "IconDashboard", 2, productos);
        Opcion categorias = buscarOCrear("Categorías", "/categorias", "IconDashboard", 3, productos);
        Opcion unidades = buscarOCrear("Unidades", "/unidades", "IconDashboard", 4, productos);

        // 4. Opciones de Clientes
        Opcion gestionClientes = buscarOCrear("Gestión Clientes", "/clientes", "IconClientes", 1, clientesCat);

        // 5. Asignar al Perfil ADMINISTRADOR (Limpieza y Recarga Total)
        perfilRepository.findByNombre("ADMINISTRADOR").ifPresent(perfil -> {
            List<Opcion> todas = List.of(
                adminCat, inventarioCat, clientesCat, 
                configMenu, listarEmpleados, perfiles, 
                productos, marcas, categorias, unidades, 
                gestionClientes
            );
            
            perfil.getOpciones().clear();
            perfil.getOpciones().addAll(todas);
            perfilRepository.save(perfil);
        });

        return ResponseEntity.ok("Estructura jerárquica escalable creada y asignada al administrador");
    }

    private Opcion buscarOCrear(String nombre, String ruta, String icono, Integer orden, Opcion padre) {
        Opcion op = opcionRepository.findByNombre(nombre).orElse(new Opcion());
        op.setNombre(nombre);
        op.setRuta(ruta);
        op.setIcono(icono);
        op.setOrden(orden);
        op.setPadre(padre);
        return opcionRepository.save(op);
    }
}
