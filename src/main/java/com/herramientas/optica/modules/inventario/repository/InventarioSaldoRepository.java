package com.herramientas.optica.modules.inventario.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.inventario.model.InventarioSaldo;

import jakarta.persistence.LockModeType;

@Repository
public interface InventarioSaldoRepository extends JpaRepository<InventarioSaldo, Long> {

    Optional<InventarioSaldo> findByProductoId(Long productoId);

    boolean existsByProductoId(Long productoId);

    @Query("""
            SELECT s
            FROM InventarioSaldo s
            WHERE s.stockActual <= s.stockMinimo
            """)
    List<InventarioSaldo> findProductosBajoStock();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s
            FROM InventarioSaldo s
            WHERE s.producto.id = :productoId
            """)
    Optional<InventarioSaldo> findByProductoIdForUpdate(@Param("productoId") Long productoId);
}
