package com.herramientas.optica.modules.clientes.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(0)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class TipoDocumentoDataLoader implements ApplicationRunner {

    private final TipoDocumentoRepository tipoDocumentoRepository;

    public TipoDocumentoDataLoader(TipoDocumentoRepository tipoDocumentoRepository) {
        this.tipoDocumentoRepository = tipoDocumentoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (tipoDocumentoRepository.count() == 0) {
            tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("DNI")
                .estado(1)
                .build());
            tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("RUC")
                .estado(1)
                .build());
            tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("Carnet de Extranjería")
                .estado(1)
                .build());
        }
    }
}
