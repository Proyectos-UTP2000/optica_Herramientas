package com.herramientas.optica.modules.compras.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.compras.model.CompraDetalle;
import com.herramientas.optica.modules.compras.model.CompraDetalleId;

@Repository
public interface CompraDetalleRepository extends JpaRepository<CompraDetalle, CompraDetalleId> {
}
