package com.herramientas.optica.modules.inventario.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.inventario.dto.AjusteInventarioRequestDTO;
import com.herramientas.optica.modules.inventario.dto.InventarioSaldoResponseDTO;
import com.herramientas.optica.modules.inventario.dto.MovimientoInventarioResponseDTO;
import com.herramientas.optica.modules.inventario.model.InventarioSaldo;
import com.herramientas.optica.modules.inventario.model.MovimientoInventario;
import com.herramientas.optica.modules.inventario.model.ReferenciaInventario;
import com.herramientas.optica.modules.inventario.model.TipoMovimientoInventario;
import com.herramientas.optica.modules.inventario.repository.InventarioSaldoRepository;
import com.herramientas.optica.modules.inventario.repository.MovimientoInventarioRepository;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;

@Service
public class InventarioService {

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_INACTIVO = 2;

    private final InventarioSaldoRepository inventarioSaldoRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final ProductoRepository productoRepository;
    private final EmpleadoRepository empleadoRepository;

    /**
     * Creates the service that owns every stock mutation and compatibility
     * synchronization with Producto.stock.
     */
    public InventarioService(InventarioSaldoRepository inventarioSaldoRepository,
            MovimientoInventarioRepository movimientoInventarioRepository,
            ProductoRepository productoRepository,
            EmpleadoRepository empleadoRepository) {
        this.inventarioSaldoRepository = inventarioSaldoRepository;
        this.movimientoInventarioRepository = movimientoInventarioRepository;
        this.productoRepository = productoRepository;
        this.empleadoRepository = empleadoRepository;
    }

    /**
     * Creates the first inventory balance for a product and optionally records the
     * initial stock movement.
     */
    @Transactional
    public InventarioSaldoResponseDTO inicializarProducto(Producto producto, BigDecimal stockInicial,
            Integer stockMinimo) {
        if (inventarioSaldoRepository.existsByProductoId(producto.getId())) {
            throw new IllegalStateException("El producto ya tiene saldo de inventario.");
        }

        InventarioSaldo saldo = InventarioSaldo.builder()
                .producto(producto)
                .stockActual(BigDecimal.ZERO.setScale(3, RoundingMode.UNNECESSARY))
                .stockMinimo(normalizarCantidadNoNegativa(
                        stockMinimo != null ? BigDecimal.valueOf(stockMinimo) : BigDecimal.ZERO))
                .build();
        InventarioSaldo saldoGuardado = inventarioSaldoRepository.save(saldo);

        BigDecimal cantidadInicial = normalizarCantidadNoNegativa(stockInicial != null ? stockInicial : BigDecimal.ZERO);
        if (cantidadInicial.compareTo(BigDecimal.ZERO) > 0) {
            aplicarMovimiento(saldoGuardado, TipoMovimientoInventario.ENTRADA, cantidadInicial,
                    "Stock inicial del producto", ReferenciaInventario.PRODUCTO_INICIAL, producto.getId(), null);
        } else {
            sincronizarProductoStock(producto, BigDecimal.ZERO.setScale(3, RoundingMode.UNNECESSARY));
        }

        return mapearSaldo(saldoGuardado);
    }

    /**
     * Lists all inventory balances with product and unit metadata.
     */
    @Transactional(readOnly = true)
    public List<InventarioSaldoResponseDTO> listarSaldos() {
        return inventarioSaldoRepository.findAll().stream()
                .sorted(Comparator
                        .comparing((InventarioSaldo saldo) -> !requiereRevisionCatalogo(saldo.getProducto()))
                        .thenComparing(saldo -> saldo.getProducto().getNombre(), Comparator.nullsLast(String::compareTo)))
                .map(this::mapearSaldo)
                .toList();
    }

    /**
     * Returns the current inventory balance for a product.
     */
    @Transactional(readOnly = true)
    public InventarioSaldoResponseDTO obtenerSaldoPorProducto(Long productoId) {
        return mapearSaldo(obtenerSaldo(productoId));
    }

    /**
     * Lists immutable inventory movements for a product ordered by movement date.
     */
    @Transactional(readOnly = true)
    public List<MovimientoInventarioResponseDTO> listarMovimientosPorProducto(Long productoId) {
        productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado."));
        return movimientoInventarioRepository.findByProductoIdOrderByFechaAsc(productoId).stream()
                .map(this::mapearMovimiento)
                .toList();
    }

