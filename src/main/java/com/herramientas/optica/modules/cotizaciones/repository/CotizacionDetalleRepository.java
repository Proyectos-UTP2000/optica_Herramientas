package com.herramientas.optica.modules.cotizaciones.repository;

import com.herramientas.optica.modules.cotizaciones.model.CotizacionDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CotizacionDetalleRepository extends JpaRepository<CotizacionDetalle, Long> {
}
