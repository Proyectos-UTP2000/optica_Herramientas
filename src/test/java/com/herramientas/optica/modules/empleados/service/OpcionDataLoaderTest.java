package com.herramientas.optica.modules.empleados.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.empleados.repository.OpcionRepository;

@SpringBootTest(properties = "app.seeding.enabled=true")
@ActiveProfiles("test")
@Transactional
class OpcionDataLoaderTest {

    @Autowired
    private OpcionDataLoader opcionDataLoader;

    @Autowired
    private OpcionRepository opcionRepository;

    @Test
    void verificarOpcionesCreaActualesYFuturasDeFormaIdempotente() {
        opcionDataLoader.verificarOpciones();
        long totalPrimeraCarga = opcionRepository.count();
        opcionDataLoader.verificarOpciones();

        assertThat(opcionRepository.count()).isEqualTo(totalPrimeraCarga);
        assertThat(opcionRepository.findByNombre("Ventas Operativas")).isPresent()
                .get()
                .satisfies(opcion -> {
                    assertThat(opcion.getRuta()).isEqualTo("/ventas");
                    assertThat(opcion.getPadre()).isNotNull();
                    assertThat(opcion.getPadre().getNombre()).isEqualTo("Clientes y Ventas");
                });
        assertThat(opcionRepository.findByNombre("Ventas")).isPresent()
                .get()
                .satisfies(opcion -> assertThat(opcion.getRuta()).isEqualTo("/reportes/ventas"));
        assertThat(opcionRepository.findByNombre("Catálogo Web")).isPresent()
                .get()
                .satisfies(opcion -> assertThat(opcion.getRuta()).isEqualTo("/catalogo-web"));
        assertThat(opcionRepository.findByNombre("Cajas Operativas")).isPresent()
                .get()
                .satisfies(opcion -> {
                    assertThat(opcion.getRuta()).isEqualTo("/cajas");
                    assertThat(opcion.getVisibleEnMenu()).isFalse();
                });
        assertThat(opcionRepository.findByNombre("Productos Bajo Stock")).isEmpty();
    }
}
