package com.herramientas.optica.modules.ventas.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.ventas.model.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findByEstadoNotOrderByFechaDesc(Integer estado);

    List<Venta> findByCajaIdAndFechaBetweenAndEstadoOrderByFechaAsc(
            Long cajaId, LocalDateTime desde, LocalDateTime hasta, Integer estado);
}
