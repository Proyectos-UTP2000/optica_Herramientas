package com.herramientas.optica.modules.productos.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.herramientas.optica.modules.productos.model.ProductoImagen;

@Repository
public interface ProductoImagenRepository extends JpaRepository<ProductoImagen, Long> {
    List<ProductoImagen> findByProductoId(Long productoId);
    void deleteByProductoId(Long productoId);
}
