package com.herramientas.optica.modules.cotizaciones.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotizacionDTO {
    private Long id;
    private String clienteNombre;
    private String clienteDocumento;
    private String clienteTelefono;
    private String clienteCorreo;
    private BigDecimal totalEstimado;
    private String estado;
    private LocalDateTime fechaCreacion;
    private String observaciones;
    private List<CotizacionDetalleDTO> detalles;
    private Long clienteUsuarioId;
    private String direccion;
}
