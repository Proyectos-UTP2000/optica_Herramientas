package com.herramientas.optica.modules.caja.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.caja.dto.AperturaCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.CajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.CierreCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.GastoRequestDTO;
import com.herramientas.optica.modules.caja.dto.GastoResponseDTO;
import com.herramientas.optica.modules.caja.dto.MovimientoCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.MovimientoCajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.ReporteDiarioCajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.VentaReporteDiarioDTO;
import com.herramientas.optica.modules.caja.model.Caja;
import com.herramientas.optica.modules.caja.model.EstadoCaja;
import com.herramientas.optica.modules.caja.model.EstadoGasto;
import com.herramientas.optica.modules.caja.model.Gasto;
import com.herramientas.optica.modules.caja.model.MetodoPagoCaja;
import com.herramientas.optica.modules.caja.model.MovimientoCaja;
import com.herramientas.optica.modules.caja.model.OrigenMovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;
import com.herramientas.optica.modules.caja.repository.CajaRepository;
import com.herramientas.optica.modules.caja.repository.GastoRepository;
import com.herramientas.optica.modules.caja.repository.MovimientoCajaRepository;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.ventas.model.EstadoVenta;
import com.herramientas.optica.modules.ventas.model.Venta;
import com.herramientas.optica.modules.ventas.repository.VentaRepository;

@Service
public class CajaService {

    private static final String MEDIO_PAGO_SIN_MEDIO = "SIN_MEDIO";

    private final CajaRepository cajaRepository;
    private final MovimientoCajaRepository movimientoCajaRepository;
    private final GastoRepository gastoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final VentaRepository ventaRepository;

    public CajaService(CajaRepository cajaRepository, MovimientoCajaRepository movimientoCajaRepository,
            GastoRepository gastoRepository, EmpleadoRepository empleadoRepository, VentaRepository ventaRepository) {
        this.cajaRepository = cajaRepository;
        this.movimientoCajaRepository = movimientoCajaRepository;
        this.gastoRepository = gastoRepository;
        this.empleadoRepository = empleadoRepository;
        this.ventaRepository = ventaRepository;
    }

    /**
     * Abre una nueva caja para el empleado responsable si no tiene otra caja
     * abierta.
     */
    @Transactional
    public CajaResponseDTO abrirCaja(AperturaCajaRequestDTO dto) {
        Empleado empleado = obtenerEmpleadoActivo(dto.getEmpleadoId());
        if (cajaRepository.existsByEmpleadoIdAndEstado(empleado.getId(), EstadoCaja.ABIERTA)) {
            throw new IllegalStateException("El empleado ya tiene una caja abierta.");
        }

        Caja caja = Caja.builder()
                .empleado(empleado)
                .fechaApertura(LocalDateTime.now())
                .montoInicial(normalizarMonto(dto.getMontoInicial()))
                .estado(EstadoCaja.ABIERTA)
                .observaciones(normalizarTextoOpcional(dto.getObservaciones()))
                .build();

        return mapearCaja(cajaRepository.save(caja));
    }

    @Transactional(readOnly = true)
    public CajaResponseDTO obtenerCajaActual(Long empleadoId) {
        Caja caja = cajaRepository.findByEmpleadoIdAndEstado(empleadoId, EstadoCaja.ABIERTA)
                .orElseThrow(() -> new IllegalStateException("El empleado no tiene una caja abierta."));
        return mapearCaja(caja);
    }

    @Transactional(readOnly = true)
    public CajaResponseDTO buscarCaja(Long cajaId) {
        return mapearCaja(obtenerCaja(cajaId));
    }

