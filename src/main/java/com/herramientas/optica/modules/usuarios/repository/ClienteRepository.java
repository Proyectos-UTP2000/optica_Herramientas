package com.herramientas.optica.modules.usuarios.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.usuarios.model.Cliente;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}