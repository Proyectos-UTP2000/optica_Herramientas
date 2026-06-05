package com.herramientas.optica.modules.ventas.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.caja.dto.MovimientoCajaRequestDTO;
import com.herramientas.optica.modules.caja.model.Caja;
import com.herramientas.optica.modules.caja.model.MetodoPagoCaja;
import com.herramientas.optica.modules.caja.model.OrigenMovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;
import com.herramientas.optica.modules.caja.repository.CajaRepository;
import com.herramientas.optica.modules.caja.service.CajaService;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.compras.model.TipoComprobante;
import com.herramientas.optica.modules.compras.repository.TipoComprobanteRepository;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.inventario.dto.MovimientoInventarioResponseDTO;
import com.herramientas.optica.modules.inventario.model.ReferenciaInventario;
import com.herramientas.optica.modules.inventario.service.InventarioService;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.ventas.dto.VentaDetalleRequestDTO;
import com.herramientas.optica.modules.ventas.dto.VentaDetalleResponseDTO;
import com.herramientas.optica.modules.ventas.dto.VentaRequestDTO;
import com.herramientas.optica.modules.ventas.dto.VentaResponseDTO;
import com.herramientas.optica.modules.ventas.model.EstadoVenta;
import com.herramientas.optica.modules.ventas.model.FormaPagoVenta;
import com.herramientas.optica.modules.ventas.model.MedioPagoVenta;
import com.herramientas.optica.modules.ventas.model.Venta;
import com.herramientas.optica.modules.ventas.model.VentaDetalle;
import com.herramientas.optica.modules.ventas.model.VentaDetalleId;
import com.herramientas.optica.modules.ventas.repository.VentaRepository;

@Service
public class VentaService {

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_BORRADO = 0;
    private static final String SERIE_VENTA_INTERNA = "V";
    private static final String SERIE_COMPROBANTE_FALLBACK = "V001";

    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ProductoRepository productoRepository;
    private final CajaRepository cajaRepository;
    private final TipoComprobanteRepository tipoComprobanteRepository;
    private final InventarioService inventarioService;
    private final CajaService cajaService;

    /**
     * Crea el servicio que coordina ventas emitidas con inventario y caja.
     */
    public VentaService(VentaRepository ventaRepository, ClienteRepository clienteRepository,
            EmpleadoRepository empleadoRepository, ProductoRepository productoRepository, CajaRepository cajaRepository,
            TipoComprobanteRepository tipoComprobanteRepository, InventarioService inventarioService,
            CajaService cajaService) {
        this.ventaRepository = ventaRepository;
        this.clienteRepository = clienteRepository;
        this.empleadoRepository = empleadoRepository;
        this.productoRepository = productoRepository;
        this.cajaRepository = cajaRepository;
        this.tipoComprobanteRepository = tipoComprobanteRepository;
        this.inventarioService = inventarioService;
        this.cajaService = cajaService;
    }

    /**
     * Emite una venta al contado, descuenta inventario y registra el ingreso de
     * caja dentro de una sola transaccion.
     */
    @Transactional
    public VentaResponseDTO emitirVenta(VentaRequestDTO dto) {
        validarAlcanceInicial(dto);
        Cliente cliente = obtenerClienteActivo(dto.getClienteId());
        Empleado empleado = obtenerEmpleadoActivo(dto.getEmpleadoId());
        Caja caja = obtenerCaja(dto.getCajaId());
        String numeroComprobante = normalizarTextoOpcional(dto.getNumeroComprobante());
        boolean generarNumeroComprobante = numeroComprobante == null;
        TipoComprobante tipoComprobante = obtenerTipoComprobanteOpcional(dto.getTipoComprobanteId(),
                generarNumeroComprobante);
        if (generarNumeroComprobante && tipoComprobante != null) {
            numeroComprobante = generarNumeroComprobante(tipoComprobante);
        }

        BigDecimal descuento = normalizarMontoNoNegativo(dto.getDescuento() != null ? dto.getDescuento() : BigDecimal.ZERO);
        DetallesPreparados detallesPreparados = prepararDetalles(dto.getDetalles());
        BigDecimal total = detallesPreparados.subtotal().subtract(descuento);
        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El total de la venta debe ser mayor que cero.");
        }

