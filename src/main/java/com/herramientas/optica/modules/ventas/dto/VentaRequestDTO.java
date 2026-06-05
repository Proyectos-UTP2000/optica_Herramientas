package com.herramientas.optica.modules.ventas.dto;

import java.math.BigDecimal;
import java.util.List;

import com.herramientas.optica.modules.ventas.model.FormaPagoVenta;
import com.herramientas.optica.modules.ventas.model.MedioPagoVenta;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VentaRequestDTO {

    @NotNull(message = "El cliente es obligatorio")
    @Positive(message = "El cliente debe ser valido")
    private Long clienteId;

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
    private FormaPagoVenta formaPago;

    @NotNull(message = "El medio de pago es obligatorio")
    private MedioPagoVenta medioPago;

    @DecimalMin(value = "0.00", message = "El descuento no puede ser negativo")
    private BigDecimal descuento;

    @Size(max = 255, message = "La observacion no debe superar 255 caracteres")
    private String observaciones;

    @NotEmpty(message = "La venta debe incluir al menos un detalle")
    @Valid
    private List<VentaDetalleRequestDTO> detalles;
}
