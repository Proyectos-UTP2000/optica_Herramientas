package com.herramientas.optica.modules.compras.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.compras.model.Compra;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    List<Compra> findByEstadoNotOrderByFechaDesc(Integer estado);

    List<Compra> findByFechaBetweenAndEstadoNotOrderByFechaAsc(
            LocalDateTime desde, LocalDateTime hasta, Integer estado);

    List<Compra> findByProveedorIdAndFechaBetweenAndEstadoNotOrderByFechaAsc(
            Long proveedorId, LocalDateTime desde, LocalDateTime hasta, Integer estado);

    @Query("""
            SELECT c
            FROM Compra c
            WHERE c.fecha BETWEEN :desde AND :hasta
              AND c.estado <> :estadoBorrado
              AND (:proveedorTexto IS NULL OR
                    LOWER(c.proveedor.razonSocial) LIKE LOWER(CONCAT('%', :proveedorTexto, '%')) OR
                    LOWER(c.proveedor.nombreComercial) LIKE LOWER(CONCAT('%', :proveedorTexto, '%')) OR
                    LOWER(c.proveedor.numeroDocumento) LIKE LOWER(CONCAT('%', :proveedorTexto, '%')))
            ORDER BY c.fecha ASC
            """)
    List<Compra> buscarReporte(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta,
            @Param("estadoBorrado") Integer estadoBorrado,
            @Param("proveedorTexto") String proveedorTexto);
}
