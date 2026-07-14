package com.herramientas.optica.modules.productos.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.model.Categoria;
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(0)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class CategoriaDataLoader implements ApplicationRunner {

    private final CategoriaRepository categoriaRepository;

    public CategoriaDataLoader(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (categoriaRepository.count() == 0) {
            categoriaRepository.save(Categoria.builder().nombre("Monturas").estado(1).build());
            categoriaRepository.save(Categoria.builder().nombre("Cristales").estado(1).build());
            categoriaRepository.save(Categoria.builder().nombre("Lentes de Contacto").estado(1).build());
            categoriaRepository.save(Categoria.builder().nombre("Accesorios").estado(1).build());
            categoriaRepository.save(Categoria.builder().nombre("Cuidado Visual").estado(1).build());
        }
    }
}
