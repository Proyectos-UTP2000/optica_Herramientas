package com.herramientas.optica.modules.reportes.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.caja.dto.CajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.GastoResponseDTO;
import com.herramientas.optica.modules.caja.dto.MovimientoCajaResponseDTO;
import com.herramientas.optica.modules.caja.model.Caja;
import com.herramientas.optica.modules.caja.model.EstadoCaja;
import com.herramientas.optica.modules.caja.model.Gasto;
import com.herramientas.optica.modules.caja.model.MovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;
import com.herramientas.optica.modules.caja.repository.CajaRepository;
import com.herramientas.optica.modules.caja.repository.GastoRepository;
import com.herramientas.optica.modules.caja.repository.MovimientoCajaRepository;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.compras.model.Compra;
import com.herramientas.optica.modules.compras.model.EstadoCompra;
import com.herramientas.optica.modules.compras.repository.CompraRepository;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.inventario.model.MovimientoInventario;
import com.herramientas.optica.modules.inventario.repository.MovimientoInventarioRepository;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.proveedores.model.Proveedor;
import com.herramientas.optica.modules.reportes.dto.ReporteCajaDetalleResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteCajaItemDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteCajaResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteCompraItemDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteCompraProveedorResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteKardexMovimientoDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteKardexResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteVentaFechaResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteVentaItemDTO;
import com.herramientas.optica.modules.ventas.model.EstadoVenta;
import com.herramientas.optica.modules.ventas.model.MedioPagoVenta;
import com.herramientas.optica.modules.ventas.model.Venta;
import com.herramientas.optica.modules.ventas.repository.VentaRepository;

@Service
public class ReporteService {

    private static final int ESTADO_BORRADO = 0;

    private final CajaRepository cajaRepository;
    private final MovimientoCajaRepository movimientoCajaRepository;
    private final GastoRepository gastoRepository;
    private final VentaRepository ventaRepository;
    private final CompraRepository compraRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final ProductoRepository productoRepository;

