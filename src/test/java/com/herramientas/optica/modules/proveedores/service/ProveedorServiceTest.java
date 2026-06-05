package com.herramientas.optica.modules.proveedores.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.Domiciliado;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.DatosRuc;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.RucResponse;
import com.herramientas.optica.modules.api.service.DNI_RUC_Service;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.proveedores.dto.ProveedorRequestDTO;
import com.herramientas.optica.modules.proveedores.dto.ProveedorResponseDTO;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProveedorServiceTest {

    @Autowired
    private ProveedorService proveedorService;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Test
    void crearProveedorRegistraDatosNormalizados() {
        ProveedorResponseDTO proveedor = proveedorService.crearProveedor(request("20601234567", " Optica Central SAC "));

        assertThat(proveedor.getId()).isNotNull();
        assertThat(proveedor.getNumeroDocumento()).isEqualTo("20601234567");
        assertThat(proveedor.getRazonSocial()).isEqualTo("OPTICA CENTRAL SAC");
        assertThat(proveedor.getNombreComercial()).isEqualTo("OPTICA CENTRAL");
        assertThat(proveedor.getCorreo()).isEqualTo("ventas@central.test");
        assertThat(proveedor.getEstado()).isEqualTo(1);
    }

    @Test
    void crearProveedorRucSinRazonSocialConsultaSunat() {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("RUC")
                .estado(1)
                .build());
        ProveedorRequestDTO dto = new ProveedorRequestDTO();
        dto.setIdTipoDocumento(tipoDocumento.getId());
        dto.setNumeroDocumento("20601234573");
        dto.setTelefono("987654321");
        dto.setCorreo("SUNAT@PROVEEDOR.TEST");

        ProveedorResponseDTO proveedor = proveedorService.crearProveedor(dto);

        assertThat(proveedor.getRazonSocial()).isEqualTo("PROVEEDOR SUNAT SAC");
        assertThat(proveedor.getDireccion()).isEqualTo("AV. SUNAT 456");
        assertThat(proveedor.getCorreo()).isEqualTo("sunat@proveedor.test");
    }

    @Test
    void crearProveedorConDocumentoDuplicadoActivoFalla() {
        proveedorService.crearProveedor(request("20601234568", "Proveedor Uno SAC"));

        assertThatThrownBy(() -> proveedorService.crearProveedor(request("20601234568", "Proveedor Duplicado SAC")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ya se encuentra registrado");
    }

    @Test
    void crearProveedorConDocumentoEliminadoSolicitaReactivacion() {
        ProveedorResponseDTO proveedor = proveedorService.crearProveedor(request("20601234569", "Proveedor Baja SAC"));
        proveedorService.borradoLogico(proveedor.getId());

        assertThatThrownBy(() -> proveedorService.crearProveedor(request("20601234569", "Proveedor Baja SAC")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("está eliminado");
    }

    @Test
    void reactivarProveedorEliminadoLoDevuelveActivo() {
        ProveedorResponseDTO proveedor = proveedorService.crearProveedor(request("20601234570", "Proveedor Reactiva SAC"));
        proveedorService.borradoLogico(proveedor.getId());

        ProveedorResponseDTO reactivado = proveedorService.reactivarProveedor("20601234570");

        assertThat(reactivado.getEstado()).isEqualTo(1);
    }

    @Test
    void cambiarEstadoAlternaActivoYDeshabilitado() {
        ProveedorResponseDTO proveedor = proveedorService.crearProveedor(request("20601234571", "Proveedor Estado SAC"));

        ProveedorResponseDTO deshabilitado = proveedorService.cambiarEstado(proveedor.getId());
        ProveedorResponseDTO activado = proveedorService.cambiarEstado(proveedor.getId());

        assertThat(deshabilitado.getEstado()).isEqualTo(2);
        assertThat(activado.getEstado()).isEqualTo(1);
    }

    @Test
    void borradoLogicoOcultaProveedorDeListadosActivosEInactivos() {
        ProveedorResponseDTO proveedor = proveedorService.crearProveedor(request("20601234572", "Proveedor Borrado SAC"));

        proveedorService.borradoLogico(proveedor.getId());

        assertThat(proveedorService.listarActivosEInactivos())
                .extracting(ProveedorResponseDTO::getNumeroDocumento)
                .doesNotContain("20601234572");
    }

    private ProveedorRequestDTO request(String numeroDocumento, String razonSocial) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("RUC " + numeroDocumento + " " + System.nanoTime())
                .estado(1)
                .build());

        ProveedorRequestDTO dto = new ProveedorRequestDTO();
        dto.setIdTipoDocumento(tipoDocumento.getId());
        dto.setNumeroDocumento(numeroDocumento);
        dto.setRazonSocial(razonSocial);
        dto.setNombreComercial(" Optica Central ");
        dto.setDireccion(" Av. Peru 123 ");
        dto.setTelefono("987654321");
        dto.setCorreo("VENTAS@CENTRAL.TEST");
        return dto;
    }

    @TestConfiguration
    static class ProveedorServiceTestConfig {

        @Bean
        @Primary
        DNI_RUC_Service dniRucService() {
            return new DNI_RUC_Service() {
                @Override
                public RucResponse consultarRuc(String ruc) {
                    Domiciliado domiciliado = new Domiciliado();
                    domiciliado.setDireccion(" Av. Sunat 456 ");

                    DatosRuc datos = new DatosRuc();
                    datos.setRuc(ruc);
                    datos.setRazonSocial(" Proveedor Sunat SAC ");
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
