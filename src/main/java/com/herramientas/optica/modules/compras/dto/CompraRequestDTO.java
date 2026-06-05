package com.herramientas.optica.modules.compras.dto;

import java.math.BigDecimal;
import java.util.List;

import com.herramientas.optica.modules.compras.model.FormaPagoCompra;
import com.herramientas.optica.modules.compras.model.MedioPagoCompra;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompraRequestDTO {

    @NotNull(message = "El proveedor es obligatorio")
    @Positive(message = "El proveedor debe ser valido")
    private Long proveedorId;

    @NotNull(message = "El empleado es obligatorio")
    @Positive(message = "El empleado debe ser valido")
    private Long empleadoId;

    @Positive(message = "La caja debe ser valida")
    private Long cajaId;

    @Positive(message = "El tipo de comprobante debe ser valido")
    private Integer tipoComprobanteId;

    @Size(max = 50, message = "El numero de comprobante no debe superar 50 caracteres")
    private String numeroComprobante;

    @NotNull(message = "La forma de pago es obligatoria")
    private FormaPagoCompra formaPago;

    @NotNull(message = "El medio de pago es obligatorio")
    private MedioPagoCompra medioPago;

    @DecimalMin(value = "0.00", message = "El descuento no puede ser negativo")
    private BigDecimal descuento;

    @Size(max = 255, message = "La nota de recepcion no debe superar 255 caracteres")
    private String notaRecepcion;

    @NotEmpty(message = "La compra debe incluir al menos un detalle")
    @Valid
    private List<CompraDetalleRequestDTO> detalles;
}
