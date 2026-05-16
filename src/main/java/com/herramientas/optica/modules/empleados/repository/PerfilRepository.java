package com.herramientas.optica.modules.empleados.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.empleados.model.Perfil;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, Long> {
    boolean existsByNombre(String nombre);
    java.util.Optional<Perfil> findByNombre(String nombre);
}