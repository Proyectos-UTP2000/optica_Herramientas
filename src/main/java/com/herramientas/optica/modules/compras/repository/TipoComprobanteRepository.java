package com.herramientas.optica.modules.compras.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.herramientas.optica.modules.compras.model.TipoComprobante;

import jakarta.persistence.LockModeType;

@Repository
public interface TipoComprobanteRepository extends JpaRepository<TipoComprobante, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from TipoComprobante t where t.id = :id")
    Optional<TipoComprobante> findByIdForUpdate(@Param("id") Integer id);
}
