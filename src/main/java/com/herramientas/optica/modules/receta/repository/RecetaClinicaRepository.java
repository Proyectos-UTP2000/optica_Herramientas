package com.herramientas.optica.modules.receta.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.herramientas.optica.modules.receta.model.RecetaClinica;

@Repository
public interface RecetaClinicaRepository extends JpaRepository<RecetaClinica, Long> {
    List<RecetaClinica> findByClienteIdOrderByFechaEvaluacionDesc(Long clienteId);
}
