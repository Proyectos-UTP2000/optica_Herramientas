package com.herramientas.optica.modules.compras.service;

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
import com.herramientas.optica.modules.compras.dto.CompraDetalleRequestDTO;
import com.herramientas.optica.modules.compras.dto.CompraDetalleResponseDTO;
import com.herramientas.optica.modules.compras.dto.CompraRequestDTO;
import com.herramientas.optica.modules.compras.dto.CompraResponseDTO;
import com.herramientas.optica.modules.compras.model.Compra;
import com.herramientas.optica.modules.compras.model.CompraDetalle;
import com.herramientas.optica.modules.compras.model.CompraDetalleId;
import com.herramientas.optica.modules.compras.model.EstadoCompra;
import com.herramientas.optica.modules.compras.model.FormaPagoCompra;
import com.herramientas.optica.modules.compras.model.MedioPagoCompra;
import com.herramientas.optica.modules.compras.model.TipoComprobante;
import com.herramientas.optica.modules.compras.repository.CompraRepository;
import com.herramientas.optica.modules.compras.repository.TipoComprobanteRepository;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.inventario.dto.MovimientoInventarioResponseDTO;
import com.herramientas.optica.modules.inventario.model.ReferenciaInventario;
import com.herramientas.optica.modules.inventario.service.InventarioService;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.proveedores.model.Proveedor;
import com.herramientas.optica.modules.proveedores.repository.ProveedorRepository;

@Service
public class CompraService {

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_BORRADO = 0;

    private final CompraRepository compraRepository;
    private final ProveedorRepository proveedorRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ProductoRepository productoRepository;
    private final CajaRepository cajaRepository;
    private final TipoComprobanteRepository tipoComprobanteRepository;
    private final InventarioService inventarioService;
    private final CajaService cajaService;

    /**
     * Crea el servicio que coordina la compra recibida con inventario y caja.
     */
    public CompraService(CompraRepository compraRepository, ProveedorRepository proveedorRepository,
            EmpleadoRepository empleadoRepository, ProductoRepository productoRepository, CajaRepository cajaRepository,
            TipoComprobanteRepository tipoComprobanteRepository, InventarioService inventarioService,
            CajaService cajaService) {
        this.compraRepository = compraRepository;
        this.proveedorRepository = proveedorRepository;
        this.empleadoRepository = empleadoRepository;
        this.productoRepository = productoRepository;
        this.cajaRepository = cajaRepository;
        this.tipoComprobanteRepository = tipoComprobanteRepository;
        this.inventarioService = inventarioService;
        this.cajaService = cajaService;
    }

    /**
     * Registra una compra recibida al contado, genera entradas de inventario y
     * registra el egreso de caja asociado en una sola transaccion.
     */
    @Transactional
    public CompraResponseDTO registrarCompra(CompraRequestDTO dto) {
        validarAlcanceInicial(dto);
        Proveedor proveedor = obtenerProveedorActivo(dto.getProveedorId());
        Empleado empleado = obtenerEmpleadoActivo(dto.getEmpleadoId());
        Caja caja = obtenerCaja(dto.getCajaId());
        TipoComprobante tipoComprobante = obtenerTipoComprobanteOpcional(dto.getTipoComprobanteId());

        BigDecimal descuento = normalizarMontoNoNegativo(dto.getDescuento() != null ? dto.getDescuento() : BigDecimal.ZERO);
        DetallesPreparados detallesPreparados = prepararDetalles(dto.getDetalles());
        BigDecimal total = detallesPreparados.subtotal().subtract(descuento);
        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El total de la compra debe ser mayor que cero.");
        }

        Compra compra = Compra.builder()
                .proveedor(proveedor)
                .empleado(empleado)
                .caja(caja)
                .tipoComprobante(tipoComprobante)
                .numeroComprobante(normalizarTextoOpcional(dto.getNumeroComprobante()))
                .formaPago(dto.getFormaPago())
                .medioPago(dto.getMedioPago())
                .subtotal(detallesPreparados.subtotal())
                .descuento(descuento)
                .total(normalizarMonto(total))
                .estado(EstadoCompra.REGISTRADA.getCodigo())
                .notaRecepcion(normalizarTextoOpcional(dto.getNotaRecepcion()))
                .pagoInicial(normalizarMonto(total))
                .deuda(BigDecimal.ZERO.setScale(2, RoundingMode.UNNECESSARY))
                .build();

