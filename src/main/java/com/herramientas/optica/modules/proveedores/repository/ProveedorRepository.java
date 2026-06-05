package com.herramientas.optica.modules.proveedores.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.proveedores.model.Proveedor;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {

    Optional<Proveedor> findByNumeroDocumento(String numeroDocumento);

    List<Proveedor> findByEstadoNot(Integer estado);
}
