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

    long countByCategoriaIdAndEstadoNot(Long categoriaId, Integer estado);

    long countByMarcaIdAndEstadoNot(Long marcaId, Integer estado);

    long countByUnidadVentaIdOrUnidadCompraIdAndEstadoNot(Integer unidadVentaId, Integer unidadCompraId,
            Integer estado);

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
}