    /**
     * Lists products whose current balance is at or below the configured minimum.
     */
    @Transactional(readOnly = true)
    public List<InventarioSaldoResponseDTO> listarProductosBajoStock() {
        return inventarioSaldoRepository.findProductosBajoStock().stream()
                .map(this::mapearSaldo)
                .toList();
    }

    /**
     * Updates the minimum stock threshold for a product without creating inventory
     * movements because it is an alert setting, not a physical stock change.
     */
    @Transactional
    public InventarioSaldoResponseDTO actualizarStockMinimoProducto(Long productoId, Integer stockMinimo) {
        InventarioSaldo saldo = inventarioSaldoRepository.findByProductoIdForUpdate(productoId)
                .orElse(null);
        if (saldo == null) {
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado."));
            return inicializarProducto(
                    producto,
                    BigDecimal.valueOf(producto.getStock() != null ? producto.getStock() : 0),
                    stockMinimo);
        }

        BigDecimal stockMinimoNormalizado = normalizarCantidadNoNegativa(
                stockMinimo != null ? BigDecimal.valueOf(stockMinimo) : BigDecimal.ZERO);
        saldo.setStockMinimo(stockMinimoNormalizado);
        saldo.getProducto().setStockMinimo(stockMinimoNormalizado.intValueExact());
        productoRepository.save(saldo.getProducto());
        return mapearSaldo(inventarioSaldoRepository.save(saldo));
    }

    /**
     * Registers a received purchase quantity in purchase units and converts it to
     * sale/base inventory units using Producto.factorConversion.
     */
    @Transactional
    public MovimientoInventarioResponseDTO registrarEntradaCompra(Long productoId, BigDecimal cantidadCompra,
            String motivo, ReferenciaInventario referenciaTipo, Long referenciaId, Long empleadoId) {
        InventarioSaldo saldo = obtenerSaldoBloqueado(productoId);
        BigDecimal cantidadInventario = normalizarCantidadPositiva(cantidadCompra)
                .multiply(BigDecimal.valueOf(obtenerFactorConversion(saldo.getProducto())));
        MovimientoInventario movimiento = aplicarMovimiento(saldo, TipoMovimientoInventario.ENTRADA,
                cantidadInventario, motivo, referenciaTipo, referenciaId, obtenerEmpleadoOpcional(empleadoId));
        return mapearMovimiento(movimiento);
    }

    /**
     * Registra una salida de inventario por devolucion/anulacion de compra en unidades
     * de compra y las convierte a unidades base/venta.
     */
    @Transactional
    public MovimientoInventarioResponseDTO registrarSalidaCompra(Long productoId, BigDecimal cantidadCompra,
            String motivo, ReferenciaInventario referenciaTipo, Long referenciaId, Long empleadoId) {
        InventarioSaldo saldo = obtenerSaldoBloqueado(productoId);
        BigDecimal cantidadInventario = normalizarCantidadPositiva(cantidadCompra)
                .multiply(BigDecimal.valueOf(obtenerFactorConversion(saldo.getProducto())));
        MovimientoInventario movimiento = aplicarMovimiento(saldo, TipoMovimientoInventario.SALIDA,
                cantidadInventario, motivo, referenciaTipo, referenciaId, obtenerEmpleadoOpcional(empleadoId));
        return mapearMovimiento(movimiento);
    }

    /**
     * Registers an inventory exit, rejecting any movement that would leave negative
     * stock.
     */
    @Transactional
    public MovimientoInventarioResponseDTO registrarSalidaVenta(Long productoId, BigDecimal cantidad,
            String motivo, ReferenciaInventario referenciaTipo, Long referenciaId, Long empleadoId) {
        InventarioSaldo saldo = obtenerSaldoBloqueado(productoId);
        MovimientoInventario movimiento = aplicarMovimiento(saldo, TipoMovimientoInventario.SALIDA,
                normalizarCantidadPositiva(cantidad), motivo, referenciaTipo, referenciaId,
                obtenerEmpleadoOpcional(empleadoId));
        return mapearMovimiento(movimiento);
    }

