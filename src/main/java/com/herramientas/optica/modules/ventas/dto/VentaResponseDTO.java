package com.herramientas.optica.modules.ventas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.herramientas.optica.modules.ventas.model.EstadoVenta;
import com.herramientas.optica.modules.ventas.model.FormaPagoVenta;
import com.herramientas.optica.modules.ventas.model.MedioPagoVenta;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VentaResponseDTO {
    private Long id;
    private Long clienteId;
    private String clienteNombre;
    private Long empleadoId;
    private String empleadoNombre;
    private Long cajaId;
    private Integer tipoComprobanteId;
    private String numeroComprobante;
    private LocalDateTime fecha;
    private FormaPagoVenta formaPago;
    private MedioPagoVenta medioPago;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;
    private EstadoVenta estado;
    private String observaciones;
    private List<VentaDetalleResponseDTO> detalles;
}
