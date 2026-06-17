package com.herramientas.optica.modules.productos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.dto.MarcaRequestDTO;
import com.herramientas.optica.modules.productos.dto.MarcaResponseDTO;
import com.herramientas.optica.modules.productos.model.Marca;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;

@Service
public class MarcaService {

    private final MarcaRepository marcaRepository;
    private final ProductoRepository productoRepository;

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_INACTIVO = 2;
    private static final int ESTADO_BORRADO = 0;

    public MarcaService(MarcaRepository marcaRepository, ProductoRepository productoRepository) {
        this.marcaRepository = marcaRepository;
        this.productoRepository = productoRepository;
    }

    public List<MarcaResponseDTO> listarGestion() {
        return marcaRepository.findByEstadoNot(ESTADO_BORRADO).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    public List<MarcaResponseDTO> listarActivos() {
        return marcaRepository.findAll().stream()
                .filter(m -> m.getEstado() == ESTADO_ACTIVO)
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MarcaResponseDTO crear(MarcaRequestDTO dto) {
        String nombre = dto.getNombre().trim().toUpperCase();
        return marcaRepository.findByNombre(nombre)
                .map(existente -> reactivarMarcaBorradaORechazar(existente, dto))
                .orElseGet(() -> crearNuevaMarca(dto, nombre));
    }

    private MarcaResponseDTO reactivarMarcaBorradaORechazar(Marca marca, MarcaRequestDTO dto) {
        if (marca.getEstado() != null && marca.getEstado() == ESTADO_BORRADO) {
            marca.setFecha(dto.getFecha());
            marca.setEstado(ESTADO_ACTIVO);
            return mapearAResponse(marcaRepository.save(marca));
        }
        throw new IllegalArgumentException("La marca '" + marca.getNombre() + "' ya existe.");
    }

    private MarcaResponseDTO crearNuevaMarca(MarcaRequestDTO dto, String nombre) {
        Marca marca = Marca.builder()
                .nombre(nombre)
                .fecha(dto.getFecha())
                .estado(ESTADO_ACTIVO)
                .build();

        return mapearAResponse(marcaRepository.save(marca));
    }

    @Transactional
    public MarcaResponseDTO actualizar(Long id, MarcaRequestDTO dto) {
        Marca marca = marcaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada."));

        String nombreNuevo = dto.getNombre().trim().toUpperCase();
        if (!marca.getNombre().equals(nombreNuevo) && marcaRepository.existsByNombre(nombreNuevo)) {
            throw new IllegalArgumentException("Ya existe otra marca con el nombre '" + nombreNuevo + "'.");
        }

        marca.setNombre(nombreNuevo);
        marca.setFecha(dto.getFecha());

        return mapearAResponse(marcaRepository.save(marca));
    }

    @Transactional
    public MarcaResponseDTO cambiarEstado(Long id) {
        Marca marca = marcaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada."));

        if (marca.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("No se puede cambiar el estado de una marca eliminada.");
        }

        if (marca.getEstado() == ESTADO_ACTIVO) {
            long conteo = productoRepository.countRelacionadosPorMarca(id, ESTADO_BORRADO);
            if (conteo > 0) {
                // Si tiene productos, pasamos a estado 2 (En desuso)
                marca.setEstado(ESTADO_INACTIVO);
            } else {
                marca.setEstado(ESTADO_INACTIVO);
            }
        } else {
            marca.setEstado(ESTADO_ACTIVO);
        }

        return mapearAResponse(marcaRepository.save(marca));
    }


    @Transactional
    public MarcaResponseDTO marcarEnDesuso(Long id) {
        Marca marca = marcaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada."));

        if (marca.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("No se puede desactivar una marca eliminada.");
        }

        marca.setEstado(ESTADO_INACTIVO);
        return mapearAResponse(marcaRepository.save(marca));
    }

    @Transactional
    public MarcaResponseDTO migrarProductosYDesactivar(Long origenId, Long destinoId) {
        if (origenId.equals(destinoId)) {
            throw new IllegalArgumentException("La marca destino debe ser diferente a la marca origen.");
        }

        Marca origen = marcaRepository.findById(origenId)
                .orElseThrow(() -> new IllegalArgumentException("Marca origen no encontrada."));
        Marca destino = marcaRepository.findById(destinoId)
                .orElseThrow(() -> new IllegalArgumentException("Marca destino no encontrada."));

        if (origen.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("No se puede migrar una marca eliminada.");
        }
        if (destino.getEstado() != ESTADO_ACTIVO) {
            throw new IllegalStateException("La marca destino debe estar activa.");
        }

        productoRepository.reasignarMarca(origenId, destinoId, ESTADO_BORRADO);
        origen.setEstado(ESTADO_INACTIVO);
        return mapearAResponse(marcaRepository.save(origen));
    }

    @Transactional
    public void eliminar(Long id) {
        Marca marca = marcaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada."));

        long conteo = productoRepository.countRelacionadosPorMarca(id, ESTADO_BORRADO);
        if (conteo > 0) {
            throw new IllegalStateException("No se puede eliminar la marca '" + marca.getNombre() +
                    "' porque está siendo usada por " + conteo + " productos.");
        }

        marca.setEstado(ESTADO_BORRADO);
        marcaRepository.save(marca);
    }

    private MarcaResponseDTO mapearAResponse(Marca marca) {
        return MarcaResponseDTO.builder()
                .id(marca.getId())
                .nombre(marca.getNombre())
                .fecha(marca.getFecha())
                .estado(marca.getEstado())
                .cantidadProductosRelacionados(productoRepository.countRelacionadosPorMarca(marca.getId(), ESTADO_BORRADO))
                .build();
    }
}
