package com.herramientas.optica.modules.productos.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.model.Etiqueta;
import com.herramientas.optica.modules.productos.repository.EtiquetaRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(0)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class EtiquetaDataLoader implements ApplicationRunner {

    private final EtiquetaRepository etiquetaRepository;

    public EtiquetaDataLoader(EtiquetaRepository etiquetaRepository) {
        this.etiquetaRepository = etiquetaRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (etiquetaRepository.count() == 0) {
            etiquetaRepository.save(Etiqueta.builder().nombre("Destacado").estado(1).build());
            etiquetaRepository.save(Etiqueta.builder().nombre("Nuevo").estado(1).build());
            etiquetaRepository.save(Etiqueta.builder().nombre("Oferta").estado(1).build());
            etiquetaRepository.save(Etiqueta.builder().nombre("Premium").estado(1).build());
        }
    }
}
