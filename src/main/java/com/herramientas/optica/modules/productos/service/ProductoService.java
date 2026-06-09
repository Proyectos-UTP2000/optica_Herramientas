package com.herramientas.optica.modules.productos.service;

import java.math.BigDecimal;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.herramientas.optica.modules.inventario.service.InventarioService;
import com.herramientas.optica.modules.productos.dto.ProductoRequestDTO;
import com.herramientas.optica.modules.productos.dto.ProductoResponseDTO;
import com.herramientas.optica.modules.productos.model.Categoria;
import com.herramientas.optica.modules.productos.model.Marca;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.model.ProductoImagen;
import com.herramientas.optica.modules.productos.model.Unidad;
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;
import com.herramientas.optica.modules.productos.repository.ProductoImagenRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;
    private final UnidadRepository unidadRepository;
    private final ProductoImagenRepository productoImagenRepository;
    private final CloudinaryService cloudinaryService;
    private final InventarioService inventarioService;

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_INACTIVO = 2;
    private static final int ESTADO_BORRADO = 0;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository,
            MarcaRepository marcaRepository, UnidadRepository unidadRepository,
            ProductoImagenRepository productoImagenRepository,
            CloudinaryService cloudinaryService,
            InventarioService inventarioService) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.marcaRepository = marcaRepository;
        this.unidadRepository = unidadRepository;
        this.productoImagenRepository = productoImagenRepository;
        this.cloudinaryService = cloudinaryService;
        this.inventarioService = inventarioService;
    }

    public List<ProductoResponseDTO> listarTodos() {
        return productoRepository.findByEstadoNot(ESTADO_BORRADO).stream()
                .sorted(Comparator
                        .comparing((Producto p) -> !requiereRevisionCatalogo(p))
                        .thenComparing(Producto::getNombre, Comparator.nullsLast(String::compareTo)))
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    public ProductoResponseDTO buscarPorId(Long id) {
        return mapearAResponse(productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado.")));
    }

    @Transactional
    public ProductoResponseDTO crear(ProductoRequestDTO dto, List<MultipartFile> imagenes) throws IOException {
        String codigoFinal = dto.getCodigo();
        if (codigoFinal == null || codigoFinal.trim().isEmpty()) {
            codigoFinal = generarCodigoAutomatico(dto.getTipoProducto());
        } else if (productoRepository.existsByCodigo(codigoFinal)) {
            throw new IllegalArgumentException("El código de producto '" + codigoFinal + "' ya existe.");
        }

        Categoria categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));
        Marca marca = marcaRepository.findById(dto.getIdMarca())
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada."));
        Unidad unidadVenta = unidadRepository.findById(dto.getIdUnidadVenta())
                .orElseThrow(() -> new IllegalArgumentException("Unidad de venta no encontrada."));
        Unidad unidadCompra = unidadRepository.findById(dto.getIdUnidadCompra())
                .orElseThrow(() -> new IllegalArgumentException("Unidad de compra no encontrada."));

        Producto producto = Producto.builder()
                .nombre(dto.getNombre().toUpperCase())
                .codigo(codigoFinal)
                .modelo(dto.getModelo())
                .descripcion(dto.getDescripcion())
                .precio(dto.getPrecio())
                .costo(dto.getCosto())
                .fechaVencimiento(dto.getFechaVencimiento())
                .stock(0)
                .stockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 1)
                .tipoProducto(dto.getTipoProducto())
                .categoria(categoria)
                .marca(marca)
                .unidadVenta(unidadVenta)
                .unidadCompra(unidadCompra)
                .factorConversion(dto.getFactorConversion() != null ? dto.getFactorConversion() : 1)
                .estado(ESTADO_ACTIVO)
                .build();

        Producto guardado = productoRepository.save(producto);
        inventarioService.inicializarProducto(
                guardado,
                dto.getStockInicial() != null ? BigDecimal.valueOf(dto.getStockInicial()) : BigDecimal.ZERO,
                dto.getStockMinimo() != null ? dto.getStockMinimo() : 1);

        // Guardar imágenes en Cloudinary
        if (imagenes != null && !imagenes.isEmpty()) {
            for (int i = 0; i < imagenes.size(); i++) {
                String url = cloudinaryService.subirImagen(imagenes.get(i), guardado.getCodigo());
                ProductoImagen img = ProductoImagen.builder()
                        .producto(guardado)
                        .rutaImagen(url)
                        .esPrincipal(i == 0)
                        .build();
                productoImagenRepository.save(img);
            }
        }

        return mapearAResponse(guardado);
    }

    private String generarCodigoAutomatico(com.herramientas.optica.modules.productos.model.TipoProducto tipo) {
        String prefijo = switch (tipo) {
            case ARMAZON -> "ARM";
            case CRISTAL -> "CRI";
            case LENTE_CONTACTO -> "LEN";
            case ACCESORIO -> "ACC";
            case CUIDADO_VISUAL -> "CUI";
            default -> "PRO";
        };

        long conteo = productoRepository.findAll().stream()
                .filter(p -> p.getCodigo() != null && p.getCodigo().startsWith(prefijo))
                .count();

        return String.format("%s-%05d", prefijo, conteo + 1);
    }

    @Transactional
    public ProductoResponseDTO actualizar(Long id, ProductoRequestDTO dto, List<MultipartFile> imagenes) throws Exception {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado."));

        if (dto.getCodigo() != null && !dto.getCodigo().equals(producto.getCodigo())
                && productoRepository.existsByCodigo(dto.getCodigo())) {
            throw new IllegalArgumentException("El código de producto '" + dto.getCodigo() + "' ya existe.");
        }

        Categoria categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));
        Marca marca = marcaRepository.findById(dto.getIdMarca())
                .orElseThrow(() -> new IllegalArgumentException("Marca no encontrada."));
        Unidad unidadVenta = unidadRepository.findById(dto.getIdUnidadVenta())
                .orElseThrow(() -> new IllegalArgumentException("Unidad de venta no encontrada."));
        Unidad unidadCompra = unidadRepository.findById(dto.getIdUnidadCompra())
                .orElseThrow(() -> new IllegalArgumentException("Unidad de compra no encontrada."));

        producto.setNombre(dto.getNombre().toUpperCase());
        if (dto.getCodigo() != null)
            producto.setCodigo(dto.getCodigo());
        producto.setModelo(dto.getModelo());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setCosto(dto.getCosto());
        producto.setFechaVencimiento(dto.getFechaVencimiento());
        producto.setStockMinimo(dto.getStockMinimo());
        producto.setTipoProducto(dto.getTipoProducto());
        producto.setCategoria(categoria);
        producto.setMarca(marca);
        producto.setUnidadVenta(unidadVenta);
        producto.setUnidadCompra(unidadCompra);
        producto.setFactorConversion(dto.getFactorConversion());

        // Actualizar imágenes (reemplazo completo)
        if (imagenes != null && !imagenes.isEmpty()) {
            cloudinaryService.eliminarCarpetaProducto(producto.getCodigo());
            productoImagenRepository.deleteByProductoId(id);
            for (int i = 0; i < imagenes.size(); i++) {
                String url = cloudinaryService.subirImagen(imagenes.get(i), producto.getCodigo());
                ProductoImagen img = ProductoImagen.builder()
                        .producto(producto)
                        .rutaImagen(url)
                        .esPrincipal(i == 0)
                        .build();
                productoImagenRepository.save(img);
            }
        }

        Producto actualizado = productoRepository.save(producto);
        inventarioService.actualizarStockMinimoProducto(actualizado.getId(), dto.getStockMinimo());
        return mapearAResponse(actualizado);
    }

    @Transactional
    public ProductoResponseDTO cambiarEstado(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado."));

        if (producto.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("No se puede cambiar el estado de un producto eliminado.");
        }

        producto.setEstado(producto.getEstado() == ESTADO_ACTIVO ? ESTADO_INACTIVO : ESTADO_ACTIVO);
        return mapearAResponse(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado."));
        producto.setEstado(ESTADO_BORRADO);
        productoRepository.save(producto);
    }

    private boolean requiereRevisionCatalogo(Producto producto) {
        return esCatalogoEnDesusoOIndefinido(producto.getCategoria().getEstado(), producto.getCategoria().getNombre())
                || esCatalogoEnDesusoOIndefinido(producto.getMarca().getEstado(), producto.getMarca().getNombre());
    }

    private boolean esCatalogoEnDesusoOIndefinido(Integer estado, String nombre) {
        return (estado != null && estado == ESTADO_INACTIVO)
                || (nombre != null && "INDEFINIDO".equalsIgnoreCase(nombre.trim()));
    }

    private ProductoResponseDTO mapearAResponse(Producto p) {
        List<String> imgs = productoImagenRepository.findByProductoId(p.getId()).stream()
                .map(ProductoImagen::getRutaImagen)
                .collect(Collectors.toList());

        return ProductoResponseDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .codigo(p.getCodigo())
                .modelo(p.getModelo())
                .descripcion(p.getDescripcion())
                .precio(p.getPrecio())
                .costo(p.getCosto())
                .fechaCreacion(p.getFechaCreacion())
                .fechaVencimiento(p.getFechaVencimiento())
                .stock(p.getStock())
                .stockMinimo(p.getStockMinimo())
                .estado(p.getEstado())
                .tipoProducto(p.getTipoProducto())
                .idCategoria(p.getCategoria().getId())
                .categoriaNombre(p.getCategoria().getNombre())
                .categoriaEstado(p.getCategoria().getEstado())
                .idMarca(p.getMarca().getId())
                .marcaNombre(p.getMarca().getNombre())
                .marcaEstado(p.getMarca().getEstado())
                .idUnidadVenta(p.getUnidadVenta().getId())
                .unidadVentaNombre(p.getUnidadVenta().getNombre())
                .idUnidadCompra(p.getUnidadCompra().getId())
                .unidadCompraNombre(p.getUnidadCompra().getNombre())
                .factorConversion(p.getFactorConversion())
                .rutasImagenes(imgs)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
