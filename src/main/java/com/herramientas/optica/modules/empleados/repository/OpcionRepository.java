package com.herramientas.optica.modules.empleados.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.empleados.model.Opcion;

@Repository
public interface OpcionRepository extends JpaRepository<Opcion, Long> {
    java.util.Optional<Opcion> findByNombre(String nombre);
    java.util.List<Opcion> findByRuta(String ruta);
}
