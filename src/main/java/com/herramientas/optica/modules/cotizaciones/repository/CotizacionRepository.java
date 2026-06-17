package com.herramientas.optica.modules.cotizaciones.repository;

import com.herramientas.optica.modules.cotizaciones.model.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CotizacionRepository extends JpaRepository<Cotizacion, Long> {
    List<Cotizacion> findAllByOrderByFechaCreacionDesc();
}
