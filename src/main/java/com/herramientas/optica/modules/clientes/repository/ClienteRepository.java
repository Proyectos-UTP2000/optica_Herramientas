package com.herramientas.optica.modules.clientes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.clientes.model.Cliente;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByNumeroDocumento(String numeroDocumento);

    Optional<Cliente> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    boolean existsByTelefono(String telefono);

    List<Cliente> findByEstadoNot(Integer estado);
}