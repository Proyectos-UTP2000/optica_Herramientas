package com.herramientas.optica.modules.laboratorio.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.herramientas.optica.modules.laboratorio.model.OrdenLaboratorio;
import com.herramientas.optica.modules.laboratorio.model.EstadoOrden;

@Repository
public interface OrdenLaboratorioRepository extends JpaRepository<OrdenLaboratorio, Long> {
    List<OrdenLaboratorio> findByEstadoOrdenOrderByCreatedAtDesc(EstadoOrden estadoOrden);
    List<OrdenLaboratorio> findByVentaClienteIdOrderByCreatedAtDesc(Long clienteId);
}