    @Transactional(readOnly = true)
    public List<MovimientoCajaResponseDTO> listarMovimientos(Long cajaId) {
        obtenerCaja(cajaId);
        return movimientoCajaRepository.findByCajaIdOrderByFechaAsc(cajaId).stream()
                .map(this::mapearMovimiento)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReporteDiarioCajaResponseDTO obtenerReporteDiario(Long cajaId) {
        Caja caja = obtenerCaja(cajaId);
        LocalDate diaApertura = caja.getFechaApertura().toLocalDate();
        LocalDateTime desde = diaApertura.atStartOfDay();
        LocalDateTime hasta = diaApertura.plusDays(1).atStartOfDay().minusNanos(1);
        List<Venta> ventas = ventaRepository.findByCajaIdAndFechaBetweenAndEstadoOrderByFechaAsc(
                cajaId, desde, hasta, EstadoVenta.EMITIDA.getCodigo());
        List<VentaReporteDiarioDTO> ventasReporte = ventas.stream()
                .map(this::mapearVentaReporteDiario)
                .toList();

        BigDecimal totalVentas = BigDecimal.ZERO;
        Map<String, BigDecimal> totalPorMedioPago = new LinkedHashMap<>();
        for (Venta venta : ventas) {
            BigDecimal totalVenta = montoReporte(venta.getTotal());
            totalVentas = totalVentas.add(totalVenta);
            totalPorMedioPago.merge(medioPagoReporte(venta), totalVenta, BigDecimal::add);
        }

        return ReporteDiarioCajaResponseDTO.builder()
                .cajaId(caja.getId())
                .empleadoId(caja.getEmpleado().getId())
                .empleadoNombre(nombreCompleto(caja.getEmpleado()))
                .fechaApertura(caja.getFechaApertura())
                .fechaCierre(caja.getFechaCierre())
                .estadoCaja(caja.getEstado())
                .montoInicial(caja.getMontoInicial())
                .totalVentas(totalVentas)
                .cantidadVentas(ventas.size())
                .totalPorMedioPago(totalPorMedioPago)
                .ventas(ventasReporte)
                .build();
    }

    /**
     * Registra un movimiento manual sobre una caja abierta sin modificar
     * movimientos previos.
     */
    @Transactional
    public MovimientoCajaResponseDTO registrarMovimiento(Long cajaId, MovimientoCajaRequestDTO dto) {
        Caja caja = obtenerCajaAbierta(cajaId);
        Empleado empleado = obtenerEmpleadoActivo(dto.getEmpleadoId());
        MovimientoCaja movimiento = crearMovimiento(
                caja,
                empleado,
                dto.getTipo(),
                dto.getOrigen(),
                dto.getMetodoPago(),
                dto.getMonto(),
                dto.getDescripcion(),
                dto.getReferenciaTipo(),
                dto.getReferenciaId());

        return mapearMovimiento(movimientoCajaRepository.save(movimiento));
    }

    /**
     * Registra un gasto operativo y su egreso de caja asociado dentro de la misma
     * transaccion.
     */
    @Transactional
    public GastoResponseDTO registrarGasto(Long cajaId, GastoRequestDTO dto) {
        Caja caja = obtenerCajaAbierta(cajaId);
        Empleado empleado = obtenerEmpleadoActivo(dto.getEmpleadoId());
        String descripcion = normalizarTextoObligatorio(dto.getDescripcion(), "La descripcion del gasto es obligatoria.");

        MovimientoCaja movimiento = crearMovimiento(
                caja,
                empleado,
                TipoMovimientoCaja.EGRESO,
                OrigenMovimientoCaja.GASTO,
                dto.getMetodoPago(),
                dto.getMonto(),
                descripcion,
                "GASTO",
                null);
        MovimientoCaja movimientoGuardado = movimientoCajaRepository.save(movimiento);

        Gasto gasto = Gasto.builder()
                .caja(caja)
                .movimientoCaja(movimientoGuardado)
                .empleado(empleado)
                .categoria(normalizarTextoObligatorio(dto.getCategoria(), "La categoria del gasto es obligatoria."))
                .descripcion(descripcion)
                .monto(normalizarMontoPositivo(dto.getMonto()))
                .metodoPago(dto.getMetodoPago())
                .fecha(movimientoGuardado.getFecha())
                .estado(EstadoGasto.REGISTRADO)
                .build();
        Gasto gastoGuardado = gastoRepository.save(gasto);

        movimientoGuardado.setReferenciaId(gastoGuardado.getId());
        movimientoCajaRepository.save(movimientoGuardado);

        return mapearGasto(gastoGuardado);
    }

    /**
     * Cierra una caja abierta calculando el monto esperado contra movimientos no
     * anulados.
     */
    @Transactional
    public CajaResponseDTO cerrarCaja(Long cajaId, CierreCajaRequestDTO dto) {
        Caja caja = obtenerCajaAbierta(cajaId);
        BigDecimal totalIngresos = sumarMovimientos(cajaId, TipoMovimientoCaja.INGRESO);
        BigDecimal totalEgresos = sumarMovimientos(cajaId, TipoMovimientoCaja.EGRESO);
        BigDecimal montoEsperado = caja.getMontoInicial().add(totalIngresos).subtract(totalEgresos);
        BigDecimal montoReal = normalizarMonto(dto.getMontoReal());

        caja.setFechaCierre(LocalDateTime.now());
        caja.setMontoEsperado(montoEsperado);
        caja.setMontoReal(montoReal);
        caja.setDiferencia(montoReal.subtract(montoEsperado));
        caja.setEstado(EstadoCaja.CERRADA);
        caja.setObservaciones(normalizarTextoOpcional(dto.getObservaciones()));

        return mapearCaja(cajaRepository.save(caja));
    }

    private MovimientoCaja crearMovimiento(Caja caja, Empleado empleado, TipoMovimientoCaja tipo,
            OrigenMovimientoCaja origen, MetodoPagoCaja metodoPago, BigDecimal monto, String descripcion,
            String referenciaTipo, Long referenciaId) {
        if (tipo == null) {
            throw new IllegalArgumentException("El tipo de movimiento es obligatorio.");
        }
        if (origen == null) {
            throw new IllegalArgumentException("El origen del movimiento es obligatorio.");
        }
        if (metodoPago == null) {
            throw new IllegalArgumentException("El metodo de pago es obligatorio.");
        }

        return MovimientoCaja.builder()
                .caja(caja)
                .tipo(tipo)
                .origen(origen)
                .metodoPago(metodoPago)
                .monto(normalizarMontoPositivo(monto))
                .descripcion(normalizarTextoObligatorio(descripcion, "La descripcion es obligatoria."))
                .referenciaTipo(normalizarTextoOpcional(referenciaTipo))
                .referenciaId(referenciaId)
                .empleado(empleado)
                .fecha(LocalDateTime.now())
                .anulado(false)
                .build();
    }

    private Caja obtenerCaja(Long cajaId) {
        return cajaRepository.findById(cajaId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro la caja con ID: " + cajaId));
    }

    private Caja obtenerCajaAbierta(Long cajaId) {
        Caja caja = obtenerCaja(cajaId);
        if (caja.getEstado() != EstadoCaja.ABIERTA) {
            throw new IllegalStateException("La caja seleccionada esta cerrada y no permite movimientos.");
        }
        return caja;
    }

    private Empleado obtenerEmpleadoActivo(Long empleadoId) {
        Empleado empleado = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el empleado con ID: " + empleadoId));
        if (empleado.getEstado() == null || empleado.getEstado() != 1) {
            throw new IllegalStateException("El empleado seleccionado no esta activo.");
        }
        return empleado;
    }

    private BigDecimal sumarMovimientos(Long cajaId, TipoMovimientoCaja tipo) {
        BigDecimal total = movimientoCajaRepository.sumarMontoPorCajaYTipo(cajaId, tipo);
        return total != null ? total : BigDecimal.ZERO;
    }

    private BigDecimal normalizarMonto(BigDecimal monto) {
        if (monto == null) {
            throw new IllegalArgumentException("El monto es obligatorio.");
        }
        if (monto.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El monto no puede ser negativo.");
        }
        return monto;
    }

    private BigDecimal normalizarMontoPositivo(BigDecimal monto) {
        normalizarMonto(monto);
        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor que cero.");
        }
        return monto;
    }

    private String normalizarTextoObligatorio(String texto, String mensaje) {
        if (texto == null || texto.trim().isEmpty()) {
            throw new IllegalArgumentException(mensaje);
        }
        return texto.trim();
    }

    private String normalizarTextoOpcional(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return null;
        }
        return texto.trim();
    }

