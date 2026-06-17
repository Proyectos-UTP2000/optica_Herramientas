package com.herramientas.optica.modules.ventas.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.ventas.model.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findByEstadoNotOrderByFechaDesc(Integer estado);

    List<Venta> findByCajaIdAndFechaBetweenAndEstadoOrderByFechaAsc(
            Long cajaId, LocalDateTime desde, LocalDateTime hasta, Integer estado);

    List<Venta> findByFechaBetweenAndEstadoOrderByFechaAsc(
            LocalDateTime desde, LocalDateTime hasta, Integer estado);

    List<Venta> findByCajaIdOrderByFechaAsc(Long cajaId);

    @Query("""
            SELECT DISTINCT v
            FROM Venta v
            LEFT JOIN v.detalles d
            LEFT JOIN d.producto p
            WHERE v.fecha BETWEEN :desde AND :hasta
              AND v.estado = :estado
              AND (:empleadoId IS NULL OR v.empleado.id = :empleadoId)
              AND (:ventaId IS NULL OR v.id = :ventaId)
              AND (:medioPago IS NULL OR v.medioPago = :medioPago)
              AND (:texto IS NULL OR
                    LOWER(v.numeroComprobante) LIKE LOWER(CONCAT('%', :texto, '%')) OR
                    LOWER(v.cliente.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) OR
                    LOWER(v.cliente.apellidoPaterno) LIKE LOWER(CONCAT('%', :texto, '%')) OR
                    LOWER(v.cliente.apellidoMaterno) LIKE LOWER(CONCAT('%', :texto, '%')) OR
                    LOWER(v.empleado.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) OR
                    LOWER(v.empleado.apellidoPaterno) LIKE LOWER(CONCAT('%', :texto, '%')))
              AND (:productoTexto IS NULL OR
                    LOWER(p.nombre) LIKE LOWER(CONCAT('%', :productoTexto, '%')) OR
                    LOWER(p.codigo) LIKE LOWER(CONCAT('%', :productoTexto, '%')))
            ORDER BY v.fecha ASC
            """)
    List<Venta> buscarReporte(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta,
            @Param("estado") Integer estado,
            @Param("empleadoId") Long empleadoId,
            @Param("texto") String texto,
            @Param("productoTexto") String productoTexto,
            @Param("ventaId") Long ventaId,
            @Param("medioPago") com.herramientas.optica.modules.ventas.model.MedioPagoVenta medioPago);

    @Query("""
            SELECT d.producto.nombre as name, SUM(d.cantidad) as qty
            FROM VentaDetalle d
            WHERE d.venta.estado = 1
            GROUP BY d.producto.id, d.producto.nombre
            ORDER BY SUM(d.cantidad) DESC
            """)
    List<Object[]> findTopSellingProducts(org.springframework.data.domain.Pageable pageable);

    @Query("""
            SELECT p.marca.nombre, SUM(d.cantidad * d.precioUnitario), SUM(d.cantidad * COALESCE(p.costo, 0))
            FROM VentaDetalle d
            JOIN d.producto p
            WHERE d.venta.estado = 1
            GROUP BY p.marca.nombre
            """)
    List<Object[]> findRentabilidadPorMarca();

    @Query("""
            SELECT p.categoria.nombre, SUM(d.cantidad * d.precioUnitario), SUM(d.cantidad * COALESCE(p.costo, 0))
            FROM VentaDetalle d
            JOIN d.producto p
            WHERE d.venta.estado = 1
            GROUP BY p.categoria.nombre
            """)
    List<Object[]> findRentabilidadPorCategoria();
}
