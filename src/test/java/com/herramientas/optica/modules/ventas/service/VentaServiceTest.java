package com.herramientas.optica.modules.ventas.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.caja.dto.AperturaCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.CajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.CierreCajaRequestDTO;
import com.herramientas.optica.modules.caja.model.MetodoPagoCaja;
import com.herramientas.optica.modules.caja.model.OrigenMovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;
import com.herramientas.optica.modules.caja.repository.MovimientoCajaRepository;
import com.herramientas.optica.modules.caja.service.CajaService;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.compras.model.TipoComprobante;
import com.herramientas.optica.modules.compras.repository.TipoComprobanteRepository;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;
import com.herramientas.optica.modules.inventario.model.ReferenciaInventario;
import com.herramientas.optica.modules.inventario.repository.MovimientoInventarioRepository;
import com.herramientas.optica.modules.inventario.service.InventarioService;
import com.herramientas.optica.modules.productos.model.Categoria;
import com.herramientas.optica.modules.productos.model.Marca;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.model.TipoProducto;
import com.herramientas.optica.modules.productos.model.Unidad;
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;
import com.herramientas.optica.modules.ventas.dto.VentaDetalleRequestDTO;
import com.herramientas.optica.modules.ventas.dto.VentaRequestDTO;
import com.herramientas.optica.modules.ventas.dto.VentaResponseDTO;
import com.herramientas.optica.modules.ventas.model.EstadoVenta;
import com.herramientas.optica.modules.ventas.model.FormaPagoVenta;
import com.herramientas.optica.modules.ventas.model.MedioPagoVenta;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class VentaServiceTest {

    @Autowired
    private VentaService ventaService;

    @Autowired
    private CajaService cajaService;

    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private MovimientoCajaRepository movimientoCajaRepository;

    @Autowired
    private MovimientoInventarioRepository movimientoInventarioRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired
    private UnidadRepository unidadRepository;

    @Autowired
    private TipoComprobanteRepository tipoComprobanteRepository;

    @Test
    void emitirVentaContadoCreaDetalleSalidaInventarioEIngresoCaja() {
        Empleado empleado = crearEmpleado("ventas_contado");
        Cliente cliente = crearCliente("70000001", "Cliente Venta Contado");
        Producto producto = crearProducto("VENTA-CONTADO", "45.00");
        inventarioService.inicializarProducto(producto, new BigDecimal("10"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));

        VentaResponseDTO venta = ventaService.emitirVenta(ventaRequest(
                cliente.getId(),
                empleado.getId(),
                caja.getId(),
                producto.getId(),
                "3",
                "45.00"));

        assertThat(venta.getId()).isNotNull();
        assertThat(venta.getEstado()).isEqualTo(EstadoVenta.EMITIDA);
        assertThat(venta.getFormaPago()).isEqualTo(FormaPagoVenta.CONTADO);
        assertThat(venta.getMedioPago()).isEqualTo(MedioPagoVenta.EFECTIVO);
        assertThat(venta.getSubtotal()).isEqualByComparingTo("135.00");
        assertThat(venta.getTotal()).isEqualByComparingTo("135.00");
        assertThat(venta.getDetalles()).hasSize(1).first().satisfies(detalle -> {
            assertThat(detalle.getProductoId()).isEqualTo(producto.getId());
            assertThat(detalle.getCantidad()).isEqualByComparingTo("3.000");
            assertThat(detalle.getPrecioUnitario()).isEqualByComparingTo("45.00");
            assertThat(detalle.getSubtotal()).isEqualByComparingTo("135.00");
            assertThat(detalle.getStockPrevio()).isEqualByComparingTo("10.000");
            assertThat(detalle.getStockActual()).isEqualByComparingTo("7.000");
        });

        assertThat(productoRepository.findById(producto.getId()).orElseThrow().getStock()).isEqualTo(7);
        assertThat(movimientoInventarioRepository.findByProductoIdOrderByFechaAsc(producto.getId()))
                .filteredOn(mov -> mov.getReferenciaTipo() == ReferenciaInventario.VENTA)
                .hasSize(1)
                .first()
                .satisfies(mov -> {
                    assertThat(mov.getReferenciaId()).isEqualTo(venta.getId());
                    assertThat(mov.getStockNuevo()).isEqualByComparingTo("7.000");
                });
        assertThat(movimientoCajaRepository.findByCajaIdOrderByFechaAsc(caja.getId()))
                .hasSize(1)
                .first()
                .satisfies(mov -> {
                    assertThat(mov.getTipo()).isEqualTo(TipoMovimientoCaja.INGRESO);
                    assertThat(mov.getOrigen()).isEqualTo(OrigenMovimientoCaja.VENTA);
                    assertThat(mov.getMetodoPago()).isEqualTo(MetodoPagoCaja.EFECTIVO);
                    assertThat(mov.getMonto()).isEqualByComparingTo("135.00");
                    assertThat(mov.getReferenciaTipo()).isEqualTo("VENTA");
                    assertThat(mov.getReferenciaId()).isEqualTo(venta.getId());
                });
    }

    @Test
    void emitirVentaSinStockSuficienteFallaYNoRegistraCaja() {
        Empleado empleado = crearEmpleado("ventas_sin_stock");
        Cliente cliente = crearCliente("70000002", "Cliente Sin Stock");
        Producto producto = crearProducto("VENTA-SIN-STOCK", "20.00");
        inventarioService.inicializarProducto(producto, new BigDecimal("1"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));

        assertThatThrownBy(() -> ventaService.emitirVenta(ventaRequest(
                cliente.getId(),
                empleado.getId(),
                caja.getId(),
                producto.getId(),
                "2",
                "20.00")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("supera el stock disponible");

        assertThat(movimientoCajaRepository.findByCajaIdOrderByFechaAsc(caja.getId())).isEmpty();
    }

    @Test
    void emitirVentaConProductoSinStockFalla() {
        Empleado empleado = crearEmpleado("ventas_sin_stock_ex");
        Cliente cliente = crearCliente("70000009", "Cliente Sin Stock Ex");
        Producto producto = crearProducto("VENTA-SIN-STOCK-EX", "20.00");
        inventarioService.inicializarProducto(producto, BigDecimal.ZERO, 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));

        assertThatThrownBy(() -> ventaService.emitirVenta(ventaRequest(
                cliente.getId(),
                empleado.getId(),
                caja.getId(),
                producto.getId(),
                "1",
                "20.00")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("está sin stock");
    }

    @Test
    void emitirVentaConCajaCerradaFalla() {
        Empleado empleado = crearEmpleado("ventas_caja_cerrada");
        Cliente cliente = crearCliente("70000003", "Cliente Caja Cerrada");
        Producto producto = crearProducto("VENTA-CAJA-CERRADA", "20.00");
        inventarioService.inicializarProducto(producto, new BigDecimal("5"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));
        cajaService.cerrarCaja(caja.getId(), cierreRequest("100.00"));

        assertThatThrownBy(() -> ventaService.emitirVenta(ventaRequest(
                cliente.getId(),
                empleado.getId(),
                caja.getId(),
                producto.getId(),
                "1",
                "20.00")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("esta cerrada");
    }

    @Test
    void emitirVentaConProductoRepetidoFalla() {
        Empleado empleado = crearEmpleado("ventas_producto_repetido");
        Cliente cliente = crearCliente("70000004", "Cliente Producto Repetido");
        Producto producto = crearProducto("VENTA-REPETIDO", "20.00");
        inventarioService.inicializarProducto(producto, new BigDecimal("5"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));
        VentaRequestDTO request = ventaRequest(cliente.getId(), empleado.getId(), caja.getId(), producto.getId(), "1",
                "20.00");
        request.setDetalles(List.of(
                detalleRequest(producto.getId(), "1", "20.00"),
                detalleRequest(producto.getId(), "1", "20.00")));

        assertThatThrownBy(() -> ventaService.emitirVenta(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No se puede repetir el mismo producto");
    }

    @Test
    void emitirVentaCreditoFallaEnAlcanceInicial() {
        Empleado empleado = crearEmpleado("ventas_credito");
        Cliente cliente = crearCliente("70000005", "Cliente Credito");
        Producto producto = crearProducto("VENTA-CREDITO", "20.00");
        inventarioService.inicializarProducto(producto, new BigDecimal("5"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));
        VentaRequestDTO request = ventaRequest(cliente.getId(), empleado.getId(), caja.getId(), producto.getId(), "1",
                "20.00");
        request.setFormaPago(FormaPagoVenta.CREDITO);

        assertThatThrownBy(() -> ventaService.emitirVenta(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ventas a credito");
    }

    @Test
    void emitirVentaSinNumeroComprobanteGeneraNumeroInterno() {
        Empleado empleado = crearEmpleado("ventas_numero_interno");
        Cliente cliente = crearCliente("70000006", "Cliente Numero Interno");
        Producto producto = crearProducto("VENTA-NUMERO-INTERNO", "30.00");
        inventarioService.inicializarProducto(producto, new BigDecimal("5"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));

        VentaResponseDTO venta = ventaService.emitirVenta(ventaRequest(
                cliente.getId(),
                empleado.getId(),
                caja.getId(),
                producto.getId(),
                "1",
                "30.00"));

        assertThat(venta.getNumeroComprobante()).matches("V-\\d{8}");
    }

    @Test
    void emitirVentaConTipoComprobanteGeneraNumeroEIncrementaCorrelativo() {
        Empleado empleado = crearEmpleado("ventas_tipo_comprobante");
        Cliente cliente = crearCliente("70000007", "Cliente Tipo Comprobante");
        Producto producto = crearProducto("VENTA-TIPO-COMPROBANTE", "40.00");
        inventarioService.inicializarProducto(producto, new BigDecimal("5"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));
        TipoComprobante tipoComprobante = tipoComprobanteRepository.save(TipoComprobante.builder()
                .nombre("Boleta")
                .serie("B001")
                .correlativoActual(41)
                .estado(1)
                .build());
        VentaRequestDTO request = ventaRequest(cliente.getId(), empleado.getId(), caja.getId(), producto.getId(), "1",
                "40.00");
        request.setTipoComprobanteId(tipoComprobante.getId());

        VentaResponseDTO venta = ventaService.emitirVenta(request);

        assertThat(venta.getNumeroComprobante()).isEqualTo("B001-00000042");
        assertThat(tipoComprobanteRepository.findById(tipoComprobante.getId()).orElseThrow().getCorrelativoActual())
                .isEqualTo(42);
    }

    @Test
    void emitirVentaConNumeroComprobanteManualLoPreservaSinIncrementarCorrelativo() {
        Empleado empleado = crearEmpleado("ventas_numero_manual");
        Cliente cliente = crearCliente("70000008", "Cliente Numero Manual");
        Producto producto = crearProducto("VENTA-NUMERO-MANUAL", "50.00");
        inventarioService.inicializarProducto(producto, new BigDecimal("5"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));
        TipoComprobante tipoComprobante = tipoComprobanteRepository.save(TipoComprobante.builder()
                .nombre("Factura")
                .serie("F001")
                .correlativoActual(10)
                .estado(1)
                .build());
        VentaRequestDTO request = ventaRequest(cliente.getId(), empleado.getId(), caja.getId(), producto.getId(), "1",
                "50.00");
        request.setTipoComprobanteId(tipoComprobante.getId());
        request.setNumeroComprobante(" MANUAL-123 ");

        VentaResponseDTO venta = ventaService.emitirVenta(request);

        assertThat(venta.getNumeroComprobante()).isEqualTo("MANUAL-123");
        assertThat(tipoComprobanteRepository.findById(tipoComprobante.getId()).orElseThrow().getCorrelativoActual())
                .isEqualTo(10);
    }

    private VentaRequestDTO ventaRequest(Long clienteId, Long empleadoId, Long cajaId, Long productoId,
            String cantidad, String precioUnitario) {
        VentaRequestDTO dto = new VentaRequestDTO();
        dto.setClienteId(clienteId);
        dto.setEmpleadoId(empleadoId);
        dto.setCajaId(cajaId);
        dto.setFormaPago(FormaPagoVenta.CONTADO);
        dto.setMedioPago(MedioPagoVenta.EFECTIVO);
        dto.setDetalles(List.of(detalleRequest(productoId, cantidad, precioUnitario)));
        return dto;
    }

    private VentaDetalleRequestDTO detalleRequest(Long productoId, String cantidad, String precioUnitario) {
        VentaDetalleRequestDTO detalle = new VentaDetalleRequestDTO();
        detalle.setProductoId(productoId);
        detalle.setCantidad(new BigDecimal(cantidad));
        detalle.setPrecioUnitario(new BigDecimal(precioUnitario));
        return detalle;
    }

    private AperturaCajaRequestDTO aperturaRequest(Long empleadoId, String montoInicial) {
        AperturaCajaRequestDTO dto = new AperturaCajaRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setMontoInicial(new BigDecimal(montoInicial));
        dto.setObservaciones("Apertura para ventas");
        return dto;
    }

    private CierreCajaRequestDTO cierreRequest(String montoReal) {
        CierreCajaRequestDTO dto = new CierreCajaRequestDTO();
        dto.setMontoReal(new BigDecimal(montoReal));
        dto.setObservaciones("Cierre para ventas");
        return dto;
    }

    private Cliente crearCliente(String documento, String nombre) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("DNI VENTA " + documento)
                .build());
        return clienteRepository.save(Cliente.builder()
                .tipoDocumento(tipoDocumento)
                .numeroDocumento(documento)
                .nombre(nombre)
                .apellidoPaterno("Prueba")
                .apellidoMaterno("Ventas")
                .direccion("Direccion cliente")
                .telefono("987654321")
                .correo("cliente" + documento + "@example.test")
                .estado(1)
                .build());
    }

    private Empleado crearEmpleado(String username) {
        Perfil perfil = perfilRepository.save(Perfil.builder()
                .nombre("PERFIL_" + username)
                .descripcion("Perfil de ventas")
                .estado(1)
                .build());

        return empleadoRepository.save(Empleado.builder()
                .nombre("Empleado")
                .username(username)
                .apellidoPaterno("Ventas")
                .apellidoMaterno("Prueba")
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

    private Producto crearProducto(String codigo, String precio) {
        Categoria categoria = categoriaRepository.save(Categoria.builder()
                .nombre("Categoria " + codigo)
                .estado(1)
                .build());
        Marca marca = marcaRepository.save(Marca.builder()
                .nombre("Marca " + codigo)
                .estado(1)
                .build());
        Unidad unidadVenta = unidadRepository.save(Unidad.builder()
                .nombre("UND VENTA " + codigo)
                .estado(1)
                .build());
        Unidad unidadCompra = unidadRepository.save(Unidad.builder()
                .nombre("UND COMPRA " + codigo)
                .estado(1)
                .build());

        return productoRepository.save(Producto.builder()
                .nombre("Producto " + codigo)
                .codigo(codigo)
                .descripcion("Producto para ventas")
                .precio(new BigDecimal(precio))
                .costo(new BigDecimal("8.00"))
                .stock(0)
                .stockMinimo(1)
                .tipoProducto(TipoProducto.ACCESORIO)
                .categoria(categoria)
                .marca(marca)
                .unidadVenta(unidadVenta)
                .unidadCompra(unidadCompra)
                .factorConversion(1)
                .estado(1)
                .build());
    }
}
