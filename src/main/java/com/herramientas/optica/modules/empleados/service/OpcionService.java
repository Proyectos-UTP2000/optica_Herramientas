package com.herramientas.optica.modules.empleados.service;

import com.herramientas.optica.modules.empleados.dto.OpcionRequestDTO;
import com.herramientas.optica.modules.empleados.dto.OpcionResponseDTO;
import com.herramientas.optica.modules.empleados.model.Opcion;
import com.herramientas.optica.modules.empleados.repository.OpcionRepository;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OpcionService {

    private final OpcionRepository opcionRepository;
    private final Optional<OpcionDataLoader> opcionDataLoader;
    private final Optional<PerfilOpcionDataLoader> perfilOpcionDataLoader;

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

        if (dto.getVisibleEnMenu() != null) {
            opcion.setVisibleEnMenu(dto.getVisibleEnMenu());
        }

        return mapToDTO(opcionRepository.save(opcion));
    }

    @Transactional
    public String initDefaults() {
        String opciones = opcionDataLoader.map(OpcionDataLoader::verificarOpciones)
                .orElse("Opciones no verificadas (seeding deshabilitado)");
        String relaciones = perfilOpcionDataLoader.map(PerfilOpcionDataLoader::verificarRelacionesPerfilOpcion)
                .orElse("Relaciones no verificadas (seeding deshabilitado)");
        return opciones + ". " + relaciones;
    }

    private OpcionResponseDTO mapToDTO(Opcion opcion) {
        return OpcionResponseDTO.builder()
            .id(opcion.getId())
            .nombre(opcion.getNombre())
            .ruta(opcion.getRuta())
            .icono(opcion.getIcono())
            .orden(opcion.getOrden())
            .visibleEnMenu(Boolean.TRUE.equals(opcion.getVisibleEnMenu()))
            .idPadre(
                opcion.getPadre() != null ? opcion.getPadre().getId() : null
            )
            .build();
    }
}
