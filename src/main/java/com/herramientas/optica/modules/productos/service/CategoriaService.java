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
        if (categoriaRepository.existsByNombre(nombreLimpio)) {
            throw new IllegalArgumentException("La categoría '" + nombreLimpio + "' ya existe.");
        }

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
            long conteo = productoRepository.countByCategoriaIdAndEstadoNot(id, ESTADO_BORRADO);
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
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));

        long conteo = productoRepository.countByCategoriaIdAndEstadoNot(id, ESTADO_BORRADO);
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
                .build();
    }
}