package com.herramientas.optica.modules.empleados.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.empleados.model.Empleado;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByNumeroDocumento(String numeroDocumento);

    boolean existsByCorreo(String correo);

    boolean existsByTelefono(String telefono);

    boolean existsByUsername(String username);

    boolean existsByNumeroDocumento(String username);

    List<Empleado> findByEstadoNot(Integer estado);

    long countByPerfilIdAndEstadoNot(Long perfilId, Integer estado);
}