    /**
     * Applies a positive manual adjustment with an active employee and required
     * reason.
     */
    @Transactional
    public MovimientoInventarioResponseDTO ajustarStockPositivo(Long productoId, AjusteInventarioRequestDTO dto) {
        InventarioSaldo saldo = obtenerSaldoBloqueado(productoId);
        MovimientoInventario movimiento = aplicarMovimiento(saldo, TipoMovimientoInventario.AJUSTE_POSITIVO,
                normalizarCantidadPositiva(dto.getCantidad()), dto.getMotivo(), ReferenciaInventario.AJUSTE_MANUAL,
                null, obtenerEmpleadoActivo(dto.getEmpleadoId()));
        return mapearMovimiento(movimiento);
    }

    /**
     * Applies a negative manual adjustment without allowing inventory to become
     * negative.
     */
    @Transactional
    public MovimientoInventarioResponseDTO ajustarStockNegativo(Long productoId, AjusteInventarioRequestDTO dto) {
        InventarioSaldo saldo = obtenerSaldoBloqueado(productoId);
        MovimientoInventario movimiento = aplicarMovimiento(saldo, TipoMovimientoInventario.AJUSTE_NEGATIVO,
                normalizarCantidadPositiva(dto.getCantidad()), dto.getMotivo(), ReferenciaInventario.AJUSTE_MANUAL,
                null, obtenerEmpleadoActivo(dto.getEmpleadoId()));
        return mapearMovimiento(movimiento);
    }

    private MovimientoInventario aplicarMovimiento(InventarioSaldo saldo, TipoMovimientoInventario tipo,
            BigDecimal cantidad, String motivo, ReferenciaInventario referenciaTipo, Long referenciaId,
            Empleado empleado) {
        if (tipo == null) {
            throw new IllegalArgumentException("El tipo de movimiento de inventario es obligatorio.");
        }
        if (referenciaTipo == null) {
            throw new IllegalArgumentException("La referencia del movimiento de inventario es obligatoria.");
        }

        BigDecimal cantidadNormalizada = normalizarCantidadPositiva(cantidad);
        BigDecimal stockPrevio = normalizarEscala(saldo.getStockActual());
        BigDecimal stockNuevo = switch (tipo) {
            case ENTRADA, AJUSTE_POSITIVO -> stockPrevio.add(cantidadNormalizada);
            case SALIDA, AJUSTE_NEGATIVO -> stockPrevio.subtract(cantidadNormalizada);
        };

        if (stockNuevo.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Stock insuficiente para completar el movimiento.");
        }

        saldo.setStockActual(normalizarEscala(stockNuevo));
        InventarioSaldo saldoGuardado = inventarioSaldoRepository.save(saldo);
        sincronizarProductoStock(saldoGuardado.getProducto(), saldoGuardado.getStockActual());

        MovimientoInventario movimiento = MovimientoInventario.builder()
                .producto(saldoGuardado.getProducto())
                .tipo(tipo)
                .cantidad(cantidadNormalizada)
                .stockPrevio(stockPrevio)
                .stockNuevo(saldoGuardado.getStockActual())
                .motivo(normalizarTextoObligatorio(motivo, "El motivo del movimiento es obligatorio."))
                .referenciaTipo(referenciaTipo)
                .referenciaId(referenciaId)
                .empleado(empleado)
                .fecha(LocalDateTime.now())
                .build();
        return movimientoInventarioRepository.save(movimiento);
    }

