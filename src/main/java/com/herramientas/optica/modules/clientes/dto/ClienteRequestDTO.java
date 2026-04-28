package com.herramientas.optica.modules.clientes.dto;

import lombok.Data;

@Data
public class ClienteRequestDTO {
    private String numeroDocumento;
    private Long idTipoDocumento;
    private String correo;
    private String telefono;
    private String direccion;
}