        Venta venta = Venta.builder()
                .cliente(cliente)
                .empleado(empleado)
                .caja(caja)
                .tipoComprobante(tipoComprobante)
                .numeroComprobante(numeroComprobante)
                .formaPago(dto.getFormaPago())
                .medioPago(dto.getMedioPago())
                .subtotal(detallesPreparados.subtotal())
                .descuento(descuento)
                .total(normalizarMonto(total))
                .estado(EstadoVenta.EMITIDA.getCodigo())
                .observaciones(normalizarTextoOpcional(dto.getObservaciones()))
                .pagoInicial(normalizarMonto(total))
                .deuda(BigDecimal.ZERO.setScale(2, RoundingMode.UNNECESSARY))
                .build();

        Venta ventaGuardada = ventaRepository.save(venta);
        if (generarNumeroComprobante && tipoComprobante == null) {
            ventaGuardada.setNumeroComprobante(generarNumeroInterno(ventaGuardada.getId()));
        }
        for (DetallePreparado detalle : detallesPreparados.detalles()) {
            VentaDetalle ventaDetalle = VentaDetalle.builder()
                    .id(new VentaDetalleId(ventaGuardada.getId(), detalle.producto().getId()))
                    .producto(detalle.producto())
                    .cantidad(detalle.cantidad())
                    .precioUnitario(detalle.precioUnitario())
                    .descuento(detalle.descuento())
                    .subtotal(detalle.subtotal())
                    .stockPrevio(BigDecimal.ZERO.setScale(3, RoundingMode.UNNECESSARY))
                    .stockActual(BigDecimal.ZERO.setScale(3, RoundingMode.UNNECESSARY))
                    .build();
            ventaGuardada.agregarDetalle(ventaDetalle);
        }
        ventaGuardada = ventaRepository.save(ventaGuardada);

        for (VentaDetalle detalle : ventaGuardada.getDetalles()) {
            MovimientoInventarioResponseDTO movimiento = inventarioService.registrarSalidaVenta(
                    detalle.getProducto().getId(),
                    detalle.getCantidad(),
                    "Venta emitida #" + ventaGuardada.getId(),
                    ReferenciaInventario.VENTA,
                    ventaGuardada.getId(),
                    empleado.getId());
            detalle.setStockPrevio(movimiento.getStockPrevio());
            detalle.setStockActual(movimiento.getStockNuevo());
        }

        cajaService.registrarMovimiento(caja.getId(), movimientoCajaRequest(empleado.getId(), dto.getMedioPago(),
                ventaGuardada.getTotal(), ventaGuardada.getId()));

