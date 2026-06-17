package com.herramientas.optica.modules.empleados.repository;

import com.herramientas.optica.modules.empleados.model.Empleado;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByNumeroDocumento(String numeroDocumento);

    boolean existsByCorreo(String correo);

    boolean existsByTelefono(String telefono);

    boolean existsByUsername(String username);

    boolean existsByNumeroDocumento(String username);

    List<Empleado> findByEstadoNot(Integer estado);

    long countByPerfilIdAndEstadoNot(Long perfilId, Integer estado);

    Optional<Empleado> findByUsername(String username);

    Optional<Empleado> findByCorreo(String correo);

    Optional<Empleado> findByCorreoOrUsername(String correo, String username);
}
