package com.herramientas.optica.modules.empleados.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(0)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class PerfilDataLoader implements ApplicationRunner {

    private final PerfilRepository perfilRepository;

    public PerfilDataLoader(PerfilRepository perfilRepository) {
        this.perfilRepository = perfilRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (perfilRepository.count() == 0) {
            perfilRepository.save(Perfil.builder()
                .nombre("ADMINISTRADOR")
                .descripcion("Acceso total al sistema.")
                .estado(1)
                .build());
            perfilRepository.save(Perfil.builder()
                .nombre("EMPLEADO")
                .descripcion("Acceso operativo estándar.")
                .estado(1)
                .build());
        }
    }
}
