package com.herramientas.optica.modules.empleados.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.compras.repository.TipoComprobanteRepository;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;
import com.herramientas.optica.modules.webconfig.repository.WebConfigRepository;

@SpringBootTest(properties = "app.seeding.enabled=true")
@ActiveProfiles("test")
@Transactional
class DataLoadersTest {

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private TipoComprobanteRepository tipoComprobanteRepository;

    @Autowired
    private WebConfigRepository webConfigRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Test
    void verificarDatosInicialesSeCarganCorrectamente() {
        assertThat(tipoDocumentoRepository.findAll().stream().anyMatch(td -> "DNI".equals(td.getNombre()))).isTrue();
        assertThat(perfilRepository.findByNombre("ADMINISTRADOR")).isPresent();
        assertThat(tipoComprobanteRepository.findAll().stream().anyMatch(tc -> "NOTA DE VENTA".equals(tc.getNombre()))).isTrue();
        assertThat(webConfigRepository.count()).isGreaterThan(0);
        assertThat(clienteRepository.findAll().stream().anyMatch(c -> "Clientes Varios".equals(c.getNombre()))).isTrue();
        assertThat(empleadoRepository.findAll().stream().anyMatch(e -> "admin".equals(e.getUsername()))).isTrue();
    }
}
