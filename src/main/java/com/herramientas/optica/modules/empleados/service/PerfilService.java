package com.herramientas.optica.modules.empleados.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.empleados.dto.PerfilRequestDTO;
import com.herramientas.optica.modules.empleados.dto.PerfilResponseDTO;
import com.herramientas.optica.modules.empleados.model.Opcion;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.OpcionRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;

@Service
public class PerfilService {

    private final PerfilRepository perfilRepository;
    private final OpcionRepository opcionRepository;
    private final EmpleadoRepository empleadoRepository;

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_DESHABILITADO = 2;
    private static final int ESTADO_BORRADO = 0;

    public PerfilService(PerfilRepository perfilRepository, EmpleadoRepository empleadoRepository,
            OpcionRepository opcionRepository) {
        this.perfilRepository = perfilRepository;
        this.empleadoRepository = empleadoRepository;
        this.opcionRepository = opcionRepository;
    }

    public List<PerfilResponseDTO> listarPerfiles() {
        return perfilRepository.findAll().stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PerfilResponseDTO crearPerfil(PerfilRequestDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del perfil es obligatorio.");
        }

        if (perfilRepository.existsByNombre(dto.getNombre().toUpperCase())) {
            throw new IllegalStateException("El perfil '" + dto.getNombre() + "' ya existe en el sistema.");
        }

        Perfil nuevoPerfil = Perfil.builder()
                .nombre(dto.getNombre().toUpperCase().trim())
                .descripcion(dto.getDescripcion())
                .estado(ESTADO_ACTIVO)
                .build();

        if (dto.getIdsOpciones() != null && !dto.getIdsOpciones().isEmpty()) {
            List<Opcion> opcionesEncontradas = opcionRepository.findAllById(dto.getIdsOpciones());
            if (opcionesEncontradas.size() != dto.getIdsOpciones().size()) {
                throw new IllegalArgumentException("Una o más opciones enviadas no existen.");
            }
            nuevoPerfil.setOpciones(new HashSet<>(opcionesEncontradas));
        }
        perfilRepository.save(nuevoPerfil);
        return mapearAResponse(nuevoPerfil);
    }

    @Transactional
    public PerfilResponseDTO actualizarOpcionesDePerfil(Long idPerfil, List<Long> idsOpciones) {
        Perfil perfil = perfilRepository.findById(idPerfil)
                .orElseThrow(() -> new IllegalArgumentException("El perfil indicado no existe."));
        List<Opcion> nuevasOpcionesList = opcionRepository.findAllById(idsOpciones);
        Set<Opcion> nuevasOpcionesSet = new HashSet<>(nuevasOpcionesList);
        if (nuevasOpcionesSet.size() != idsOpciones.size()) {
            throw new IllegalArgumentException("Algunas de las opciones enviadas no existen en la base de datos.");
        }

        perfil.setOpciones(nuevasOpcionesSet);
        perfilRepository.save(perfil);

        return mapearAResponse(perfil);
    }

    @Transactional
    public PerfilResponseDTO cambiarEstado(Long id) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Perfil no encontrado."));

        if (perfil.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("No se puede cambiar el estado de un perfil eliminado.");
        }

        if (perfil.getEstado() == ESTADO_ACTIVO) {
            long empleadosAsociados = empleadoRepository.countByPerfilIdAndEstadoNot(id, ESTADO_BORRADO);
            if (empleadosAsociados > 0) {
                throw new IllegalStateException("No se puede deshabilitar el perfil '" + perfil.getNombre() +
                        "' porque tiene " + empleadosAsociados
                        + " empleado(s) asociados. Reasigne a los empleados antes de continuar.");
            }
        }
        perfil.setEstado(perfil.getEstado() == ESTADO_ACTIVO ? ESTADO_DESHABILITADO : ESTADO_ACTIVO);
        perfilRepository.save(perfil);

        return mapearAResponse(perfil);
    }

    @Transactional
    public void borradoLogico(Long id) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Perfil no encontrado."));
        long empleadosAsociados = empleadoRepository.countByPerfilIdAndEstadoNot(id, ESTADO_BORRADO);
        if (empleadosAsociados > 0) {
            throw new IllegalStateException("No se puede eliminar el perfil '" + perfil.getNombre() +
                    "' porque tiene " + empleadosAsociados + " empleado(s) vinculados.");
        }
        perfil.setEstado(ESTADO_BORRADO);
        perfilRepository.save(perfil);
    }

    private PerfilResponseDTO mapearAResponse(Perfil perfil) {
        List<PerfilResponseDTO.OpcionDTO> opcionesDTO = perfil.getOpciones().stream()
                .map(opcion -> PerfilResponseDTO.OpcionDTO.builder()
                        .id(opcion.getId())
                        .nombre(opcion.getNombre())
                        .ruta(opcion.getRuta())
                        .build())
                .collect(Collectors.toList());

        return PerfilResponseDTO.builder()
                .id(perfil.getId())
                .nombre(perfil.getNombre())
                .descripcion(perfil.getDescripcion())
                .estado(perfil.getEstado())
                .opciones(opcionesDTO)
                .build();
    }
}