    private CajaResponseDTO mapearCaja(Caja caja) {
        BigDecimal totalIngresos = sumarMovimientos(caja.getId(), TipoMovimientoCaja.INGRESO);
        BigDecimal totalEgresos = sumarMovimientos(caja.getId(), TipoMovimientoCaja.EGRESO);
        BigDecimal montoEsperadoActual = caja.getMontoEsperado() != null
                ? caja.getMontoEsperado()
                : caja.getMontoInicial().add(totalIngresos).subtract(totalEgresos);

        return CajaResponseDTO.builder()
                .id(caja.getId())
                .empleadoId(caja.getEmpleado().getId())
                .empleadoNombre(nombreCompleto(caja.getEmpleado()))
                .fechaApertura(caja.getFechaApertura())
                .fechaCierre(caja.getFechaCierre())
                .montoInicial(caja.getMontoInicial())
                .totalIngresos(totalIngresos)
                .totalEgresos(totalEgresos)
                .montoEsperado(montoEsperadoActual)
                .montoReal(caja.getMontoReal())
                .diferencia(caja.getDiferencia())
                .estado(caja.getEstado())
                .observaciones(caja.getObservaciones())
                .build();
    }

    private MovimientoCajaResponseDTO mapearMovimiento(MovimientoCaja movimiento) {
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

    private VentaReporteDiarioDTO mapearVentaReporteDiario(Venta venta) {
        return VentaReporteDiarioDTO.builder()
                .ventaId(venta.getId())
                .fecha(venta.getFecha())
                .clienteNombre(nombreCliente(venta.getCliente()))
                .medioPago(medioPagoReporte(venta))
                .subtotal(montoReporte(venta.getSubtotal()))
                .descuento(montoReporte(venta.getDescuento()))
                .total(montoReporte(venta.getTotal()))
                .numeroComprobante(venta.getNumeroComprobante())
                .build();
    }

    private String medioPagoReporte(Venta venta) {
        return venta.getMedioPago() != null ? venta.getMedioPago().name() : MEDIO_PAGO_SIN_MEDIO;
    }

    private BigDecimal montoReporte(BigDecimal monto) {
        return monto != null ? monto : BigDecimal.ZERO;
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
}
