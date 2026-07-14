package com.herramientas.optica.modules.productos.service;

import java.time.LocalDate;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.model.Marca;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(0)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class MarcaDataLoader implements ApplicationRunner {

    private final MarcaRepository marcaRepository;

    public MarcaDataLoader(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (marcaRepository.count() == 0) {
            marcaRepository.save(Marca.builder().nombre("Ray-Ban").fecha(LocalDate.now()).estado(1).build());
            marcaRepository.save(Marca.builder().nombre("Oakley").fecha(LocalDate.now()).estado(1).build());
            marcaRepository.save(Marca.builder().nombre("Vogue").fecha(LocalDate.now()).estado(1).build());
            marcaRepository.save(Marca.builder().nombre("Arnette").fecha(LocalDate.now()).estado(1).build());
            marcaRepository.save(Marca.builder().nombre("Generico").fecha(LocalDate.now()).estado(1).build());
        }
    }
}
