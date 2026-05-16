package com.herramientas.optica.modules.productos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.productos.model.Unidad;

@Repository
public interface UnidadRepository extends JpaRepository<Unidad, Integer> {
    List<Unidad> findByEstadoNot(Integer estado);

    boolean existsByNombre(String nombre);
}