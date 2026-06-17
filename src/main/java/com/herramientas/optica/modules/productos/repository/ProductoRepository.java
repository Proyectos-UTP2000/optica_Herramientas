package com.herramientas.optica.modules.productos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.productos.model.Producto;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByEstadoNot(Integer estado);

    boolean existsByCodigo(String codigo);

    @Query(value = """
            SELECT COUNT(DISTINCT p.id_producto)
            FROM producto p
            WHERE p.id_categoria = :categoriaId
              AND p.produc_estado <> :estadoBorrado
            """, nativeQuery = true)
    long countRelacionadosPorCategoria(@Param("categoriaId") Long categoriaId,
            @Param("estadoBorrado") Integer estadoBorrado);

    @Query(value = """
            SELECT COUNT(DISTINCT p.id_producto)
            FROM producto p
            WHERE p.id_marca = :marcaId
              AND p.produc_estado <> :estadoBorrado
            """, nativeQuery = true)
    long countRelacionadosPorMarca(@Param("marcaId") Long marcaId,
            @Param("estadoBorrado") Integer estadoBorrado);

    @Query(value = """
            SELECT COUNT(DISTINCT p.id_producto)
            FROM producto p
            WHERE (p.id_unidad_venta = :unidadId OR p.id_unidad_compra = :unidadId)
              AND p.produc_estado <> :estadoBorrado
            """, nativeQuery = true)
    long countRelacionadosPorUnidad(@Param("unidadId") Integer unidadId,
            @Param("estadoBorrado") Integer estadoBorrado);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE producto SET id_marca = :destinoId WHERE id_marca = :origenId AND produc_estado <> :estadoBorrado", nativeQuery = true)
    int reasignarMarca(@Param("origenId") Long origenId, @Param("destinoId") Long destinoId,
            @Param("estadoBorrado") Integer estadoBorrado);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE producto SET id_categoria = :destinoId WHERE id_categoria = :origenId AND produc_estado <> :estadoBorrado", nativeQuery = true)
    int reasignarCategoria(@Param("origenId") Long origenId, @Param("destinoId") Long destinoId,
            @Param("estadoBorrado") Integer estadoBorrado);

    @Query("SELECT p FROM Producto p WHERE p.estado = 0 AND p.updatedAt < :fechaLimite")
    List<Producto> findProductosBorradosAntesDe(@Param("fechaLimite") LocalDateTime fechaLimite);

    List<Producto> findByVisibleWebTrueAndEstadoOrderByOrdenAscNombreAsc(Integer estado);
    java.util.Optional<Producto> findBySlugAndVisibleWebTrueAndEstado(String slug, Integer estado);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);

    @Query("""
            SELECT SUM(p.stock * COALESCE(p.costo, 0)), SUM(p.stock * COALESCE(p.precio, 0))
            FROM Producto p
            WHERE p.estado = 1
            """)
    List<Object[]> getValoresInventario();
}
