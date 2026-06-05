package com.herramientas.optica.modules.clientes.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClienteResponseDTO {
    private Long id;
    private String numeroDocumento;
    private Long idTipoDocumento;
    private String tipoDocumentoNombre;
    private String nombreCompleto;

    private String nombres;
    private String apellidos;
    private String nombreEmpresa;

    private String correo;
    private String telefono;
    private String direccion;
    private String direccionEmpresa;
    private Integer estado;
}
