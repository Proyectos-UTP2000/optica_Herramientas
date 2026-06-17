package com.herramientas.optica.modules.productos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.dto.UnidadRequestDTO;
import com.herramientas.optica.modules.productos.dto.UnidadResponseDTO;
import com.herramientas.optica.modules.productos.model.Unidad;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;

@Service
public class UnidadService {

    private final UnidadRepository unidadRepository;
    private final ProductoRepository productoRepository;

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_INACTIVO = 2;
    private static final int ESTADO_BORRADO = 0;

    public UnidadService(UnidadRepository unidadRepository, ProductoRepository productoRepository) {
        this.unidadRepository = unidadRepository;
        this.productoRepository = productoRepository;
    }

    public List<UnidadResponseDTO> listarGestion() {
        return unidadRepository.findByEstadoNot(ESTADO_BORRADO).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    public List<UnidadResponseDTO> listarActivos() {
        return unidadRepository.findAll().stream()
                .filter(u -> u.getEstado() == ESTADO_ACTIVO)
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UnidadResponseDTO crear(UnidadRequestDTO dto) {
        String nombre = dto.getNombre().trim().toUpperCase();
        return unidadRepository.findByNombre(nombre)
                .map(this::reactivarUnidadBorradaORechazar)
                .orElseGet(() -> crearNuevaUnidad(nombre));
    }

    private UnidadResponseDTO reactivarUnidadBorradaORechazar(Unidad unidad) {
        if (unidad.getEstado() != null && unidad.getEstado() == ESTADO_BORRADO) {
            unidad.setEstado(ESTADO_ACTIVO);
            return mapearAResponse(unidadRepository.save(unidad));
        }
        throw new IllegalArgumentException("La unidad '" + unidad.getNombre() + "' ya está registrada.");
    }

    private UnidadResponseDTO crearNuevaUnidad(String nombre) {
        Unidad unidad = Unidad.builder()
                .nombre(nombre)
                .estado(ESTADO_ACTIVO)
                .build();

        return mapearAResponse(unidadRepository.save(unidad));
    }

    @Transactional
    public UnidadResponseDTO actualizar(Integer id, UnidadRequestDTO dto) {
        Unidad unidad = unidadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unidad no encontrada."));

        String nombreNuevo = dto.getNombre().trim().toUpperCase();
        if (!unidad.getNombre().equals(nombreNuevo) && unidadRepository.existsByNombre(nombreNuevo)) {
            throw new IllegalArgumentException("Ya existe otra unidad con el nombre '" + nombreNuevo + "'.");
        }

        unidad.setNombre(nombreNuevo);
        return mapearAResponse(unidadRepository.save(unidad));
    }

    @Transactional
    public UnidadResponseDTO cambiarEstado(Integer id) {
        Unidad unidad = unidadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unidad no encontrada."));

        if (unidad.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("No se puede cambiar el estado de una unidad eliminada.");
        }

        if (unidad.getEstado() == ESTADO_ACTIVO) {
            long conteo = productoRepository.countRelacionadosPorUnidad(id, ESTADO_BORRADO);
            if (conteo > 0) {
                // Si tiene productos, pasamos a estado 2 (En desuso)
                unidad.setEstado(ESTADO_INACTIVO);
            } else {
                unidad.setEstado(ESTADO_INACTIVO);
            }
        } else {
            unidad.setEstado(ESTADO_ACTIVO);
        }

        return mapearAResponse(unidadRepository.save(unidad));
    }

    @Transactional
    public void eliminar(Integer id) {
        Unidad unidad = unidadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unidad no encontrada."));

        long conteo = productoRepository.countRelacionadosPorUnidad(id, ESTADO_BORRADO);
        if (conteo > 0) {
            throw new IllegalStateException("No se puede eliminar la unidad '" + unidad.getNombre() +
                    "' porque hay productos que dependen de ella.");
        }

        unidad.setEstado(ESTADO_BORRADO);
        unidadRepository.save(unidad);
    }

    private UnidadResponseDTO mapearAResponse(Unidad unidad) {
        return UnidadResponseDTO.builder()
                .id(unidad.getId())
                .nombre(unidad.getNombre())
                .estado(unidad.getEstado())
                .cantidadProductosRelacionados(productoRepository.countRelacionadosPorUnidad(unidad.getId(), ESTADO_BORRADO))
                .build();
    }
}
