package com.herramientas.optica.modules.compras.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.herramientas.optica.modules.compras.model.EstadoCompra;
import com.herramientas.optica.modules.compras.model.FormaPagoCompra;
import com.herramientas.optica.modules.compras.model.MedioPagoCompra;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompraResponseDTO {
    private Long id;
    private Long proveedorId;
    private String proveedorNombre;
    private Long empleadoId;
    private String empleadoNombre;
    private Long cajaId;
    private Integer tipoComprobanteId;
    private String numeroComprobante;
    private LocalDateTime fecha;
    private FormaPagoCompra formaPago;
    private MedioPagoCompra medioPago;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;
    private EstadoCompra estado;
    private String notaRecepcion;
    private List<CompraDetalleResponseDTO> detalles;
}
