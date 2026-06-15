package com.herramientas.optica.modules.webconfig.repository;

import com.herramientas.optica.modules.webconfig.model.WebConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WebConfigRepository extends JpaRepository<WebConfig, Long> {
}