    public ReporteService(CajaRepository cajaRepository, MovimientoCajaRepository movimientoCajaRepository,
            GastoRepository gastoRepository, VentaRepository ventaRepository, CompraRepository compraRepository,
            MovimientoInventarioRepository movimientoInventarioRepository, ProductoRepository productoRepository) {
        this.cajaRepository = cajaRepository;
        this.movimientoCajaRepository = movimientoCajaRepository;
        this.gastoRepository = gastoRepository;
        this.ventaRepository = ventaRepository;
        this.compraRepository = compraRepository;
        this.movimientoInventarioRepository = movimientoInventarioRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public ReporteVentaFechaResponseDTO obtenerVentasPorFecha(LocalDate desde, LocalDate hasta) {
        return obtenerVentas(desde, hasta, null, null, null, null, null);
    }

    @Transactional(readOnly = true)
    public ReporteVentaFechaResponseDTO obtenerVentas(LocalDate desde, LocalDate hasta, Long empleadoId,
            String texto, String productoTexto, String numeroVenta, MedioPagoVenta medioPago) {
        RangoFechas rango = normalizarRango(desde, hasta);
        Long ventaId = parsearIdOpcional(numeroVenta);
        String textoNormalizado = normalizarTexto(texto);
        String productoNormalizado = normalizarTexto(productoTexto);
        List<ReporteVentaItemDTO> ventas = ventaRepository
                .buscarReporte(rango.desdeInicio(), rango.hastaFin(), EstadoVenta.EMITIDA.getCodigo(),
                        empleadoId, normalizarTexto(textoNormalizado != null ? textoNormalizado : numeroVenta),
                        productoNormalizado, ventaId, medioPago)
                .stream()
                .map(this::mapearVenta)
                .toList();

        return ReporteVentaFechaResponseDTO.builder()
                .desde(rango.desde())
                .hasta(rango.hasta())
                .cantidadVentas(ventas.size())
                .totalVentas(sumarVentas(ventas))
                .ventas(ventas)
                .build();
    }

    @Transactional(readOnly = true)
    public ReporteCompraProveedorResponseDTO obtenerComprasPorProveedor(Long proveedorId, LocalDate desde,
            LocalDate hasta) {
        if (proveedorId == null) {
            return obtenerCompras(null, desde, hasta);
        }
        RangoFechas rango = normalizarRango(desde, hasta);
        List<Compra> compras = compraRepository.findByProveedorIdAndFechaBetweenAndEstadoNotOrderByFechaAsc(
                proveedorId, rango.desdeInicio(), rango.hastaFin(), ESTADO_BORRADO);
        return construirReporteCompras(proveedorId, rango, compras);
    }

    @Transactional(readOnly = true)
    public ReporteCompraProveedorResponseDTO obtenerCompras(String proveedorTexto, LocalDate desde, LocalDate hasta) {
        RangoFechas rango = normalizarRango(desde, hasta);
        List<Compra> compras = compraRepository.buscarReporte(
                rango.desdeInicio(), rango.hastaFin(), ESTADO_BORRADO, normalizarTexto(proveedorTexto));
        return construirReporteCompras(null, rango, compras);
    }

    private ReporteCompraProveedorResponseDTO construirReporteCompras(Long proveedorId, RangoFechas rango,
            List<Compra> compras) {
        List<ReporteCompraItemDTO> items = compras.stream()
                .map(this::mapearCompra)
                .toList();

        return ReporteCompraProveedorResponseDTO.builder()
                .proveedorId(proveedorId)
                .desde(rango.desde())
                .hasta(rango.hasta())
                .cantidadCompras(items.size())
                .totalCompras(sumarCompras(items))
                .compras(items)
                .build();
    }

    @Transactional(readOnly = true)
    public ReporteCajaResponseDTO obtenerCajas(LocalDate desde, LocalDate hasta, Long empleadoId, EstadoCaja estado) {
        RangoFechas rango = normalizarRango(desde, hasta);
        List<ReporteCajaItemDTO> cajas = cajaRepository
                .buscarHistorial(rango.desdeInicio(), rango.hastaFin(), empleadoId, estado)
                .stream()
                .map(this::mapearCaja)
                .toList();

        return ReporteCajaResponseDTO.builder()
                .desde(rango.desde())
                .hasta(rango.hasta())
                .cantidadCajas(cajas.size())
                .totalIngresos(cajas.stream().map(ReporteCajaItemDTO::getTotalIngresos)
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .totalEgresos(cajas.stream().map(ReporteCajaItemDTO::getTotalEgresos)
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .cajas(cajas)
                .build();
    }

    @Transactional(readOnly = true)
    public ReporteCajaDetalleResponseDTO obtenerDetalleCaja(Long cajaId) {
        Caja caja = cajaRepository.findById(cajaId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro la caja con ID: " + cajaId));
        return ReporteCajaDetalleResponseDTO.builder()
                .caja(mapearCajaResponse(caja))
                .movimientos(movimientoCajaRepository.findByCajaIdOrderByFechaAsc(cajaId).stream()
                        .map(this::mapearMovimientoCaja)
                        .toList())
                .gastos(gastoRepository.findByCajaIdOrderByFechaAsc(cajaId).stream()
                        .map(this::mapearGasto)
                        .toList())
                .ventas(ventaRepository.findByCajaIdOrderByFechaAsc(cajaId).stream()
                        .filter(venta -> venta.getEstado() == EstadoVenta.EMITIDA.getCodigo())
                        .map(this::mapearVenta)
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public ReporteKardexResponseDTO obtenerKardex(Long productoId, LocalDate desde, LocalDate hasta) {
        if (productoId == null) {
            throw new IllegalArgumentException("El producto es obligatorio para consultar el kardex.");
        }
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado."));
        RangoFechas rango = normalizarRango(desde, hasta);
        List<ReporteKardexMovimientoDTO> movimientos = movimientoInventarioRepository
                .findByProductoIdAndFechaBetweenOrderByFechaAsc(productoId, rango.desdeInicio(), rango.hastaFin())
                .stream()
                .map(this::mapearMovimiento)
                .toList();

        BigDecimal stockFinal = movimientos.isEmpty()
                ? BigDecimal.ZERO
                : movimientos.get(movimientos.size() - 1).getStockNuevo();

        return ReporteKardexResponseDTO.builder()
                .productoId(producto.getId())
                .productoNombre(producto.getNombre())
                .productoCodigo(producto.getCodigo())
                .desde(rango.desde())
                .hasta(rango.hasta())
                .stockFinal(stockFinal)
                .movimientos(movimientos)
                .build();
    }

    private RangoFechas normalizarRango(LocalDate desde, LocalDate hasta) {
        LocalDate fechaDesde = desde != null ? desde : LocalDate.now();
        LocalDate fechaHasta = hasta != null ? hasta : fechaDesde;
        if (fechaHasta.isBefore(fechaDesde)) {
            throw new IllegalArgumentException("La fecha final no puede ser anterior a la fecha inicial.");
        }
        return new RangoFechas(fechaDesde, fechaHasta, fechaDesde.atStartOfDay(),
                fechaHasta.plusDays(1).atStartOfDay().minusNanos(1));
    }

    private ReporteVentaItemDTO mapearVenta(Venta venta) {
        return ReporteVentaItemDTO.builder()
                .ventaId(venta.getId())
                .fecha(venta.getFecha())
                .numeroComprobante(venta.getNumeroComprobante())
                .clienteNombre(nombreCliente(venta.getCliente()))
                .empleadoNombre(nombreCompleto(venta.getEmpleado()))
                .productosResumen(venta.getDetalles().stream()
                        .map(detalle -> detalle.getProducto().getNombre())
                        .distinct()
                        .reduce((a, b) -> a + ", " + b)
                        .orElse(""))
                .medioPago(venta.getMedioPago())
                .subtotal(monto(venta.getSubtotal()))
                .descuento(monto(venta.getDescuento()))
                .total(monto(venta.getTotal()))
                .build();
    }

    private ReporteCajaItemDTO mapearCaja(Caja caja) {
        BigDecimal totalIngresos = sumarMovimientosCaja(caja.getId(), TipoMovimientoCaja.INGRESO);
        BigDecimal totalEgresos = sumarMovimientosCaja(caja.getId(), TipoMovimientoCaja.EGRESO);
        BigDecimal montoEsperado = caja.getMontoEsperado() != null
                ? caja.getMontoEsperado()
                : monto(caja.getMontoInicial()).add(totalIngresos).subtract(totalEgresos);
        return ReporteCajaItemDTO.builder()
                .cajaId(caja.getId())
                .empleadoId(caja.getEmpleado().getId())
                .empleadoNombre(nombreCompleto(caja.getEmpleado()))
                .fechaApertura(caja.getFechaApertura())
                .fechaCierre(caja.getFechaCierre())
                .estado(caja.getEstado())
                .montoInicial(monto(caja.getMontoInicial()))
                .totalIngresos(totalIngresos)
                .totalEgresos(totalEgresos)
                .montoEsperado(montoEsperado)
                .montoReal(caja.getMontoReal())
                .diferencia(caja.getDiferencia())
                .build();
    }

    private CajaResponseDTO mapearCajaResponse(Caja caja) {
        ReporteCajaItemDTO item = mapearCaja(caja);
        return CajaResponseDTO.builder()
                .id(item.getCajaId())
                .empleadoId(item.getEmpleadoId())
                .empleadoNombre(item.getEmpleadoNombre())
                .fechaApertura(item.getFechaApertura())
                .fechaCierre(item.getFechaCierre())
                .montoInicial(item.getMontoInicial())
                .totalIngresos(item.getTotalIngresos())
                .totalEgresos(item.getTotalEgresos())
                .montoEsperado(item.getMontoEsperado())
                .montoReal(item.getMontoReal())
                .diferencia(item.getDiferencia())
                .estado(item.getEstado())
                .observaciones(caja.getObservaciones())
                .build();
    }

    private MovimientoCajaResponseDTO mapearMovimientoCaja(MovimientoCaja movimiento) {
        return MovimientoCajaResponseDTO.builder()
                .id(movimiento.getId())
                .cajaId(movimiento.getCaja().getId())
                .tipo(movimiento.getTipo())
                .origen(movimiento.getOrigen())
                .metodoPago(movimiento.getMetodoPago())
                .monto(movimiento.getMonto())
                .descripcion(movimiento.getDescripcion())
                .referenciaTipo(movimiento.getReferenciaTipo())
                .referenciaId(movimiento.getReferenciaId())
                .empleadoId(movimiento.getEmpleado().getId())
                .empleadoNombre(nombreCompleto(movimiento.getEmpleado()))
                .fecha(movimiento.getFecha())
                .anulado(movimiento.getAnulado())
                .build();
    }

    private GastoResponseDTO mapearGasto(Gasto gasto) {
        return GastoResponseDTO.builder()
                .id(gasto.getId())
                .cajaId(gasto.getCaja().getId())
                .movimientoCajaId(gasto.getMovimientoCaja().getId())
                .empleadoId(gasto.getEmpleado().getId())
                .empleadoNombre(nombreCompleto(gasto.getEmpleado()))
                .categoria(gasto.getCategoria())
                .descripcion(gasto.getDescripcion())
                .monto(gasto.getMonto())
                .metodoPago(gasto.getMetodoPago())
                .fecha(gasto.getFecha())
                .estado(gasto.getEstado())
                .build();
    }

    private BigDecimal sumarMovimientosCaja(Long cajaId, TipoMovimientoCaja tipo) {
        BigDecimal total = movimientoCajaRepository.sumarMontoPorCajaYTipo(cajaId, tipo);
        return total != null ? total : BigDecimal.ZERO;
    }

    private ReporteCompraItemDTO mapearCompra(Compra compra) {
        Proveedor proveedor = compra.getProveedor();
        return ReporteCompraItemDTO.builder()
                .compraId(compra.getId())
                .fecha(compra.getFecha())
                .numeroComprobante(compra.getNumeroComprobante())
                .proveedorId(proveedor.getId())
                .proveedorNombre(nombreProveedor(proveedor))
                .empleadoNombre(nombreCompleto(compra.getEmpleado()))
                .medioPago(compra.getMedioPago())
                .estado(EstadoCompra.desdeCodigo(compra.getEstado()))
                .subtotal(monto(compra.getSubtotal()))
                .descuento(monto(compra.getDescuento()))
                .total(monto(compra.getTotal()))
                .build();
    }

    private ReporteKardexMovimientoDTO mapearMovimiento(MovimientoInventario movimiento) {
        return ReporteKardexMovimientoDTO.builder()
                .movimientoId(movimiento.getId())
                .fecha(movimiento.getFecha())
                .tipo(movimiento.getTipo())
                .cantidad(movimiento.getCantidad())
                .stockPrevio(movimiento.getStockPrevio())
                .stockNuevo(movimiento.getStockNuevo())
                .motivo(movimiento.getMotivo())
                .referenciaTipo(movimiento.getReferenciaTipo())
                .referenciaId(movimiento.getReferenciaId())
                .empleadoNombre(movimiento.getEmpleado() != null ? nombreCompleto(movimiento.getEmpleado()) : null)
                .build();
    }

    private BigDecimal sumarVentas(List<ReporteVentaItemDTO> ventas) {
        return ventas.stream()
                .map(ReporteVentaItemDTO::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumarCompras(List<ReporteCompraItemDTO> compras) {
        return compras.stream()
                .map(ReporteCompraItemDTO::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal monto(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }

    private String nombreCliente(Cliente cliente) {
        return String.join(" ",
                texto(cliente.getNombre()),
                texto(cliente.getApellidoPaterno()),
                texto(cliente.getApellidoMaterno())).trim();
    }

    private String nombreProveedor(Proveedor proveedor) {
        if (proveedor.getRazonSocial() != null && !proveedor.getRazonSocial().isBlank()) {
            return proveedor.getRazonSocial().trim();
        }
        return proveedor.getNombreComercial();
    }

    private String nombreCompleto(Empleado empleado) {
        return String.join(" ",
                texto(empleado.getNombre()),
                texto(empleado.getApellidoPaterno()),
                texto(empleado.getApellidoMaterno())).trim();
    }

    private String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private String normalizarTexto(String valor) {
        String texto = texto(valor);
        return texto.isEmpty() ? null : texto;
    }

    private Long parsearIdOpcional(String valor) {
        String texto = normalizarTexto(valor);
        if (texto == null || !texto.matches("\\d+")) {
            return null;
        }
        return Long.valueOf(texto);
    }

    private record RangoFechas(LocalDate desde, LocalDate hasta, LocalDateTime desdeInicio,
            LocalDateTime hastaFin) {
    }
}
