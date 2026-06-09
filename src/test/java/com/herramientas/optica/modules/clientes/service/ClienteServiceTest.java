package com.herramientas.optica.modules.clientes.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.DatosDni;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.DatosRuc;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.DniResponse;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.Domiciliado;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.RucResponse;
import com.herramientas.optica.modules.api.service.DNI_RUC_Service;
import com.herramientas.optica.modules.clientes.dto.ClienteRequestDTO;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ClienteServiceTest {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void seedTiposDocumento() {
        jdbcTemplate.update("MERGE INTO tipo_documento (id_tipodocumento, tipodoc_nombre, tipodoc_estado) KEY(id_tipodocumento) VALUES (1, 'DNI', 1)");
        jdbcTemplate.update("MERGE INTO tipo_documento (id_tipodocumento, tipodoc_nombre, tipodoc_estado) KEY(id_tipodocumento) VALUES (2, 'RUC', 1)");
    }

    @Test
    void crearClienteDniExigeOchoDigitos() {
        ClienteRequestDTO dto = request("1234567", 1L);

        assertThatThrownBy(() -> clienteService.crearCliente(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("DNI debe tener 8 dígitos");

        assertThat(clienteRepository.findByNumeroDocumento("1234567")).isEmpty();
    }

    @Test
    void crearClienteRucExigeOnceDigitos() {
        ClienteRequestDTO dto = request("2060123456", 2L);

        assertThatThrownBy(() -> clienteService.crearCliente(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("RUC debe tener 11 dígitos");

        assertThat(clienteRepository.findByNumeroDocumento("2060123456")).isEmpty();
    }

    @Test
    void crearClienteRucGuardaRazonSocialYDireccionEmpresa() {
        ClienteRequestDTO dto = request("20601234567", 2L);

        var response = clienteService.crearCliente(dto);

        assertThat(response.getNumeroDocumento()).isEqualTo("20601234567");
        assertThat(response.getNombreCompleto()).isEqualTo("CLIENTE RUC SAC");
        assertThat(response.getNombreEmpresa()).isEqualTo("CLIENTE RUC SAC");
        assertThat(response.getDireccionEmpresa()).isEqualTo("AV. RUC 123");
        assertThat(response.getDireccion()).isEqualTo("AV. RUC 123");
    }

    private ClienteRequestDTO request(String numeroDocumento, Long idTipoDocumento) {
        ClienteRequestDTO dto = new ClienteRequestDTO();
        dto.setNumeroDocumento(numeroDocumento);
        dto.setIdTipoDocumento(idTipoDocumento);
        dto.setTelefono("987654321");
        dto.setCorreo("cliente" + numeroDocumento + "@test.local");
        return dto;
    }

    @TestConfiguration
    static class ClienteServiceTestConfig {

        @Bean
        @Primary
        DNI_RUC_Service dniRucService() {
            return new DNI_RUC_Service() {
                @Override
                public DniResponse consultarDni(String dni) {
                    DatosDni datos = new DatosDni();
                    datos.setDni(dni);
                    datos.setNombres("Cliente");
                    datos.setApePaterno("Dni");
                    datos.setApeMaterno("Test");

                    DniResponse response = new DniResponse();
                    response.setSuccess(true);
                    response.setDatos(datos);
                    return response;
                }

                @Override
                public RucResponse consultarRuc(String ruc) {
                    Domiciliado domiciliado = new Domiciliado();
                    domiciliado.setDireccion("AV. RUC 123");

                    DatosRuc datos = new DatosRuc();
                    datos.setRuc(ruc);
                    datos.setRazonSocial("CLIENTE RUC SAC");
                    datos.setDomiciliado(domiciliado);

                    RucResponse response = new RucResponse();
                    response.setSuccess(true);
                    response.setDatos(datos);
                    return response;
                }
            };
        }
    }
}
