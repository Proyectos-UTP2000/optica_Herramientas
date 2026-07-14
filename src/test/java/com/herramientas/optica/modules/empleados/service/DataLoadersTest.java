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
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;
import com.herramientas.optica.modules.productos.repository.EtiquetaRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.proveedores.repository.ProveedorRepository;

@SpringBootTest(properties = {
    "app.seeding.enabled=true",
    "spring.datasource.url=jdbc:h2:mem:optica_test_dataloaders;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1"
})
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

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired
    private UnidadRepository unidadRepository;

    @Autowired
    private EtiquetaRepository etiquetaRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Test
    void verificarDatosInicialesSeCarganCorrectamente() {
        assertThat(tipoDocumentoRepository.findAll().stream().anyMatch(td -> "DNI".equals(td.getNombre()))).isTrue();
        assertThat(perfilRepository.findByNombre("ADMINISTRADOR")).isPresent();
        assertThat(tipoComprobanteRepository.findAll().stream().anyMatch(tc -> "NOTA DE VENTA".equals(tc.getNombre()))).isTrue();
        assertThat(webConfigRepository.count()).isGreaterThan(0);
        assertThat(clienteRepository.findAll().stream().anyMatch(c -> "Clientes Varios".equals(c.getNombre()))).isTrue();
        assertThat(empleadoRepository.findAll().stream().anyMatch(e -> "admin".equals(e.getUsername()))).isTrue();

        // Nuevos dataloaders
        assertThat(categoriaRepository.findAll().stream().anyMatch(c -> "Monturas".equals(c.getNombre()))).isTrue();
        assertThat(marcaRepository.findAll().stream().anyMatch(m -> "Ray-Ban".equals(m.getNombre()))).isTrue();
        assertThat(unidadRepository.findAll().stream().anyMatch(u -> "Unidad".equals(u.getNombre()))).isTrue();
        assertThat(etiquetaRepository.findAll().stream().anyMatch(et -> "Destacado".equalsIgnoreCase(et.getNombre()))).isTrue();
        assertThat(proveedorRepository.findAll().stream().anyMatch(p -> "20123456789".equals(p.getNumeroDocumento()))).isTrue();
        assertThat(productoRepository.findAll().stream().anyMatch(p -> "RB-AVIATOR-001".equals(p.getCodigo()))).isTrue();
    }
}
