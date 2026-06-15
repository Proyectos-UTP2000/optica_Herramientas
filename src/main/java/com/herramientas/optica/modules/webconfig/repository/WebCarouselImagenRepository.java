package com.herramientas.optica.modules.webconfig.repository;

import com.herramientas.optica.modules.webconfig.model.WebCarouselImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WebCarouselImagenRepository extends JpaRepository<WebCarouselImagen, Long> {
}
