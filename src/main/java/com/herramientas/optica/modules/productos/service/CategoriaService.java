package com.herramientas.optica.modules.productos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.dto.CategoriaRequestDTO;
import com.herramientas.optica.modules.productos.dto.CategoriaResponseDTO;
import com.herramientas.optica.modules.productos.model.Categoria;
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_INACTIVO = 2;
    private static final int ESTADO_BORRADO = 0;

    public CategoriaService(CategoriaRepository categoriaRepository, ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    public List<CategoriaResponseDTO> listarGestion() {
        return categoriaRepository.findByEstadoNot(ESTADO_BORRADO).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    public List<CategoriaResponseDTO> listarActivos() {
        return categoriaRepository.findAll().stream()
                .filter(c -> c.getEstado() == ESTADO_ACTIVO)
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoriaResponseDTO crear(CategoriaRequestDTO dto) {
        String nombreLimpio = dto.getNombre().trim().toUpperCase();
        return categoriaRepository.findByNombre(nombreLimpio)
                .map(this::reactivarCategoriaBorradaORechazar)
                .orElseGet(() -> crearNuevaCategoria(nombreLimpio));
    }

    private CategoriaResponseDTO reactivarCategoriaBorradaORechazar(Categoria categoria) {
        if (categoria.getEstado() != null && categoria.getEstado() == ESTADO_BORRADO) {
            categoria.setEstado(ESTADO_ACTIVO);
            return mapearAResponse(categoriaRepository.save(categoria));
        }
        throw new IllegalArgumentException("La categoría '" + categoria.getNombre() + "' ya existe.");
    }

    private CategoriaResponseDTO crearNuevaCategoria(String nombreLimpio) {
        Categoria categoria = Categoria.builder()
                .nombre(nombreLimpio)
                .estado(ESTADO_ACTIVO)
                .build();

        return mapearAResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponseDTO actualizar(Long id, CategoriaRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));

        String nombreNuevo = dto.getNombre().trim().toUpperCase();
        if (!categoria.getNombre().equals(nombreNuevo) && categoriaRepository.existsByNombre(nombreNuevo)) {
            throw new IllegalArgumentException("Ya existe otra categoría con el nombre '" + nombreNuevo + "'.");
        }

        categoria.setNombre(nombreNuevo);
        return mapearAResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponseDTO cambiarEstado(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));

        if (categoria.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("No se puede cambiar el estado de una categoría eliminada.");
        }

        if (categoria.getEstado() == ESTADO_ACTIVO) {
            long conteo = productoRepository.countRelacionadosPorCategoria(id, ESTADO_BORRADO);
            if (conteo > 0) {
                // Si tiene productos, pasamos a estado 2 (En desuso)
                categoria.setEstado(ESTADO_INACTIVO);
            } else {
                categoria.setEstado(ESTADO_INACTIVO);
            }
        } else {
            categoria.setEstado(ESTADO_ACTIVO);
        }
        return mapearAResponse(categoriaRepository.save(categoria));
    }


    @Transactional
    public CategoriaResponseDTO marcarEnDesuso(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));

        if (categoria.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("No se puede desactivar una categoría eliminada.");
        }

        categoria.setEstado(ESTADO_INACTIVO);
        return mapearAResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponseDTO migrarProductosYDesactivar(Long origenId, Long destinoId) {
        if (origenId.equals(destinoId)) {
            throw new IllegalArgumentException("La categoría destino debe ser diferente a la categoría origen.");
        }

        Categoria origen = categoriaRepository.findById(origenId)
                .orElseThrow(() -> new IllegalArgumentException("Categoría origen no encontrada."));
        Categoria destino = categoriaRepository.findById(destinoId)
                .orElseThrow(() -> new IllegalArgumentException("Categoría destino no encontrada."));

        if (origen.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("No se puede migrar una categoría eliminada.");
        }
        if (destino.getEstado() != ESTADO_ACTIVO) {
            throw new IllegalStateException("La categoría destino debe estar activa.");
        }

        productoRepository.reasignarCategoria(origenId, destinoId, ESTADO_BORRADO);
        origen.setEstado(ESTADO_INACTIVO);
        return mapearAResponse(categoriaRepository.save(origen));
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));

        long conteo = productoRepository.countRelacionadosPorCategoria(id, ESTADO_BORRADO);
        if (conteo > 0) {
            throw new IllegalStateException("No se puede eliminar una categoría con productos activos.");
        }
        categoria.setEstado(ESTADO_BORRADO);
        categoriaRepository.save(categoria);
    }

    private CategoriaResponseDTO mapearAResponse(Categoria categoria) {
        return CategoriaResponseDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .estado(categoria.getEstado())
                .cantidadProductosRelacionados(productoRepository.countRelacionadosPorCategoria(categoria.getId(), ESTADO_BORRADO))
                .build();
    }
}
