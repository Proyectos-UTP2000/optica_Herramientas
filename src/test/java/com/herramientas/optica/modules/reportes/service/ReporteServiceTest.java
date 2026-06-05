package com.herramientas.optica.modules.reportes.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.caja.dto.AperturaCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.CajaResponseDTO;
import com.herramientas.optica.modules.caja.service.CajaService;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.compras.dto.CompraDetalleRequestDTO;
import com.herramientas.optica.modules.compras.dto.CompraRequestDTO;
import com.herramientas.optica.modules.compras.dto.CompraResponseDTO;
import com.herramientas.optica.modules.compras.model.FormaPagoCompra;
import com.herramientas.optica.modules.compras.model.MedioPagoCompra;
import com.herramientas.optica.modules.compras.service.CompraService;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;
import com.herramientas.optica.modules.inventario.dto.AjusteInventarioRequestDTO;
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
import com.herramientas.optica.modules.proveedores.model.Proveedor;
import com.herramientas.optica.modules.proveedores.repository.ProveedorRepository;
import com.herramientas.optica.modules.reportes.dto.ReporteCompraProveedorResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteCajaDetalleResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteCajaResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteKardexResponseDTO;
import com.herramientas.optica.modules.reportes.dto.ReporteVentaFechaResponseDTO;
import com.herramientas.optica.modules.ventas.dto.VentaDetalleRequestDTO;
import com.herramientas.optica.modules.ventas.dto.VentaRequestDTO;
import com.herramientas.optica.modules.ventas.model.FormaPagoVenta;
import com.herramientas.optica.modules.ventas.model.MedioPagoVenta;
import com.herramientas.optica.modules.ventas.service.VentaService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ReporteServiceTest {

    @Autowired
    private ReporteService reporteService;

    @Autowired
    private VentaService ventaService;

    @Autowired
    private CompraService compraService;

    @Autowired
    private CajaService cajaService;

    @Autowired
    private InventarioService inventarioService;

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
    private ProveedorRepository proveedorRepository;

    @Test
    void reporteVentasPorFechaCalculaTotalesDelRango() {
        Empleado empleado = crearEmpleado("reporte_ventas");
        Cliente cliente = crearCliente("71000001", "Cliente Reporte Ventas");
        Producto producto = crearProducto("REP-VENTAS", 1);
        inventarioService.inicializarProducto(producto, new BigDecimal("10"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));
        ventaService.emitirVenta(ventaRequest(cliente.getId(), empleado.getId(), caja.getId(), producto.getId(),
                "2", "35.00"));

        ReporteVentaFechaResponseDTO reporte = reporteService.obtenerVentas(
                LocalDate.now(), LocalDate.now(), empleado.getId(), "Cliente Reporte", producto.getNombre(),
                null, null);

        assertThat(reporte.getCantidadVentas()).isEqualTo(1);
        assertThat(reporte.getTotalVentas()).isEqualByComparingTo("70.00");
        assertThat(reporte.getVentas()).hasSize(1).first().satisfies(venta -> {
            assertThat(venta.getClienteNombre()).contains("Cliente Reporte Ventas");
            assertThat(venta.getTotal()).isEqualByComparingTo("70.00");
            assertThat(venta.getMedioPago()).isEqualTo(MedioPagoVenta.EFECTIVO);
        });
    }

    @Test
    void reporteVentasFiltraPorNumeroDeVentaYExcluyeProductosSinCoincidencia() {
        Empleado empleado = crearEmpleado("reporte_ventas_numero");
        Cliente cliente = crearCliente("71000002", "Cliente Numero Venta");
        Producto producto = crearProducto("REP-VENTAS-NUMERO", 1);
        Producto productoExcluido = crearProducto("REP-VENTAS-OTRO", 1);
        inventarioService.inicializarProducto(producto, new BigDecimal("10"), 1);
        inventarioService.inicializarProducto(productoExcluido, new BigDecimal("10"), 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "100.00"));
        var ventaIncluida = ventaService.emitirVenta(ventaRequest(cliente.getId(), empleado.getId(), caja.getId(),
                producto.getId(), "1", "50.00"));
        ventaService.emitirVenta(ventaRequest(cliente.getId(), empleado.getId(), caja.getId(),
                productoExcluido.getId(), "1", "60.00"));

        ReporteVentaFechaResponseDTO reporte = reporteService.obtenerVentas(
                LocalDate.now(), LocalDate.now(), null, null, producto.getCodigo(), String.valueOf(ventaIncluida.getId()),
                null);

        assertThat(reporte.getCantidadVentas()).isEqualTo(1);
        assertThat(reporte.getVentas()).first().satisfies(venta -> {
            assertThat(venta.getVentaId()).isEqualTo(ventaIncluida.getId());
            assertThat(venta.getProductosResumen()).contains("Producto REP-VENTAS-NUMERO");
        });
    }

    @Test
    void reporteComprasPorProveedorFiltraProveedorYCalculaTotal() {
        Empleado empleado = crearEmpleado("reporte_compras");
        Proveedor proveedorIncluido = crearProveedor("20610000001", "Proveedor Incluido");
        Proveedor proveedorExcluido = crearProveedor("20610000002", "Proveedor Excluido");
        Producto productoIncluido = crearProducto("REP-COMPRA-INCLUIDA", 10);
        Producto productoExcluido = crearProducto("REP-COMPRA-EXCLUIDA", 10);
        inventarioService.inicializarProducto(productoIncluido, BigDecimal.ZERO, 1);
        inventarioService.inicializarProducto(productoExcluido, BigDecimal.ZERO, 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "500.00"));
        CompraResponseDTO compraIncluida = compraService.registrarCompra(compraRequest(
                proveedorIncluido.getId(), empleado.getId(), caja.getId(), productoIncluido.getId(), "3", "12.00"));
        compraService.registrarCompra(compraRequest(
                proveedorExcluido.getId(), empleado.getId(), caja.getId(), productoExcluido.getId(), "2", "20.00"));

        ReporteCompraProveedorResponseDTO reporte = reporteService.obtenerCompras(
                proveedorIncluido.getRazonSocial(), LocalDate.now(), LocalDate.now());

        assertThat(reporte.getCantidadCompras()).isEqualTo(1);
        assertThat(reporte.getTotalCompras()).isEqualByComparingTo("36.00");
        assertThat(reporte.getCompras()).hasSize(1).first().satisfies(compra -> {
            assertThat(compra.getCompraId()).isEqualTo(compraIncluida.getId());
            assertThat(compra.getProveedorNombre()).isEqualTo("Proveedor Incluido");
            assertThat(compra.getTotal()).isEqualByComparingTo("36.00");
        });
    }

    @Test
    void reporteCajasListaHistorialYDetalleDeMovimientos() {
        Empleado empleado = crearEmpleado("reporte_cajas");
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "200.00"));
        cajaService.registrarMovimiento(caja.getId(), movimientoManualRequest(empleado.getId()));
        cajaService.cerrarCaja(caja.getId(), cierreRequest("250.00"));

        ReporteCajaResponseDTO reporte = reporteService.obtenerCajas(LocalDate.now(), LocalDate.now(),
                empleado.getId(), null);
        ReporteCajaDetalleResponseDTO detalle = reporteService.obtenerDetalleCaja(caja.getId());

        assertThat(reporte.getCantidadCajas()).isEqualTo(1);
        assertThat(reporte.getCajas()).first().satisfies(item -> {
            assertThat(item.getCajaId()).isEqualTo(caja.getId());
            assertThat(item.getEmpleadoNombre()).contains("Empleado");
            assertThat(item.getTotalIngresos()).isEqualByComparingTo("50.00");
            assertThat(item.getEstado()).isEqualTo(com.herramientas.optica.modules.caja.model.EstadoCaja.CERRADA);
        });
        assertThat(detalle.getCaja().getId()).isEqualTo(caja.getId());
        assertThat(detalle.getMovimientos()).hasSize(1);
    }

    @Test
    void reporteKardexListaMovimientosDelProductoEnRango() {
        Empleado empleado = crearEmpleado("reporte_kardex");
        Producto producto = crearProducto("REP-KARDEX", 1);
        inventarioService.inicializarProducto(producto, new BigDecimal("5"), 1);
        inventarioService.ajustarStockPositivo(producto.getId(), ajusteRequest(empleado.getId(), "3",
                "Conteo fisico reporte"));

        ReporteKardexResponseDTO reporte = reporteService.obtenerKardex(producto.getId(), LocalDate.now(),
                LocalDate.now());

        assertThat(reporte.getProductoId()).isEqualTo(producto.getId());
        assertThat(reporte.getProductoNombre()).isEqualTo("Producto REP-KARDEX");
        assertThat(reporte.getMovimientos()).hasSize(2);
        assertThat(reporte.getStockFinal()).isEqualByComparingTo("8.000");
        assertThat(reporte.getMovimientos().get(1).getMotivo()).isEqualTo("Conteo fisico reporte");
    }

    private VentaRequestDTO ventaRequest(Long clienteId, Long empleadoId, Long cajaId, Long productoId,
            String cantidad, String precioUnitario) {
        VentaDetalleRequestDTO detalle = new VentaDetalleRequestDTO();
        detalle.setProductoId(productoId);
        detalle.setCantidad(new BigDecimal(cantidad));
        detalle.setPrecioUnitario(new BigDecimal(precioUnitario));

        VentaRequestDTO dto = new VentaRequestDTO();
        dto.setClienteId(clienteId);
        dto.setEmpleadoId(empleadoId);
        dto.setCajaId(cajaId);
        dto.setFormaPago(FormaPagoVenta.CONTADO);
        dto.setMedioPago(MedioPagoVenta.EFECTIVO);
        dto.setDetalles(List.of(detalle));
        return dto;
    }

    private CompraRequestDTO compraRequest(Long proveedorId, Long empleadoId, Long cajaId, Long productoId,
            String cantidad, String costoUnitario) {
        CompraDetalleRequestDTO detalle = new CompraDetalleRequestDTO();
        detalle.setProductoId(productoId);
        detalle.setCantidadCompra(new BigDecimal(cantidad));
        detalle.setCostoUnitario(new BigDecimal(costoUnitario));

        CompraRequestDTO dto = new CompraRequestDTO();
        dto.setProveedorId(proveedorId);
        dto.setEmpleadoId(empleadoId);
        dto.setCajaId(cajaId);
        dto.setFormaPago(FormaPagoCompra.CONTADO);
        dto.setMedioPago(MedioPagoCompra.EFECTIVO);
        dto.setDetalles(List.of(detalle));
        return dto;
    }

    private AjusteInventarioRequestDTO ajusteRequest(Long empleadoId, String cantidad, String motivo) {
        AjusteInventarioRequestDTO dto = new AjusteInventarioRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setCantidad(new BigDecimal(cantidad));
        dto.setMotivo(motivo);
        return dto;
    }

    private com.herramientas.optica.modules.caja.dto.MovimientoCajaRequestDTO movimientoManualRequest(Long empleadoId) {
        com.herramientas.optica.modules.caja.dto.MovimientoCajaRequestDTO dto =
                new com.herramientas.optica.modules.caja.dto.MovimientoCajaRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setTipo(com.herramientas.optica.modules.caja.model.TipoMovimientoCaja.INGRESO);
        dto.setOrigen(com.herramientas.optica.modules.caja.model.OrigenMovimientoCaja.AJUSTE);
        dto.setMetodoPago(com.herramientas.optica.modules.caja.model.MetodoPagoCaja.EFECTIVO);
        dto.setMonto(new BigDecimal("50.00"));
        dto.setDescripcion("Ajuste manual de reporte");
        dto.setReferenciaTipo("AJUSTE");
        return dto;
    }

    private com.herramientas.optica.modules.caja.dto.CierreCajaRequestDTO cierreRequest(String montoReal) {
        com.herramientas.optica.modules.caja.dto.CierreCajaRequestDTO dto =
                new com.herramientas.optica.modules.caja.dto.CierreCajaRequestDTO();
        dto.setMontoReal(new BigDecimal(montoReal));
        dto.setObservaciones("Cierre de reporte");
        return dto;
    }

    private AperturaCajaRequestDTO aperturaRequest(Long empleadoId, String montoInicial) {
        AperturaCajaRequestDTO dto = new AperturaCajaRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setMontoInicial(new BigDecimal(montoInicial));
        dto.setObservaciones("Apertura para reportes");
        return dto;
    }

    private Cliente crearCliente(String documento, String nombre) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("DNI REPORTE " + documento)
                .build());
        return clienteRepository.save(Cliente.builder()
                .tipoDocumento(tipoDocumento)
                .numeroDocumento(documento)
                .nombre(nombre)
                .apellidoPaterno("Prueba")
                .apellidoMaterno("Reporte")
                .direccion("Direccion cliente")
                .telefono("987654321")
                .correo("cliente" + documento + "@example.test")
                .estado(1)
                .build());
    }

    private Proveedor crearProveedor(String documento, String razonSocial) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("RUC REPORTE " + documento)
                .build());
        return proveedorRepository.save(Proveedor.builder()
                .tipoDocumento(tipoDocumento)
                .numeroDocumento(documento)
                .razonSocial(razonSocial)
                .nombreComercial(razonSocial)
                .direccion("Direccion proveedor")
                .telefono("987654321")
                .correo("proveedor" + documento + "@example.test")
                .estado(1)
                .build());
    }

    private Empleado crearEmpleado(String username) {
        Perfil perfil = perfilRepository.save(Perfil.builder()
                .nombre("PERFIL_" + username)
                .descripcion("Perfil de reportes")
                .estado(1)
                .build());

        return empleadoRepository.save(Empleado.builder()
                .nombre("Empleado")
                .username(username)
                .apellidoPaterno("Reportes")
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

    private Producto crearProducto(String codigo, int factorConversion) {
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
                .descripcion("Producto para reportes")
                .precio(new BigDecimal("20.00"))
                .costo(new BigDecimal("8.00"))
                .stock(0)
                .stockMinimo(1)
                .tipoProducto(TipoProducto.ACCESORIO)
                .categoria(categoria)
                .marca(marca)
                .unidadVenta(unidadVenta)
                .unidadCompra(unidadCompra)
                .factorConversion(factorConversion)
                .estado(1)
                .build());
    }
}