        return mapearVenta(ventaRepository.save(ventaGuardada));
    }

    /**
     * Lista ventas emitidas y anuladas no borradas, ordenadas de la mas reciente a
     * la mas antigua.
     */
    @Transactional(readOnly = true)
    public List<VentaResponseDTO> listarVentas() {
        return ventaRepository.findByEstadoNotOrderByFechaDesc(ESTADO_BORRADO).stream()
                .map(this::mapearVenta)
                .toList();
    }

    /**
     * Busca una venta existente y devuelve su detalle operativo.
     */
    @Transactional(readOnly = true)
    public VentaResponseDTO buscarPorId(Long id) {
        return mapearVenta(obtenerVenta(id));
    }

    private void validarAlcanceInicial(VentaRequestDTO dto) {
        if (dto.getFormaPago() != FormaPagoVenta.CONTADO) {
            throw new IllegalStateException("Las ventas a credito se implementaran en una siguiente version.");
        }
        if (dto.getCajaId() == null) {
            throw new IllegalArgumentException("La caja es obligatoria para ventas al contado.");
        }
        if (dto.getDetalles() == null || dto.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("La venta debe incluir al menos un detalle.");
        }
    }

    private DetallesPreparados prepararDetalles(List<VentaDetalleRequestDTO> detalles) {
        Set<Long> productos = new HashSet<>();
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2, RoundingMode.UNNECESSARY);
        List<DetallePreparado> preparados = detalles.stream()
                .map(dto -> prepararDetalle(dto, productos))
                .toList();
        for (DetallePreparado detalle : preparados) {
            subtotal = subtotal.add(detalle.subtotal());
        }
        return new DetallesPreparados(preparados, subtotal);
    }

    private DetallePreparado prepararDetalle(VentaDetalleRequestDTO dto, Set<Long> productos) {
        if (!productos.add(dto.getProductoId())) {
            throw new IllegalArgumentException("No se puede repetir el mismo producto en una venta.");
        }
        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el producto con ID: " + dto.getProductoId()));
        if (producto.getEstado() == null || producto.getEstado() != ESTADO_ACTIVO) {
            throw new IllegalStateException("El producto " + producto.getNombre() + " no esta activo.");
        }

        BigDecimal stockDisponible = producto.getStock() != null ? BigDecimal.valueOf(producto.getStock()) : BigDecimal.ZERO;
        if (stockDisponible.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El producto " + producto.getNombre() + " está sin stock.");
        }
        BigDecimal cantidad = normalizarCantidad(dto.getCantidad());
        if (cantidad.compareTo(stockDisponible) > 0) {
            throw new IllegalArgumentException("La cantidad solicitada para el producto " + producto.getNombre() + " supera el stock disponible.");
        }
        BigDecimal precioUnitario = normalizarMontoPositivo(dto.getPrecioUnitario());
        BigDecimal descuento = normalizarMontoNoNegativo(dto.getDescuento() != null ? dto.getDescuento() : BigDecimal.ZERO);
        BigDecimal subtotal = cantidad.multiply(precioUnitario).setScale(2, RoundingMode.HALF_UP).subtract(descuento);
        if (subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El subtotal del detalle debe ser mayor que cero.");
        }

        return new DetallePreparado(producto, cantidad, precioUnitario, descuento, normalizarMonto(subtotal));
    }

    private MovimientoCajaRequestDTO movimientoCajaRequest(Long empleadoId, MedioPagoVenta medioPago,
            BigDecimal total, Long ventaId) {
        MovimientoCajaRequestDTO dto = new MovimientoCajaRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setTipo(TipoMovimientoCaja.INGRESO);
        dto.setOrigen(OrigenMovimientoCaja.VENTA);
        dto.setMetodoPago(MetodoPagoCaja.valueOf(medioPago.name()));
        dto.setMonto(total);
        dto.setDescripcion("Venta emitida #" + ventaId);
        dto.setReferenciaTipo("VENTA");
        dto.setReferenciaId(ventaId);
        return dto;
    }

    private Venta obtenerVenta(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro la venta con ID: " + id));
        if (venta.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("La venta seleccionada se encuentra eliminada.");
        }
        return venta;
    }

    private Cliente obtenerClienteActivo(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el cliente con ID: " + clienteId));
        if (cliente.getEstado() == null || cliente.getEstado() != ESTADO_ACTIVO) {
            throw new IllegalStateException("El cliente seleccionado no esta activo.");
        }
        return cliente;
    }

    private Empleado obtenerEmpleadoActivo(Long empleadoId) {
        Empleado empleado = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el empleado con ID: " + empleadoId));
        if (empleado.getEstado() == null || empleado.getEstado() != ESTADO_ACTIVO) {
            throw new IllegalStateException("El empleado seleccionado no esta activo.");
        }
        return empleado;
    }

    private Caja obtenerCaja(Long cajaId) {
        Caja caja = cajaRepository.findById(cajaId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro la caja con ID: " + cajaId));
        if (caja.getEstado() != com.herramientas.optica.modules.caja.model.EstadoCaja.ABIERTA) {
            throw new IllegalStateException("La caja seleccionada esta cerrada.");
        }
        return caja;
    }

    private TipoComprobante obtenerTipoComprobanteOpcional(Integer tipoComprobanteId, boolean bloquearParaCorrelativo) {
        if (tipoComprobanteId == null) {
            return null;
        }
        if (bloquearParaCorrelativo) {
            return tipoComprobanteRepository.findByIdForUpdate(tipoComprobanteId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "No se encontro el tipo de comprobante con ID: " + tipoComprobanteId));
        }
        return tipoComprobanteRepository.findById(tipoComprobanteId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontro el tipo de comprobante con ID: " + tipoComprobanteId));
    }

    private String generarNumeroComprobante(TipoComprobante tipoComprobante) {
        int siguienteCorrelativo = (tipoComprobante.getCorrelativoActual() != null
                ? tipoComprobante.getCorrelativoActual()
                : 0) + 1;
        tipoComprobante.setCorrelativoActual(siguienteCorrelativo);
        String serie = normalizarTextoOpcional(tipoComprobante.getSerie());
        if (serie == null) {
            serie = SERIE_COMPROBANTE_FALLBACK;
        }
        return serie + "-" + String.format("%08d", siguienteCorrelativo);
    }

    private String generarNumeroInterno(Long ventaId) {
        return SERIE_VENTA_INTERNA + "-" + String.format("%08d", ventaId);
    }

    private BigDecimal normalizarCantidad(BigDecimal cantidad) {
        if (cantidad == null) {
            throw new IllegalArgumentException("La cantidad es obligatoria.");
        }
        if (cantidad.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor que cero.");
        }
        return cantidad.setScale(3, RoundingMode.UNNECESSARY);
    }

    private BigDecimal normalizarMontoPositivo(BigDecimal monto) {
        BigDecimal normalizado = normalizarMontoNoNegativo(monto);
        if (normalizado.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor que cero.");
        }
        return normalizado;
    }

    private BigDecimal normalizarMontoNoNegativo(BigDecimal monto) {
        if (monto == null) {
            throw new IllegalArgumentException("El monto es obligatorio.");
        }
        if (monto.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El monto no puede ser negativo.");
        }
        return normalizarMonto(monto);
    }

    private BigDecimal normalizarMonto(BigDecimal monto) {
        return monto.setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizarTextoOpcional(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return null;
        }
        return texto.trim();
    }

    private VentaResponseDTO mapearVenta(Venta venta) {
        return VentaResponseDTO.builder()
                .id(venta.getId())
                .clienteId(venta.getCliente().getId())
                .clienteNombre(nombreCliente(venta.getCliente()))
                .empleadoId(venta.getEmpleado().getId())
                .empleadoNombre(nombreCompleto(venta.getEmpleado()))
                .cajaId(venta.getCaja() != null ? venta.getCaja().getId() : null)
                .tipoComprobanteId(venta.getTipoComprobante() != null ? venta.getTipoComprobante().getId() : null)
                .numeroComprobante(venta.getNumeroComprobante())
                .fecha(venta.getFecha())
                .formaPago(venta.getFormaPago())
                .medioPago(venta.getMedioPago())
                .subtotal(venta.getSubtotal())
                .descuento(venta.getDescuento())
                .total(venta.getTotal())
                .estado(EstadoVenta.desdeCodigo(venta.getEstado()))
                .observaciones(venta.getObservaciones())
                .detalles(venta.getDetalles().stream().map(this::mapearDetalle).toList())
                .build();
    }

    private VentaDetalleResponseDTO mapearDetalle(VentaDetalle detalle) {
        Producto producto = detalle.getProducto();
        return VentaDetalleResponseDTO.builder()
                .productoId(producto.getId())
                .productoNombre(producto.getNombre())
                .productoCodigo(producto.getCodigo())
                .cantidad(detalle.getCantidad())
                .precioUnitario(detalle.getPrecioUnitario())
                .descuento(detalle.getDescuento())
                .subtotal(detalle.getSubtotal())
                .stockPrevio(detalle.getStockPrevio())
                .stockActual(detalle.getStockActual())
                .build();
    }

    private String nombreCliente(Cliente cliente) {
        if (cliente.getNombreEmpresa() != null && !cliente.getNombreEmpresa().isBlank()) {
            return cliente.getNombreEmpresa().trim();
        }
        return String.join(" ",
                cliente.getNombre() != null ? cliente.getNombre() : "",
                cliente.getApellidoPaterno() != null ? cliente.getApellidoPaterno() : "",
                cliente.getApellidoMaterno() != null ? cliente.getApellidoMaterno() : "").trim();
    }

    private String nombreCompleto(Empleado empleado) {
        return String.join(" ",
                empleado.getNombre(),
                empleado.getApellidoPaterno(),
                empleado.getApellidoMaterno()).trim();
    }

    private record DetallesPreparados(List<DetallePreparado> detalles, BigDecimal subtotal) {
    }

    private record DetallePreparado(Producto producto, BigDecimal cantidad, BigDecimal precioUnitario,
            BigDecimal descuento, BigDecimal subtotal) {
    }
}
