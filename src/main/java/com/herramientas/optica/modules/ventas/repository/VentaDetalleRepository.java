package com.herramientas.optica.modules.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.ventas.model.VentaDetalle;
import com.herramientas.optica.modules.ventas.model.VentaDetalleId;

@Repository
public interface VentaDetalleRepository extends JpaRepository<VentaDetalle, VentaDetalleId> {
}
