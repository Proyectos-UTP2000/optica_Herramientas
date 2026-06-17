package com.herramientas.optica.modules.empleados.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.empleados.model.Opcion;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;

@SpringBootTest(properties = "app.seeding.enabled=true")
@ActiveProfiles("test")
@Transactional
class PerfilOpcionDataLoaderTest {

    @Autowired
    private OpcionDataLoader opcionDataLoader;

    @Autowired
    private PerfilOpcionDataLoader perfilOpcionDataLoader;

    @Autowired
    private PerfilRepository perfilRepository;

    @Test
    void verificarRelacionesAsignadasAlAdministradorEsIdempotenteYNoAsignaFuturas() {
        Perfil admin = perfilRepository.findByNombre("ADMINISTRADOR")
                .orElseGet(() -> perfilRepository.save(Perfil.builder()
                        .nombre("ADMINISTRADOR")
                        .descripcion("Administrador de prueba")
                        .estado(1)
                        .build()));
        opcionDataLoader.verificarOpciones();

        perfilOpcionDataLoader.verificarRelacionesPerfilOpcion();
        int asignacionesPrimeraCarga = perfilRepository.findById(admin.getId()).orElseThrow().getOpciones().size();
        perfilOpcionDataLoader.verificarRelacionesPerfilOpcion();

        Perfil adminRecargado = perfilRepository.findById(admin.getId()).orElseThrow();
        Set<String> rutas = adminRecargado.getOpciones().stream()
                .map(Opcion::getRuta)
                .collect(Collectors.toSet());

        assertThat(adminRecargado.getOpciones()).hasSize(asignacionesPrimeraCarga);
        assertThat(rutas)
                .contains("/clientes", "/cajas", "/inventario", "/proveedores", "/compras", "/ventas",
                        "/reportes/caja", "/reportes/kardex", "/reportes/ventas", "/reportes/compras",
                        "/catalogo-web", "/cotizaciones", "/etiquetas")
                .doesNotContain("/reportes/bajo-stock");
    }
}
