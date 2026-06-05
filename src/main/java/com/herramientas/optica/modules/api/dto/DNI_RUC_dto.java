package com.herramientas.optica.modules.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

public class DNI_RUC_dto {
    @Data
    public static class DniResponse {
        private boolean success;
        private DatosDni datos;
    }

    @Data
    public static class DatosDni {
        private String dni;
        private String nombres;
        @JsonProperty("ape_paterno")
        private String apePaterno;
        @JsonProperty("ape_materno")
        private String apeMaterno;
        private Domiciliado domiciliado;
    }

    @Data
    public static class RucResponse {
        private boolean success;
        private DatosRuc datos;
    }

    @Data
    public static class DatosRuc {
        private String ruc;
        @JsonProperty("razon_social")
        private String razonSocial;
        private String estado;
        private String condicion;
        private Domiciliado domiciliado;
    }

    @Data
    public static class Domiciliado {
        private String direccion;
        private String distrito;
        private String provincia;
        private String departamento;
        private String ubigeo;
    }
}
