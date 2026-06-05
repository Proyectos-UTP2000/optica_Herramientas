package com.herramientas.optica.modules.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.DatosRuc;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.Domiciliado;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.RucResponse;
import com.herramientas.optica.modules.api.service.DNI_RUC_Service;

class RucControllerTest {

    private FakeDniRucService dniRucService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        dniRucService = new FakeDniRucService();
        mockMvc = MockMvcBuilders.standaloneSetup(new RucController(dniRucService)).build();
    }

    @Test
    void consultarRucDevuelveDatosDeSunat() throws Exception {
        RucResponse response = new RucResponse();
        response.setSuccess(true);

        Domiciliado domiciliado = new Domiciliado();
        domiciliado.setDireccion("AV. LOS PROVEEDORES 123");

        DatosRuc datos = new DatosRuc();
        datos.setRuc("20601234567");
        datos.setRazonSocial("PROVEEDOR CENTRAL SAC");
        datos.setEstado("ACTIVO");
        datos.setCondicion("HABIDO");
        datos.setDomiciliado(domiciliado);

        response.setDatos(datos);
        dniRucService.response = response;

        mockMvc.perform(get("/api/v1/ruc/20601234567"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.datos.ruc").value("20601234567"))
                .andExpect(jsonPath("$.datos.razon_social").value("PROVEEDOR CENTRAL SAC"))
                .andExpect(jsonPath("$.datos.domiciliado.direccion").value("AV. LOS PROVEEDORES 123"));

        org.assertj.core.api.Assertions.assertThat(dniRucService.rucConsultado).isEqualTo("20601234567");
    }

    private static class FakeDniRucService extends DNI_RUC_Service {
        private RucResponse response;
        private String rucConsultado;

        @Override
        public RucResponse consultarRuc(String ruc) {
            this.rucConsultado = ruc;
            return response;
        }
    }
}
