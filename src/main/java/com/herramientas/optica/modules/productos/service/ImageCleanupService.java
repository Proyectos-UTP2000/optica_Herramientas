package com.herramientas.optica.modules.productos.service;

import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.repository.ProductoImagenRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ImageCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(ImageCleanupService.class);
    
    private final ProductoRepository productoRepository;
    private final ProductoImagenRepository productoImagenRepository;
    private final CloudinaryService cloudinaryService;

    public ImageCleanupService(ProductoRepository productoRepository, 
                               ProductoImagenRepository productoImagenRepository, 
                               CloudinaryService cloudinaryService) {
        this.productoRepository = productoRepository;
        this.productoImagenRepository = productoImagenRepository;
        this.cloudinaryService = cloudinaryService;
    }

    // Ejecutar todos los días a las 3 AM
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void limpiarImagenesHuerfanas() {
        logger.info("Iniciando tarea de limpieza de imágenes huérfanas...");
        // 30 días atrás
        LocalDateTime fechaLimite = LocalDateTime.now().minusDays(30);
        
        List<Producto> productosObsoletos = productoRepository.findProductosBorradosAntesDe(fechaLimite);
        
        for (Producto producto : productosObsoletos) {
            try {
                // Borrar carpeta en Cloudinary
                cloudinaryService.eliminarCarpetaProducto(producto.getCodigo());
                // Borrar registros de la BD
                productoImagenRepository.deleteByProductoId(producto.getId());
                logger.info("Imágenes eliminadas para el producto: {}", producto.getCodigo());
            } catch (Exception e) {
                logger.error("Error al eliminar imágenes del producto: {}", producto.getCodigo(), e);
            }
        }
        logger.info("Limpieza finalizada.");
    }
}
