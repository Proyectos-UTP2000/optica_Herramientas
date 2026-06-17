package com.herramientas.optica.modules.clientes.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(2)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class ClienteDataLoader implements ApplicationRunner {

    private final ClienteRepository clienteRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;

    public ClienteDataLoader(ClienteRepository clienteRepository, TipoDocumentoRepository tipoDocumentoRepository) {
        this.clienteRepository = clienteRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (clienteRepository.count() == 0) {
            TipoDocumento dni = tipoDocumentoRepository.findAll().stream()
                .filter(td -> "DNI".equals(td.getNombre()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("TipoDocumento DNI no encontrado para inicializar Cliente Varios"));

            clienteRepository.save(Cliente.builder()
                .nombre("Clientes Varios")
                .direccion(" ")
                .estado(1)
                .numeroDocumento("99999999")
                .tipoDocumento(dni)
                .build());
        }
    }
}
