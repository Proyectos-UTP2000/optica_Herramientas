package com.herramientas.optica.modules.compras.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.compras.model.TipoComprobante;
import com.herramientas.optica.modules.compras.repository.TipoComprobanteRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(0)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class TipoComprobanteDataLoader implements ApplicationRunner {

    private final TipoComprobanteRepository tipoComprobanteRepository;

    public TipoComprobanteDataLoader(TipoComprobanteRepository tipoComprobanteRepository) {
        this.tipoComprobanteRepository = tipoComprobanteRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (tipoComprobanteRepository.count() == 0) {
            tipoComprobanteRepository.save(TipoComprobante.builder()
                .nombre("NOTA DE VENTA")
                .serie("N001")
                .correlativoActual(0)
                .estado(1)
                .build());
            tipoComprobanteRepository.save(TipoComprobante.builder()
                .nombre("BOLETA")
                .serie("B001")
                .correlativoActual(0)
                .estado(1)
                .build());
            tipoComprobanteRepository.save(TipoComprobante.builder()
                .nombre("FACTURA")
                .serie("F001")
                .correlativoActual(0)
                .estado(1)
                .build());
        }
    }
}
