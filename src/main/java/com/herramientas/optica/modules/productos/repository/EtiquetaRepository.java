package com.herramientas.optica.modules.productos.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.herramientas.optica.modules.productos.model.Etiqueta;

public interface EtiquetaRepository extends JpaRepository<Etiqueta, Long> {
    List<Etiqueta> findByEstado(Integer estado);
    Optional<Etiqueta> findByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
