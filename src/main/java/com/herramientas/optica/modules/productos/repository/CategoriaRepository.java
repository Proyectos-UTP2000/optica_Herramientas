package com.herramientas.optica.modules.productos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.productos.model.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByEstadoNot(Integer estado);

    boolean existsByNombre(String nombre);

    Optional<Categoria> findByNombre(String nombre);
}
