package com.herramientas.optica.modules.caja.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.caja.model.Gasto;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findByCajaIdOrderByFechaAsc(Long cajaId);
}
