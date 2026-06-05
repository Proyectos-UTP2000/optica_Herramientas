package com.herramientas.optica.modules.caja.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.caja.dto.AperturaCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.CajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.CierreCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.GastoRequestDTO;
import com.herramientas.optica.modules.caja.dto.GastoResponseDTO;
import com.herramientas.optica.modules.caja.dto.MovimientoCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.MovimientoCajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.ReporteDiarioCajaResponseDTO;
import com.herramientas.optica.modules.caja.model.Caja;
import com.herramientas.optica.modules.caja.model.EstadoCaja;
import com.herramientas.optica.modules.caja.model.EstadoGasto;
import com.herramientas.optica.modules.caja.model.MetodoPagoCaja;
import com.herramientas.optica.modules.caja.model.OrigenMovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;
import com.herramientas.optica.modules.caja.repository.CajaRepository;
import com.herramientas.optica.modules.caja.repository.MovimientoCajaRepository;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;
import com.herramientas.optica.modules.ventas.model.EstadoVenta;
import com.herramientas.optica.modules.ventas.model.FormaPagoVenta;
import com.herramientas.optica.modules.ventas.model.MedioPagoVenta;
import com.herramientas.optica.modules.ventas.model.Venta;
import com.herramientas.optica.modules.ventas.repository.VentaRepository;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CajaServiceTest {

    @Autowired
    private CajaService cajaService;

    @Autowired
    private MovimientoCajaRepository movimientoCajaRepository;

    @Autowired
    private CajaRepository cajaRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void abrirCajaCreaCajaAbiertaConMontoInicial() {
        Empleado empleado = crearEmpleado("cajero_apertura");

        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "150.00"));

        assertThat(caja.getId()).isNotNull();
        assertThat(caja.getEstado()).isEqualTo(EstadoCaja.ABIERTA);
        assertThat(caja.getEmpleadoId()).isEqualTo(empleado.getId());
        assertThat(caja.getMontoInicial()).isEqualByComparingTo("150.00");
        assertThat(caja.getMontoEsperado()).isEqualByComparingTo("150.00");
    }

    @Test
    void abrirSegundaCajaParaMismoEmpleadoFalla() {
        Empleado empleado = crearEmpleado("cajero_unico");
        cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));

        assertThatThrownBy(() -> cajaService.abrirCaja(aperturaRequest(empleado.getId(), "50.00")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ya tiene una caja abierta");
    }

    @Test
    void registrarMovimientoEnCajaAbiertaPersisteMovimiento() {
        Empleado empleado = crearEmpleado("cajero_movimiento");
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));

        MovimientoCajaResponseDTO movimiento = cajaService.registrarMovimiento(
                caja.getId(),
                movimientoRequest(empleado.getId(), TipoMovimientoCaja.INGRESO, "25.50", "Ajuste por sobrante"));

        assertThat(movimiento.getId()).isNotNull();
        assertThat(movimiento.getCajaId()).isEqualTo(caja.getId());
        assertThat(movimiento.getTipo()).isEqualTo(TipoMovimientoCaja.INGRESO);
        assertThat(movimiento.getMonto()).isEqualByComparingTo("25.50");
        assertThat(movimientoCajaRepository.findByCajaIdOrderByFechaAsc(caja.getId())).hasSize(1);
    }

    @Test
    void registrarGastoCreaGastoYMovimientoDeEgreso() {
        Empleado empleado = crearEmpleado("cajero_gasto");
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "200.00"));

        GastoResponseDTO gasto = cajaService.registrarGasto(caja.getId(), gastoRequest(empleado.getId(), "12.30"));
        MovimientoCajaResponseDTO movimiento = cajaService.listarMovimientos(caja.getId()).get(0);

        assertThat(gasto.getId()).isNotNull();
        assertThat(gasto.getEstado()).isEqualTo(EstadoGasto.REGISTRADO);
        assertThat(gasto.getMovimientoCajaId()).isEqualTo(movimiento.getId());
        assertThat(movimiento.getTipo()).isEqualTo(TipoMovimientoCaja.EGRESO);
        assertThat(movimiento.getOrigen()).isEqualTo(OrigenMovimientoCaja.GASTO);
        assertThat(movimiento.getMonto()).isEqualByComparingTo("12.30");
    }

    @Test
    void registrarMovimientoEnCajaCerradaFalla() {
        Empleado empleado = crearEmpleado("cajero_cerrada");
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));
        cajaService.cerrarCaja(caja.getId(), cierreRequest("100.00"));

        assertThatThrownBy(() -> cajaService.registrarMovimiento(
                caja.getId(),
                movimientoRequest(empleado.getId(), TipoMovimientoCaja.INGRESO, "10.00", "Movimiento tardio")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("esta cerrada");
    }

    @Test
    void cerrarCajaCalculaMontoEsperadoYDiferencia() {
        Empleado empleado = crearEmpleado("cajero_cierre");
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));
        cajaService.registrarMovimiento(
                caja.getId(),
                movimientoRequest(empleado.getId(), TipoMovimientoCaja.INGRESO, "40.00", "Ingreso manual"));
        cajaService.registrarGasto(caja.getId(), gastoRequest(empleado.getId(), "15.00"));

        CajaResponseDTO cierre = cajaService.cerrarCaja(caja.getId(), cierreRequest("130.00"));

        assertThat(cierre.getEstado()).isEqualTo(EstadoCaja.CERRADA);
        assertThat(cierre.getTotalIngresos()).isEqualByComparingTo("40.00");
        assertThat(cierre.getTotalEgresos()).isEqualByComparingTo("15.00");
        assertThat(cierre.getMontoEsperado()).isEqualByComparingTo("125.00");
        assertThat(cierre.getMontoReal()).isEqualByComparingTo("130.00");
        assertThat(cierre.getDiferencia()).isEqualByComparingTo("5.00");
    }

    @Test
    void obtenerReporteDiarioIncluyeVentasEmitidasDelDiaDeApertura() {
        Empleado empleado = crearEmpleado("cajero_reporte");
        Cliente cliente = crearCliente("71000001", "Cliente Reporte");
        CajaResponseDTO cajaResponse = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "80.00"));
        Caja caja = cajaRepository.findById(cajaResponse.getId()).orElseThrow();
        LocalDateTime fechaVenta = caja.getFechaApertura()
                .withHour(12)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
        Venta venta = ventaRepository.save(Venta.builder()
                .cliente(cliente)
                .empleado(empleado)
                .caja(caja)
                .fecha(fechaVenta)
                .numeroComprobante("B001-000123")
                .formaPago(FormaPagoVenta.CONTADO)
                .medioPago(MedioPagoVenta.YAPE)
                .subtotal(new BigDecimal("120.00"))
                .descuento(new BigDecimal("10.00"))
                .total(new BigDecimal("110.00"))
                .estado(EstadoVenta.EMITIDA.getCodigo())
                .build());
        entityManager.flush();
        entityManager.clear();

        ReporteDiarioCajaResponseDTO reporte = cajaService.obtenerReporteDiario(caja.getId());

        assertThat(reporte.getCajaId()).isEqualTo(caja.getId());
        assertThat(reporte.getEmpleadoId()).isEqualTo(empleado.getId());
        assertThat(reporte.getEmpleadoNombre()).isEqualTo("Cajero Prueba Caja");
        assertThat(reporte.getFechaApertura()).isEqualToIgnoringNanos(caja.getFechaApertura());
        assertThat(reporte.getEstadoCaja()).isEqualTo(EstadoCaja.ABIERTA);
        assertThat(reporte.getMontoInicial()).isEqualByComparingTo("80.00");
        assertThat(reporte.getCantidadVentas()).isEqualTo(1);
        assertThat(reporte.getTotalVentas()).isEqualByComparingTo("110.00");
        assertThat(reporte.getTotalPorMedioPago()).containsOnlyKeys("YAPE");
        assertThat(reporte.getTotalPorMedioPago().get("YAPE")).isEqualByComparingTo("110.00");
        assertThat(reporte.getVentas()).hasSize(1).first().satisfies(ventaReporte -> {
            assertThat(ventaReporte.getVentaId()).isEqualTo(venta.getId());
            assertThat(ventaReporte.getFecha()).isEqualTo(venta.getFecha());
            assertThat(ventaReporte.getClienteNombre()).isEqualTo("Cliente Reporte Test");
            assertThat(ventaReporte.getMedioPago()).isEqualTo("YAPE");
            assertThat(ventaReporte.getSubtotal()).isEqualByComparingTo("120.00");
            assertThat(ventaReporte.getDescuento()).isEqualByComparingTo("10.00");
            assertThat(ventaReporte.getTotal()).isEqualByComparingTo("110.00");
            assertThat(ventaReporte.getNumeroComprobante()).isEqualTo("B001-000123");
        });
    }

    @Test
    void obtenerReporteDiarioToleraVentasLegacyConMontosYMedioPagoNulos() {
        Empleado empleado = crearEmpleado("cajero_reporte_legacy");
        Cliente cliente = crearCliente("71000002", "Cliente Legacy");
        CajaResponseDTO cajaResponse = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "80.00"));
        Caja caja = cajaRepository.findById(cajaResponse.getId()).orElseThrow();
        LocalDateTime fechaVenta = caja.getFechaApertura()
                .withHour(12)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
        Venta venta = ventaRepository.save(Venta.builder()
                .cliente(cliente)
                .empleado(empleado)
                .caja(caja)
                .fecha(fechaVenta)
                .numeroComprobante("B001-000124")
                .formaPago(FormaPagoVenta.CONTADO)
                .medioPago(null)
                .subtotal(null)
                .descuento(null)
                .total(null)
                .estado(EstadoVenta.EMITIDA.getCodigo())
                .build());
        entityManager.flush();
        entityManager.clear();

        ReporteDiarioCajaResponseDTO reporte = cajaService.obtenerReporteDiario(caja.getId());

        assertThat(reporte.getCantidadVentas()).isEqualTo(1);
        assertThat(reporte.getTotalVentas()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(reporte.getTotalPorMedioPago()).containsOnlyKeys("SIN_MEDIO");
        assertThat(reporte.getTotalPorMedioPago().get("SIN_MEDIO")).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(reporte.getVentas()).hasSize(1).first().satisfies(ventaReporte -> {
            assertThat(ventaReporte.getVentaId()).isEqualTo(venta.getId());
            assertThat(ventaReporte.getMedioPago()).isEqualTo("SIN_MEDIO");
            assertThat(ventaReporte.getSubtotal()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(ventaReporte.getDescuento()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(ventaReporte.getTotal()).isEqualByComparingTo(BigDecimal.ZERO);
        });
    }

    private Empleado crearEmpleado(String username) {
        Perfil perfil = perfilRepository.save(Perfil.builder()
                .nombre("PERFIL_" + username)
                .descripcion("Perfil de prueba")
                .estado(1)
                .build());

        return empleadoRepository.save(Empleado.builder()
                .nombre("Cajero")
                .username(username)
                .apellidoPaterno("Prueba")
                .apellidoMaterno("Caja")
                .correo(username + "@example.test")
                .contrasena("secret")
                .telefono(String.format("%09d", Math.abs(username.hashCode()) % 1_000_000_000))
                .direccion("Direccion de prueba")
                .estado(1)
                .numeroDocumento(String.format("%08d", Math.abs((username + "doc").hashCode()) % 100_000_000))
                .perfil(perfil)
                .idTipoDocumento(1L)
                .idEmpresa(1L)
                .build());
    }

    private Cliente crearCliente(String documento, String nombre) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("DNI CAJA " + documento)
                .build());

        return clienteRepository.save(Cliente.builder()
                .nombre(nombre)
                .apellidoPaterno("Test")
                .apellidoMaterno("")
                .correo(documento + "@example.test")
                .telefono("987654321")
                .direccion("Direccion cliente")
                .numeroDocumento(documento)
                .tipoDocumento(tipoDocumento)
                .estado(1)
                .build());
    }

    private AperturaCajaRequestDTO aperturaRequest(Long empleadoId, String montoInicial) {
        AperturaCajaRequestDTO dto = new AperturaCajaRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setMontoInicial(new BigDecimal(montoInicial));
        dto.setObservaciones("Apertura de prueba");
        return dto;
    }

    private MovimientoCajaRequestDTO movimientoRequest(Long empleadoId, TipoMovimientoCaja tipo, String monto,
            String descripcion) {
        MovimientoCajaRequestDTO dto = new MovimientoCajaRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setTipo(tipo);
        dto.setOrigen(OrigenMovimientoCaja.AJUSTE);
        dto.setMetodoPago(MetodoPagoCaja.EFECTIVO);
        dto.setMonto(new BigDecimal(monto));
        dto.setDescripcion(descripcion);
        return dto;
    }

    private GastoRequestDTO gastoRequest(Long empleadoId, String monto) {
        GastoRequestDTO dto = new GastoRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setCategoria("MOVILIDAD");
        dto.setDescripcion("Movilidad operativa");
        dto.setMonto(new BigDecimal(monto));
        dto.setMetodoPago(MetodoPagoCaja.EFECTIVO);
        return dto;
    }

    private CierreCajaRequestDTO cierreRequest(String montoReal) {
        CierreCajaRequestDTO dto = new CierreCajaRequestDTO();
        dto.setMontoReal(new BigDecimal(montoReal));
        dto.setObservaciones("Cierre de prueba");
        return dto;
    }
}
