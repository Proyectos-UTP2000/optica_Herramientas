package com.herramientas.optica.modules.compras.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.compras.model.Compra;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    List<Compra> findByEstadoNotOrderByFechaDesc(Integer estado);
}
