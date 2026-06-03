package com.herramientas.optica.modules.compras.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.compras.model.TipoComprobante;

@Repository
public interface TipoComprobanteRepository extends JpaRepository<TipoComprobante, Integer> {
}
