package com.herramientas.optica.modules.empleados.service;

import com.herramientas.optica.modules.empleados.dto.OpcionRequestDTO;
import com.herramientas.optica.modules.empleados.dto.OpcionResponseDTO;
import com.herramientas.optica.modules.empleados.model.Opcion;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.OpcionRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OpcionService {

    private final OpcionRepository opcionRepository;
    private final PerfilRepository perfilRepository;

    @Transactional(readOnly = true)
    public List<OpcionResponseDTO> listarTodas() {
        return opcionRepository
            .findAll()
            .stream()
            .sorted(
                Comparator.comparing(op ->
                    op.getOrden() != null ? op.getOrden() : 0
                )
            )
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public OpcionResponseDTO actualizarEstructura(
        Long id,
        OpcionRequestDTO dto
    ) {
        Opcion opcion = opcionRepository
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "Opción no encontrada con ID: " + id
                )
            );

        if (dto.getIdPadre() != null) {
            Opcion padre = opcionRepository
                .findById(dto.getIdPadre())
                .orElseThrow(() ->
                    new IllegalArgumentException(
                        "Padre no encontrado con ID: " + dto.getIdPadre()
                    )
                );
            opcion.setPadre(padre);
        } else {
            opcion.setPadre(null);
        }

        if (dto.getOrden() != null) {
            opcion.setOrden(dto.getOrden());
        }

        if (dto.getIcono() != null) {
            opcion.setIcono(dto.getIcono());
        }

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            opcion.setNombre(dto.getNombre());
        }

        if (dto.getRuta() != null) {
            opcion.setRuta(dto.getRuta());
        }

        return mapToDTO(opcionRepository.save(opcion));
    }

    @Transactional
    public String initDefaults() {
        // 1. Categorías Principales (Padres Raíz)
        Opcion adminCat = buscarOCrear(
            "Administración",
            null,
            "IconPerfiles",
            10,
            null
        );

        Opcion clientesCat = buscarOCrear(
            "Clientes y Ventas",
            null,
            "IconClientes",
            20,
            null
        );

        Opcion inventarioCat = buscarOCrear(
            "Inventario",
            null,
            "IconDashboard",
            30,
            null
        );

        Opcion proveedor_compraCat = buscarOCrear(
            "Proveedor/Compras",
            null,
            "IconCompras",
            40,
            null
        );

        // 2. Opciones de Administración
        Opcion configMenu = buscarOCrear(
            "Configuración Menú",
            "/configuracion-menu",
            "IconDashboard",
            3,
            adminCat
        );
        Opcion listarEmpleados = buscarOCrear(
            "Listar Empleados",
            "/empleados",
            "IconEmpleados",
            1,
            adminCat
        );
        Opcion perfiles = buscarOCrear(
            "Perfiles",
            "/perfiles",
            "IconPerfiles",
            2,
            adminCat
        );

        // 3. Opciones de Inventario (Jerarquía)
        Opcion inventario = buscarOCrear(
            "Inventario Operativo",
            "/inventario",
            "IconDashboard",
            1,
            inventarioCat
        );
        Opcion productos = buscarOCrear(
            "Productos",
            "/productos",
            "IconDashboard",
            2,
            inventarioCat
        );

        Opcion categorias = buscarOCrear(
            "Categorías",
            "/categorias",
            "IconDashboard",
            3,
            productos
        );

        Opcion marcas = buscarOCrear(
            "Marcas",
            "/marcas",
            "IconDashboard",
            4,
            productos
        );

        Opcion unidades = buscarOCrear(
            "Unidades",
            "/unidades",
            "IconDashboard",
            5,
            productos
        );

        // 4. Opciones de Clientes
        Opcion gestionClientes = buscarOCrear(
            "Gestión Clientes",
            "/clientes",
            "IconClientes",
            1,
            clientesCat
        );
        Opcion caja = buscarOCrear(
            "Caja",
            "/cajas",
            "IconDashboard",
            2,
            clientesCat
        );

        // Proveedor/Compras
        Opcion proveedores = buscarOCrear(
            "Proveedor",
            "/proveedores",
            "IconDashboard",
            1,
            proveedor_compraCat
        );

        Opcion compras = buscarOCrear(
            "Compras",
            "/compras",
            "IconDashboard",
            2,
            inventarioCat
        );

        // 5. Asignar al Perfil ADMINISTRADOR (Limpieza y Recarga Total)
        perfilRepository.findByNombre("ADMINISTRADOR").ifPresent(perfil -> {
            List<Opcion> todas = List.of(
                adminCat,
                inventarioCat,
                clientesCat,
                configMenu,
                listarEmpleados,
                perfiles,
                productos,
                inventario,
                proveedores,
                compras,
                marcas,
                categorias,
                unidades,
                gestionClientes,
                caja
            );

            perfil.getOpciones().clear();
            perfil.getOpciones().addAll(todas);
            perfilRepository.save(perfil);
        });

        return "Estructura jerárquica escalable creada y asignada al administrador";
    }

    private Opcion buscarOCrear(
        String nombre,
        String ruta,
        String icono,
        Integer orden,
        Opcion padre
    ) {
        Opcion op = opcionRepository.findByNombre(nombre).orElse(new Opcion());
        op.setNombre(nombre);
        op.setRuta(ruta);
        op.setIcono(icono);
        op.setOrden(orden);
        op.setPadre(padre);
        return opcionRepository.save(op);
    }

    private OpcionResponseDTO mapToDTO(Opcion opcion) {
        return OpcionResponseDTO.builder()
            .id(opcion.getId())
            .nombre(opcion.getNombre())
            .ruta(opcion.getRuta())
            .icono(opcion.getIcono())
            .orden(opcion.getOrden())
            .idPadre(
                opcion.getPadre() != null ? opcion.getPadre().getId() : null
            )
            .build();
    }
}