    private InventarioSaldo obtenerSaldo(Long productoId) {
        return inventarioSaldoRepository.findByProductoId(productoId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro inventario para el producto."));
    }

    private InventarioSaldo obtenerSaldoBloqueado(Long productoId) {
        return inventarioSaldoRepository.findByProductoIdForUpdate(productoId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro inventario para el producto."));
    }

    private Empleado obtenerEmpleadoActivo(Long empleadoId) {
        Empleado empleado = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el empleado con ID: " + empleadoId));
        if (empleado.getEstado() == null || empleado.getEstado() != ESTADO_ACTIVO) {
            throw new IllegalStateException("El empleado seleccionado no esta activo.");
        }
        return empleado;
    }

    private Empleado obtenerEmpleadoOpcional(Long empleadoId) {
        return empleadoId == null ? null : obtenerEmpleadoActivo(empleadoId);
    }

    private int obtenerFactorConversion(Producto producto) {
        if (producto.getFactorConversion() == null || producto.getFactorConversion() <= 0) {
            throw new IllegalStateException("El factor de conversion del producto debe ser mayor que cero.");
        }
        return producto.getFactorConversion();
    }

    private void sincronizarProductoStock(Producto producto, BigDecimal stockActual) {
        try {
            producto.setStock(stockActual.setScale(0, RoundingMode.UNNECESSARY).intValueExact());
        } catch (ArithmeticException ex) {
            throw new IllegalStateException("Producto.stock solo admite cantidades enteras en esta version.");
        }
        productoRepository.save(producto);
    }

    private BigDecimal normalizarCantidadNoNegativa(BigDecimal cantidad) {
        if (cantidad == null) {
            throw new IllegalArgumentException("La cantidad es obligatoria.");
        }
        if (cantidad.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("La cantidad no puede ser negativa.");
        }
        return normalizarEscala(cantidad);
    }

    private BigDecimal normalizarCantidadPositiva(BigDecimal cantidad) {
        BigDecimal normalizada = normalizarCantidadNoNegativa(cantidad);
        if (normalizada.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor que cero.");
        }
        return normalizada;
    }

    private BigDecimal normalizarEscala(BigDecimal cantidad) {
        return cantidad.setScale(3, RoundingMode.UNNECESSARY);
    }

    private String normalizarTextoObligatorio(String texto, String mensaje) {
        if (texto == null || texto.trim().isEmpty()) {
            throw new IllegalArgumentException(mensaje);
        }
        return texto.trim();
    }

    private InventarioSaldoResponseDTO mapearSaldo(InventarioSaldo saldo) {
        Producto producto = saldo.getProducto();
        return InventarioSaldoResponseDTO.builder()
                .id(saldo.getId())
                .productoId(producto.getId())
                .productoNombre(producto.getNombre())
                .productoCodigo(producto.getCodigo())
                .categoriaId(producto.getCategoria().getId())
                .categoriaNombre(producto.getCategoria().getNombre())
                .categoriaEstado(producto.getCategoria().getEstado())
                .marcaId(producto.getMarca().getId())
                .marcaNombre(producto.getMarca().getNombre())
                .marcaEstado(producto.getMarca().getEstado())
                .requiereRevisionCatalogo(requiereRevisionCatalogo(producto))
                .stockActual(saldo.getStockActual())
                .stockMinimo(saldo.getStockMinimo())
                .unidadVentaId(producto.getUnidadVenta().getId())
                .unidadVentaNombre(producto.getUnidadVenta().getNombre())
                .unidadCompraId(producto.getUnidadCompra().getId())
                .unidadCompraNombre(producto.getUnidadCompra().getNombre())
                .factorConversion(producto.getFactorConversion())
                .bajoStock(saldo.getStockActual().compareTo(saldo.getStockMinimo()) <= 0)
                .updatedAt(saldo.getUpdatedAt())
                .build();
    }

    private boolean requiereRevisionCatalogo(Producto producto) {
        return esCatalogoEnDesusoOIndefinido(producto.getCategoria().getEstado(), producto.getCategoria().getNombre())
                || esCatalogoEnDesusoOIndefinido(producto.getMarca().getEstado(), producto.getMarca().getNombre());
    }

    private boolean esCatalogoEnDesusoOIndefinido(Integer estado, String nombre) {
        return (estado != null && estado == ESTADO_INACTIVO)
                || (nombre != null && "INDEFINIDO".equalsIgnoreCase(nombre.trim()));
    }

    private MovimientoInventarioResponseDTO mapearMovimiento(MovimientoInventario movimiento) {
        Producto producto = movimiento.getProducto();
        Empleado empleado = movimiento.getEmpleado();
        return MovimientoInventarioResponseDTO.builder()
                .id(movimiento.getId())
                .productoId(producto.getId())
                .productoNombre(producto.getNombre())
                .productoCodigo(producto.getCodigo())
                .tipo(movimiento.getTipo())
                .cantidad(movimiento.getCantidad())
                .stockPrevio(movimiento.getStockPrevio())
                .stockNuevo(movimiento.getStockNuevo())
                .motivo(movimiento.getMotivo())
                .referenciaTipo(movimiento.getReferenciaTipo())
                .referenciaId(movimiento.getReferenciaId())
                .empleadoId(empleado != null ? empleado.getId() : null)
                .empleadoNombre(empleado != null ? nombreCompleto(empleado) : null)
                .fecha(movimiento.getFecha())
                .build();
    }

    private String nombreCompleto(Empleado empleado) {
        return String.join(" ",
                empleado.getNombre(),
                empleado.getApellidoPaterno(),
                empleado.getApellidoMaterno()).trim();
    }
}
