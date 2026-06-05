package com.herramientas.optica.modules.proveedores.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProveedorResponseDTO {
    private Long id;
    private Long idTipoDocumento;
    private String tipoDocumentoNombre;
    private String numeroDocumento;
    private String razonSocial;
    private String nombreComercial;
    private String direccion;
    private String telefono;
    private String correo;
    private Integer estado;
}
