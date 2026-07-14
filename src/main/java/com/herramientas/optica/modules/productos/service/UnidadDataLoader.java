package com.herramientas.optica.modules.productos.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.model.Unidad;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(0)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class UnidadDataLoader implements ApplicationRunner {

    private final UnidadRepository unidadRepository;

    public UnidadDataLoader(UnidadRepository unidadRepository) {
        this.unidadRepository = unidadRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (unidadRepository.count() == 0) {
            unidadRepository.save(Unidad.builder().nombre("Unidad").estado(1).build());
            unidadRepository.save(Unidad.builder().nombre("Par").estado(1).build());
            unidadRepository.save(Unidad.builder().nombre("Caja").estado(1).build());
            unidadRepository.save(Unidad.builder().nombre("Frasco").estado(1).build());
        }
    }
}