        Compra compraGuardada = compraRepository.save(compra);
        for (DetallePreparado detalle : detallesPreparados.detalles()) {
            CompraDetalle compraDetalle = CompraDetalle.builder()
                    .id(new CompraDetalleId(compraGuardada.getId(), detalle.producto().getId()))
                    .producto(detalle.producto())
                    .cantidadCompra(detalle.cantidadCompra())
                    .factorConversionAplicado(detalle.factorConversionAplicado())
                    .cantidadInventario(detalle.cantidadInventario())
                    .costoUnitario(detalle.costoUnitario())
                    .subtotal(detalle.subtotal())
                    .stockPrevio(BigDecimal.ZERO.setScale(3, RoundingMode.UNNECESSARY))
                    .stockActual(BigDecimal.ZERO.setScale(3, RoundingMode.UNNECESSARY))
                    .build();
            compraGuardada.agregarDetalle(compraDetalle);
        }

        return mapearCompra(compraRepository.save(compraGuardada));
    }

    /**
     * Recibe una compra registrada, aplicando la entrada en inventario e
     * impactando en la caja abierta del empleado.
     */
    @Transactional
    public CompraResponseDTO recibirCompra(Long compraId, Long empleadoId) {
        Compra compra = obtenerCompra(compraId);
        if (compra.getEstado() != EstadoCompra.REGISTRADA.getCodigo()) {
            throw new IllegalStateException("Solo se pueden recibir compras en estado REGISTRADA.");
        }
        Empleado empleado = obtenerEmpleadoActivo(empleadoId);

        // Validar caja abierta
        Caja caja = cajaRepository.findByEmpleadoIdAndEstado(empleado.getId(), com.herramientas.optica.modules.caja.model.EstadoCaja.ABIERTA)
                .orElseThrow(() -> new IllegalStateException("El empleado debe tener una caja abierta para recibir la compra."));

        compra.setCaja(caja);

        // Registrar entrada de inventario para cada detalle
        for (CompraDetalle detalle : compra.getDetalles()) {
            MovimientoInventarioResponseDTO movimiento = inventarioService.registrarEntradaCompra(
                    detalle.getProducto().getId(),
                    detalle.getCantidadCompra(),
                    "Compra recibida #" + compra.getId(),
                    ReferenciaInventario.COMPRA,
                    compra.getId(),
                    empleado.getId());
            detalle.setStockPrevio(movimiento.getStockPrevio());
            detalle.setStockActual(movimiento.getStockNuevo());
        }

        // Registrar movimiento de egreso en caja
        cajaService.registrarMovimiento(caja.getId(), movimientoCajaRequest(empleado.getId(), compra.getMedioPago(),
                compra.getTotal(), compra.getId()));

        compra.setEstado(EstadoCompra.RECIBIDA.getCodigo());
        return mapearCompra(compraRepository.save(compra));
    }

    /**
     * Anula una compra. Si ya fue recibida, reversa los stocks e impacta en la caja.
     */
    @Transactional
    public CompraResponseDTO anularCompra(Long compraId, Long empleadoId) {
        Compra compra = obtenerCompra(compraId);
        if (compra.getEstado() == EstadoCompra.ANULADA.getCodigo()) {
            throw new IllegalStateException("La compra ya se encuentra anulada.");
        }
        Empleado empleado = obtenerEmpleadoActivo(empleadoId);

        if (compra.getEstado() == EstadoCompra.RECIBIDA.getCodigo()) {
            // Validar caja abierta para la devolución de dinero
            Caja caja = cajaRepository.findByEmpleadoIdAndEstado(empleado.getId(), com.herramientas.optica.modules.caja.model.EstadoCaja.ABIERTA)
                    .orElseThrow(() -> new IllegalStateException("El empleado debe tener una caja abierta para anular una compra recibida."));

            // Reversar inventario (salida)
            for (CompraDetalle detalle : compra.getDetalles()) {
                inventarioService.registrarSalidaCompra(
                        detalle.getProducto().getId(),
                        detalle.getCantidadCompra(),
                        "Anulación de compra #" + compra.getId(),
                        ReferenciaInventario.COMPRA,
                        compra.getId(),
                        empleado.getId());
            }

            // Contra-movimiento en caja (Ingreso para balancear el egreso anterior)
            MovimientoCajaRequestDTO contraMovimiento = new MovimientoCajaRequestDTO();
            contraMovimiento.setEmpleadoId(empleado.getId());
            contraMovimiento.setTipo(TipoMovimientoCaja.INGRESO);
            contraMovimiento.setOrigen(OrigenMovimientoCaja.COMPRA);
            contraMovimiento.setMetodoPago(MetodoPagoCaja.valueOf(compra.getMedioPago().name()));
            contraMovimiento.setMonto(compra.getTotal());
            contraMovimiento.setDescripcion("Devolución por anulación de compra #" + compra.getId());
            contraMovimiento.setReferenciaTipo("COMPRA");
            contraMovimiento.setReferenciaId(compra.getId());

            cajaService.registrarMovimiento(caja.getId(), contraMovimiento);
        }

        compra.setEstado(EstadoCompra.ANULADA.getCodigo());
        return mapearCompra(compraRepository.save(compra));
    }


    /**
     * Lista compras registradas y anuladas no borradas, ordenadas de la mas reciente
     * a la mas antigua.
     */
    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarCompras() {
        return compraRepository.findByEstadoNotOrderByFechaDesc(ESTADO_BORRADO).stream()
                .map(this::mapearCompra)
                .toList();
    }

    /**
     * Busca una compra existente y devuelve su detalle operativo.
     */
    @Transactional(readOnly = true)
    public CompraResponseDTO buscarPorId(Long id) {
        return mapearCompra(obtenerCompra(id));
    }

    private void validarAlcanceInicial(CompraRequestDTO dto) {
        if (dto.getFormaPago() != FormaPagoCompra.CONTADO) {
            throw new IllegalStateException("Las compras a credito se implementaran en una siguiente version.");
        }
        if (dto.getCajaId() == null) {
            throw new IllegalArgumentException("La caja es obligatoria para compras al contado.");
        }
        if (dto.getDetalles() == null || dto.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("La compra debe incluir al menos un detalle.");
        }
    }

    private DetallesPreparados prepararDetalles(List<CompraDetalleRequestDTO> detalles) {
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

    private DetallePreparado prepararDetalle(CompraDetalleRequestDTO dto, Set<Long> productos) {
        if (!productos.add(dto.getProductoId())) {
            throw new IllegalArgumentException("No se puede repetir el mismo producto en una compra.");
        }
        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el producto con ID: " + dto.getProductoId()));
        if (producto.getEstado() == null || producto.getEstado() != ESTADO_ACTIVO) {
            throw new IllegalStateException("El producto " + producto.getNombre() + " no esta activo.");
        }

        BigDecimal cantidadCompra = normalizarCantidad(dto.getCantidadCompra());
        BigDecimal costoUnitario = normalizarMontoPositivo(dto.getCostoUnitario());
        int factorConversion = obtenerFactorConversion(producto);
        BigDecimal cantidadInventario = cantidadCompra.multiply(BigDecimal.valueOf(factorConversion))
                .setScale(3, RoundingMode.UNNECESSARY);
        BigDecimal subtotal = cantidadCompra.multiply(costoUnitario).setScale(2, RoundingMode.HALF_UP);

        return new DetallePreparado(producto, cantidadCompra, factorConversion, cantidadInventario, costoUnitario,
                subtotal);
    }

    private MovimientoCajaRequestDTO movimientoCajaRequest(Long empleadoId, MedioPagoCompra medioPago,
            BigDecimal total, Long compraId) {
        MovimientoCajaRequestDTO dto = new MovimientoCajaRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setTipo(TipoMovimientoCaja.EGRESO);
        dto.setOrigen(OrigenMovimientoCaja.COMPRA);
        dto.setMetodoPago(MetodoPagoCaja.valueOf(medioPago.name()));
        dto.setMonto(total);
        dto.setDescripcion("Compra recibida #" + compraId);
        dto.setReferenciaTipo("COMPRA");
        dto.setReferenciaId(compraId);
        return dto;
    }

    private Compra obtenerCompra(Long id) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro la compra con ID: " + id));
        if (compra.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("La compra seleccionada se encuentra eliminada.");
        }
        return compra;
    }

    private Proveedor obtenerProveedorActivo(Long proveedorId) {
        Proveedor proveedor = proveedorRepository.findById(proveedorId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el proveedor con ID: " + proveedorId));
        if (proveedor.getEstado() == null || proveedor.getEstado() != ESTADO_ACTIVO) {
            throw new IllegalStateException("El proveedor seleccionado no esta activo.");
        }
        return proveedor;
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
        return cajaRepository.findById(cajaId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro la caja con ID: " + cajaId));
    }

    private TipoComprobante obtenerTipoComprobanteOpcional(Integer tipoComprobanteId) {
        if (tipoComprobanteId == null) {
            return null;
        }
        return tipoComprobanteRepository.findById(tipoComprobanteId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontro el tipo de comprobante con ID: " + tipoComprobanteId));
    }

    private int obtenerFactorConversion(Producto producto) {
        if (producto.getFactorConversion() == null || producto.getFactorConversion() <= 0) {
            throw new IllegalStateException("El factor de conversion del producto debe ser mayor que cero.");
        }
        return producto.getFactorConversion();
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

    private CompraResponseDTO mapearCompra(Compra compra) {
        return CompraResponseDTO.builder()
                .id(compra.getId())
                .proveedorId(compra.getProveedor().getId())
                .proveedorNombre(compra.getProveedor().getRazonSocial())
                .empleadoId(compra.getEmpleado().getId())
                .empleadoNombre(nombreCompleto(compra.getEmpleado()))
                .cajaId(compra.getCaja() != null ? compra.getCaja().getId() : null)
                .tipoComprobanteId(compra.getTipoComprobante() != null ? compra.getTipoComprobante().getId() : null)
                .numeroComprobante(compra.getNumeroComprobante())
                .fecha(compra.getFecha())
                .formaPago(compra.getFormaPago())
                .medioPago(compra.getMedioPago())
                .subtotal(compra.getSubtotal())
                .descuento(compra.getDescuento())
                .total(compra.getTotal())
                .estado(EstadoCompra.desdeCodigo(compra.getEstado()))
                .notaRecepcion(compra.getNotaRecepcion())
                .detalles(compra.getDetalles().stream().map(this::mapearDetalle).toList())
                .build();
    }

    private CompraDetalleResponseDTO mapearDetalle(CompraDetalle detalle) {
        Producto producto = detalle.getProducto();
        return CompraDetalleResponseDTO.builder()
                .productoId(producto.getId())
                .productoNombre(producto.getNombre())
                .productoCodigo(producto.getCodigo())
                .cantidadCompra(detalle.getCantidadCompra())
                .factorConversionAplicado(detalle.getFactorConversionAplicado())
                .cantidadInventario(detalle.getCantidadInventario())
                .costoUnitario(detalle.getCostoUnitario())
                .subtotal(detalle.getSubtotal())
                .stockPrevio(detalle.getStockPrevio())
                .stockActual(detalle.getStockActual())
                .build();
    }

    private String nombreCompleto(Empleado empleado) {
        return String.join(" ",
                empleado.getNombre(),
                empleado.getApellidoPaterno(),
                empleado.getApellidoMaterno()).trim();
    }

    private record DetallesPreparados(List<DetallePreparado> detalles, BigDecimal subtotal) {
    }

    private record DetallePreparado(Producto producto, BigDecimal cantidadCompra, Integer factorConversionAplicado,
            BigDecimal cantidadInventario, BigDecimal costoUnitario, BigDecimal subtotal) {
    }
}
