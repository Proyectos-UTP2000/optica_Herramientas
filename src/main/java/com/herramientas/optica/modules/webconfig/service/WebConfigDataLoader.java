package com.herramientas.optica.modules.webconfig.service;

import java.time.LocalDateTime;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.webconfig.model.WebConfig;
import com.herramientas.optica.modules.webconfig.repository.WebConfigRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(0)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class WebConfigDataLoader implements ApplicationRunner {

    private final WebConfigRepository webConfigRepository;

    public WebConfigDataLoader(WebConfigRepository webConfigRepository) {
        this.webConfigRepository = webConfigRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (webConfigRepository.count() == 0) {
            webConfigRepository.save(WebConfig.builder()
                .telefonoContacto("+51999999999")
                .correoContacto("contacto@optica.com")
                .direccion("Av. Principal 123")
                .horarioAtencion("Lunes a Sábado 9:00 AM - 8:00 PM")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());
        }
    }
}
