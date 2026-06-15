package com.herramientas.optica.modules.productos.service;

import java.math.BigDecimal;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.herramientas.optica.modules.productos.dto.ProductoPublicResponseDTO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.herramientas.optica.modules.inventario.service.InventarioService;
import com.herramientas.optica.modules.productos.dto.ProductoRequestDTO;
import com.herramientas.optica.modules.productos.dto.ProductoResponseDTO;
import com.herramientas.optica.modules.productos.dto.EtiquetaResponseDTO;
import com.herramientas.optica.modules.productos.dto.ProductoImagenRequestDTO;
import com.herramientas.optica.modules.productos.dto.ProductoImagenResponseDTO;
import com.herramientas.optica.modules.productos.model.Categoria;
import com.herramientas.optica.modules.productos.model.Marca;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.model.ProductoImagen;
import com.herramientas.optica.modules.productos.model.Unidad;
import com.herramientas.optica.modules.productos.model.Etiqueta;
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;
import com.herramientas.optica.modules.productos.repository.ProductoImagenRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;
import com.herramientas.optica.modules.productos.repository.EtiquetaRepository;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;
    private final UnidadRepository unidadRepository;
    private final ProductoImagenRepository productoImagenRepository;
    private final CloudinaryService cloudinaryService;
    private final InventarioService inventarioService;
    private final EtiquetaRepository etiquetaRepository;

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_INACTIVO = 2;
    private static final int ESTADO_BORRADO = 0;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository,
            MarcaRepository marcaRepository, UnidadRepository unidadRepository,
            ProductoImagenRepository productoImagenRepository,
            CloudinaryService cloudinaryService,
            InventarioService inventarioService,
            EtiquetaRepository etiquetaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.marcaRepository = marcaRepository;
        this.unidadRepository = unidadRepository;
        this.productoImagenRepository = productoImagenRepository;
        this.cloudinaryService = cloudinaryService;
        this.inventarioService = inventarioService;
        this.etiquetaRepository = etiquetaRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarTodos() {
        return productoRepository.findByEstadoNot(ESTADO_BORRADO).stream()
                .sorted(Comparator
                        .comparing((Producto p) -> !requiereRevisionCatalogo(p))
                        .thenComparing(Producto::getNombre, Comparator.nullsLast(String::compareTo)))
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
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

        String slugFinal = dto.getSlug();
        if (slugFinal == null || slugFinal.trim().isEmpty()) {
            slugFinal = generarSlug(dto.getNombre());
        } else {
            slugFinal = generarSlug(slugFinal);
        }
        slugFinal = hacerSlugUnico(slugFinal, null);

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
                .visibleWeb(dto.getVisibleWeb() != null ? dto.getVisibleWeb() : false)
                .destacado(dto.getDestacado() != null ? dto.getDestacado() : false)
                .slug(slugFinal)
                .descripcionWeb(dto.getDescripcionWeb())
                .etiquetas(cargarEtiquetasPorIds(dto.getIdEtiquetas()))
                .orden(dto.getOrden() != null ? dto.getOrden() : 0)
                .build();

        Producto guardado = productoRepository.save(producto);
        inventarioService.inicializarProducto(
                guardado,
                dto.getStockInicial() != null ? BigDecimal.valueOf(dto.getStockInicial()) : BigDecimal.ZERO,
                dto.getStockMinimo() != null ? dto.getStockMinimo() : 1);

        procesarImagenes(guardado, imagenes, dto.getImagenesConfig());

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

        String slugFinal = dto.getSlug();
        if (slugFinal == null || slugFinal.trim().isEmpty()) {
            slugFinal = generarSlug(dto.getNombre());
        } else {
            slugFinal = generarSlug(slugFinal);
        }
        slugFinal = hacerSlugUnico(slugFinal, producto.getId());

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
        producto.setVisibleWeb(dto.getVisibleWeb() != null ? dto.getVisibleWeb() : false);
        producto.setDestacado(dto.getDestacado() != null ? dto.getDestacado() : false);
        producto.setSlug(slugFinal);
        producto.setDescripcionWeb(dto.getDescripcionWeb());
        producto.setEtiquetas(cargarEtiquetasPorIds(dto.getIdEtiquetas()));
        producto.setOrden(dto.getOrden() != null ? dto.getOrden() : 0);

        procesarImagenes(producto, imagenes, dto.getImagenesConfig());

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
        List<ProductoImagenResponseDTO> imagenes = productoImagenRepository.findByProductoId(p.getId()).stream()
                .sorted(Comparator.comparing((ProductoImagen img) -> img.getOrden() != null ? img.getOrden() : 0)
                        .thenComparing((ProductoImagen img) -> img.getId() != null ? img.getId() : 0L))
                .map(img -> ProductoImagenResponseDTO.builder()
                        .id(img.getId())
                        .rutaImagen(img.getRutaImagen())
                        .esPrincipal(img.getEsPrincipal())
                        .orden(img.getOrden())
                        .build())
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
                .imagenes(imagenes)
                .visibleWeb(p.getVisibleWeb())
                .destacado(p.getDestacado())
                .slug(p.getSlug())
                .descripcionWeb(p.getDescripcionWeb())
                .etiquetas(p.getEtiquetas().stream()
                        .map(e -> EtiquetaResponseDTO.builder().id(e.getId()).nombre(e.getNombre()).estado(e.getEstado()).build())
                        .collect(Collectors.toList()))
                .orden(p.getOrden())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProductoPublicResponseDTO> listarPublicos() {
        return productoRepository.findByVisibleWebTrueAndEstadoOrderByOrdenAscNombreAsc(ESTADO_ACTIVO).stream()
                .filter(p -> p.getStock() != null && p.getStock() > 0)
                .map(this::mapearAPublicResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductoPublicResponseDTO buscarPorSlug(String slug) {
        Producto p = productoRepository.findBySlugAndVisibleWebTrueAndEstado(slug, ESTADO_ACTIVO)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con el slug: " + slug));
        if (p.getStock() == null || p.getStock() <= 0) {
            throw new IllegalArgumentException("El producto solicitado no cuenta con stock disponible.");
        }
        return mapearAPublicResponse(p);
    }

    private ProductoPublicResponseDTO mapearAPublicResponse(Producto p) {
        List<ProductoImagenResponseDTO> imagenes = productoImagenRepository.findByProductoId(p.getId()).stream()
                .sorted(Comparator.comparing((ProductoImagen img) -> img.getOrden() != null ? img.getOrden() : 0)
                        .thenComparing((ProductoImagen img) -> img.getId() != null ? img.getId() : 0L))
                .map(img -> ProductoImagenResponseDTO.builder()
                        .id(img.getId())
                        .rutaImagen(img.getRutaImagen())
                        .esPrincipal(img.getEsPrincipal())
                        .orden(img.getOrden())
                        .build())
                .collect(Collectors.toList());

        List<String> tags = p.getEtiquetas().stream()
                .map(Etiqueta::getNombre)
                .collect(Collectors.toList());

        return ProductoPublicResponseDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .codigo(p.getCodigo())
                .modelo(p.getModelo())
                .descripcion(p.getDescripcion())
                .descripcionWeb(p.getDescripcionWeb())
                .precio(p.getPrecio())
                .slug(p.getSlug())
                .tipoProducto(p.getTipoProducto())
                .categoriaNombre(p.getCategoria().getNombre())
                .marcaNombre(p.getMarca().getNombre())
                .imagenes(imagenes)
                .etiquetas(tags)
                .orden(p.getOrden())
                .conStock(p.getStock() != null && p.getStock() > 0)
                .destacado(p.getDestacado() != null ? p.getDestacado() : false)
                .build();
    }

    private String generarSlug(String nombre) {
        if (nombre == null) return "";
        return nombre.toLowerCase()
                .replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }

    private String hacerSlugUnico(String baseSlug, Long idExcluido) {
        String slugTmp = baseSlug;
        int cont = 1;
        while (true) {
            boolean existe = idExcluido == null 
                ? productoRepository.existsBySlug(slugTmp)
                : productoRepository.existsBySlugAndIdNot(slugTmp, idExcluido);
            if (!existe) break;
            slugTmp = baseSlug + "-" + cont;
            cont++;
        }
        return slugTmp;
    }

    private java.util.Set<Etiqueta> cargarEtiquetasPorIds(java.util.List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new java.util.HashSet<>();
        }
        return new java.util.HashSet<>(etiquetaRepository.findAllById(ids));
    }

    private String extraerPublicId(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        try {
            int uploadIdx = url.indexOf("/image/upload/");
            if (uploadIdx == -1) {
                return null;
            }
            
            String path = url.substring(uploadIdx + "/image/upload/".length());
            
            if (path.startsWith("v")) {
                int firstSlash = path.indexOf('/');
                if (firstSlash != -1) {
                    String versionStr = path.substring(1, firstSlash);
                    if (versionStr.matches("\\d+")) {
                        path = path.substring(firstSlash + 1);
                    }
                }
            }
            
            int lastDotIdx = path.lastIndexOf('.');
            if (lastDotIdx != -1) {
                path = path.substring(0, lastDotIdx);
            }
            return path;
        } catch (Exception e) {
            return null;
        }
    }

    private void procesarImagenes(Producto producto, List<MultipartFile> archivos, List<ProductoImagenRequestDTO> config) throws IOException {
        if (config == null) {
            if (archivos != null && !archivos.isEmpty()) {
                List<ProductoImagen> existingImages = productoImagenRepository.findByProductoId(producto.getId());
                ProductoImagen principal = existingImages.stream()
                        .filter(img -> img.getEsPrincipal() != null && img.getEsPrincipal())
                        .findFirst()
                        .orElse(existingImages.isEmpty() ? null : existingImages.get(0));

                MultipartFile file = archivos.get(0);
                if (file != null && !file.isEmpty()) {
                    String url = cloudinaryService.subirImagen(file, producto.getCodigo());
                    if (principal != null) {
                        String publicId = extraerPublicId(principal.getRutaImagen());
                        if (publicId != null) {
                            try {
                                cloudinaryService.eliminarImagen(publicId);
                            } catch (Exception e) {
                                System.out.println("No se pudo eliminar de Cloudinary: " + e.getMessage());
                            }
                        }
                        principal.setRutaImagen(url);
                        principal.setEsPrincipal(true);
                        productoImagenRepository.save(principal);
                    } else {
                        ProductoImagen img = ProductoImagen.builder()
                                .producto(producto)
                                .rutaImagen(url)
                                .esPrincipal(true)
                                .orden(0)
                                .build();
                        productoImagenRepository.save(img);
                    }
                }
            }
            return;
        }

        List<ProductoImagen> existingImages = productoImagenRepository.findByProductoId(producto.getId());

        java.util.Set<Long> configIds = config.stream()
                .map(ProductoImagenRequestDTO::getId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        List<ProductoImagen> toDelete = existingImages.stream()
                .filter(img -> !configIds.contains(img.getId()))
                .collect(Collectors.toList());

        for (ProductoImagen img : toDelete) {
            String publicId = extraerPublicId(img.getRutaImagen());
            if (publicId != null) {
                try {
                    cloudinaryService.eliminarImagen(publicId);
                } catch (Exception e) {
                    System.out.println("No se pudo eliminar de Cloudinary: " + e.getMessage());
                }
            }
            productoImagenRepository.delete(img);
        }

        for (ProductoImagenRequestDTO req : config) {
            if (req.getId() != null) {
                ProductoImagen img = existingImages.stream()
                        .filter(i -> i.getId().equals(req.getId()))
                        .findFirst()
                        .orElse(null);
                if (img != null) {
                    img.setEsPrincipal(req.getEsPrincipal() != null ? req.getEsPrincipal() : false);
                    img.setOrden(req.getOrden() != null ? req.getOrden() : 0);
                    productoImagenRepository.save(img);
                }
            }
        }

        for (ProductoImagenRequestDTO req : config) {
            if (req.getId() == null) {
                Integer fileIndex = req.getFileIndex();
                if (fileIndex != null && archivos != null && fileIndex >= 0 && fileIndex < archivos.size()) {
                    MultipartFile file = archivos.get(fileIndex);
                    if (file != null && !file.isEmpty()) {
                        String url = cloudinaryService.subirImagen(file, producto.getCodigo());
                        ProductoImagen img = ProductoImagen.builder()
                                .producto(producto)
                                .rutaImagen(url)
                                .esPrincipal(req.getEsPrincipal() != null ? req.getEsPrincipal() : false)
                                .orden(req.getOrden() != null ? req.getOrden() : 0)
                                .build();
                        productoImagenRepository.save(img);
                    }
                }
            }
        }

        List<ProductoImagen> updatedImages = productoImagenRepository.findByProductoId(producto.getId());
        if (!updatedImages.isEmpty()) {
            boolean hasCover = updatedImages.stream().anyMatch(ProductoImagen::getEsPrincipal);
            if (!hasCover) {
                updatedImages.sort(Comparator.comparing((ProductoImagen img) -> img.getOrden() != null ? img.getOrden() : 0)
                        .thenComparing((ProductoImagen img) -> img.getId() != null ? img.getId() : 0L));
                ProductoImagen first = updatedImages.get(0);
                first.setEsPrincipal(true);
                productoImagenRepository.save(first);
            }
        }
    }
}
