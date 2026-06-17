package com.herramientas.optica.modules.receta.service;

import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;
import com.herramientas.optica.modules.receta.dto.RecetaRequestDTO;
import com.herramientas.optica.modules.receta.dto.RecetaResponseDTO;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RecetaServiceTest {
    @Autowired
    private RecetaService service;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Test
    void testRegistrarYListarReceta() {
        Empleado empleado = crearEmpleado("optometrista_test");
        Cliente cliente = crearCliente("99000001", "Cliente Test");

        RecetaRequestDTO request = RecetaRequestDTO.builder()
                .clienteId(cliente.getId())
                .empleadoId(empleado.getId())
                .odEsfera(new BigDecimal("-2.25"))
                .odCilindro(new BigDecimal("-0.75"))
                .odEje(180)
                .oiEsfera(new BigDecimal("-2.00"))
                .oiCilindro(new BigDecimal("-0.50"))
                .oiEje(170)
                .distanciaPupilar(new BigDecimal("62.50"))
                .adicion(new BigDecimal("1.75"))
                .tipoLuna("Progresivo")
                .materialSugerido("Policarbonato")
                .tratamientos(Set.of("Antireflex", "Filtro Azul"))
                .observaciones("Recomendaciones de uso constante")
                .build();

        RecetaResponseDTO response = service.registrar(request);

        assertNotNull(response.getId());
        assertEquals(new BigDecimal("-2.25"), response.getOdEsfera());
        assertTrue(response.getTratamientos().contains("Antireflex"));
        assertEquals(1, service.listarPorCliente(cliente.getId()).size());
    }

    private Cliente crearCliente(String documento, String nombre) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("DNI RECETA " + documento)
                .build());
        return clienteRepository.save(Cliente.builder()
                .tipoDocumento(tipoDocumento)
                .numeroDocumento(documento)
                .nombre(nombre)
                .apellidoPaterno("Prueba")
                .apellidoMaterno("Recetas")
                .direccion("Direccion cliente")
                .telefono("987654321")
                .correo("cliente" + documento + "@example.test")
                .estado(1)
                .build());
    }

    private Empleado crearEmpleado(String username) {
        Perfil perfil = perfilRepository.save(Perfil.builder()
                .nombre("PERFIL_" + username)
                .descripcion("Perfil de optometrista")
                .estado(1)
                .build());

        return empleadoRepository.save(Empleado.builder()
                .nombre("Empleado")
                .username(username)
                .apellidoPaterno("Optometrista")
                .apellidoMaterno("Prueba")
                .correo(username + "@example.test")
                .contrasena("secret")
                .telefono("999888777")
                .direccion("Direccion de prueba")
                .estado(1)
                .numeroDocumento("88877766")
                .perfil(perfil)
                .idTipoDocumento(1L)
                .build());
    }
}
