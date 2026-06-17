package com.herramientas.optica.modules.caja.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.caja.model.MovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;

@Repository
public interface MovimientoCajaRepository extends JpaRepository<MovimientoCaja, Long> {

    List<MovimientoCaja> findByCajaIdOrderByFechaAsc(Long cajaId);

    @Query("""
            SELECT COALESCE(SUM(m.monto), 0)
            FROM MovimientoCaja m
            WHERE m.caja.id = :cajaId
              AND m.tipo = :tipo
              AND m.anulado = false
            """)
    BigDecimal sumarMontoPorCajaYTipo(@Param("cajaId") Long cajaId, @Param("tipo") TipoMovimientoCaja tipo);

    List<MovimientoCaja> findByAnuladoFalseAndFechaAfterOrderByFechaAsc(java.time.LocalDateTime desde);
}
