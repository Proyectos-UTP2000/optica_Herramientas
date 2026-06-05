package com.herramientas.optica.modules.caja.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.caja.model.Caja;
import com.herramientas.optica.modules.caja.model.EstadoCaja;

@Repository
public interface CajaRepository extends JpaRepository<Caja, Long> {

    Optional<Caja> findByEmpleadoIdAndEstado(Long empleadoId, EstadoCaja estado);

    boolean existsByEmpleadoIdAndEstado(Long empleadoId, EstadoCaja estado);

    @Query("""
            SELECT c
            FROM Caja c
            WHERE c.fechaApertura BETWEEN :desde AND :hasta
              AND (:empleadoId IS NULL OR c.empleado.id = :empleadoId)
              AND (:estado IS NULL OR c.estado = :estado)
            ORDER BY c.fechaApertura DESC
            """)
    List<Caja> buscarHistorial(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta,
            @Param("empleadoId") Long empleadoId,
            @Param("estado") EstadoCaja estado);
}
