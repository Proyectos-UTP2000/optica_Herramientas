package com.herramientas.optica.modules.productos.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.herramientas.optica.modules.productos.dto.EtiquetaRequestDTO;
import com.herramientas.optica.modules.productos.dto.EtiquetaResponseDTO;
import com.herramientas.optica.modules.productos.model.Etiqueta;
import com.herramientas.optica.modules.productos.repository.EtiquetaRepository;

@Service
public class EtiquetaService {

    private final EtiquetaRepository etiquetaRepository;
    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_INACTIVO = 2;
    private static final int ESTADO_ELIMINADO = 0;

    public EtiquetaService(EtiquetaRepository etiquetaRepository) {
        this.etiquetaRepository = etiquetaRepository;
    }

    @Transactional(readOnly = true)
    public List<EtiquetaResponseDTO> listarTodos() {
        return etiquetaRepository.findAll().stream()
                .filter(e -> e.getEstado() != ESTADO_ELIMINADO)
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EtiquetaResponseDTO> listarActivos() {
        return etiquetaRepository.findByEstado(ESTADO_ACTIVO).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EtiquetaResponseDTO crear(EtiquetaRequestDTO dto) {
        String nombreNorm = dto.getNombre().trim().toUpperCase();
        if (etiquetaRepository.existsByNombreIgnoreCase(nombreNorm)) {
            throw new IllegalArgumentException("La etiqueta '" + dto.getNombre() + "' ya existe.");
        }
        Etiqueta e = Etiqueta.builder().nombre(nombreNorm).estado(ESTADO_ACTIVO).build();
        return mapearAResponse(etiquetaRepository.save(e));
    }

    @Transactional
    public EtiquetaResponseDTO actualizar(Long id, EtiquetaRequestDTO dto) {
        Etiqueta e = etiquetaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Etiqueta no encontrada."));
        String nombreNorm = dto.getNombre().trim().toUpperCase();
        if (etiquetaRepository.existsByNombreIgnoreCaseAndIdNot(nombreNorm, id)) {
            throw new IllegalArgumentException("Ya existe otra etiqueta con el nombre '" + dto.getNombre() + "'.");
        }
        e.setNombre(nombreNorm);
        return mapearAResponse(etiquetaRepository.save(e));
    }

    @Transactional
    public EtiquetaResponseDTO cambiarEstado(Long id) {
        Etiqueta e = etiquetaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Etiqueta no encontrada."));
        e.setEstado(e.getEstado() == ESTADO_ACTIVO ? ESTADO_INACTIVO : ESTADO_ACTIVO);
        return mapearAResponse(etiquetaRepository.save(e));
    }

    @Transactional
    public void eliminar(Long id) {
        Etiqueta e = etiquetaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Etiqueta no encontrada."));
        e.setEstado(ESTADO_ELIMINADO);
        etiquetaRepository.save(e);
    }

    private EtiquetaResponseDTO mapearAResponse(Etiqueta e) {
        return EtiquetaResponseDTO.builder()
                .id(e.getId())
                .nombre(e.getNombre())
                .estado(e.getEstado())
                .build();
    }
}
