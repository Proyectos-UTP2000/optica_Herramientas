package com.herramientas.optica.modules.compras.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.caja.dto.AperturaCajaRequestDTO;
import com.herramientas.optica.modules.caja.dto.CajaResponseDTO;
import com.herramientas.optica.modules.caja.model.MetodoPagoCaja;
import com.herramientas.optica.modules.caja.model.OrigenMovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;
import com.herramientas.optica.modules.caja.repository.MovimientoCajaRepository;
import com.herramientas.optica.modules.caja.service.CajaService;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.compras.dto.CompraDetalleRequestDTO;
import com.herramientas.optica.modules.compras.dto.CompraRequestDTO;
import com.herramientas.optica.modules.compras.dto.CompraResponseDTO;
import com.herramientas.optica.modules.compras.model.EstadoCompra;
import com.herramientas.optica.modules.compras.model.FormaPagoCompra;
import com.herramientas.optica.modules.compras.model.MedioPagoCompra;
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
import com.herramientas.optica.modules.proveedores.model.Proveedor;
import com.herramientas.optica.modules.proveedores.repository.ProveedorRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CompraServiceTest {

    @Autowired
    private CompraService compraService;

    @Autowired
    private CajaService cajaService;

    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private MovimientoCajaRepository movimientoCajaRepository;

    @Autowired
    private MovimientoInventarioRepository movimientoInventarioRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

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

    @Test
    void registrarCompraContadoCreaDetalleEntradaInventarioYEgresoCaja() {
        Empleado empleado = crearEmpleado("compras_contado");
        Proveedor proveedor = crearProveedor("20600000001", "Proveedor Compra Contado");
        Producto producto = crearProducto("COMPRA-CONTADO", 12);
        inventarioService.inicializarProducto(producto, BigDecimal.ZERO, 1);
        CajaResponseDTO caja = cajaService.abrirCaja(aperturaRequest(empleado.getId(), "500.00"));

        CompraResponseDTO compra = compraService.registrarCompra(compraRequest(
                proveedor.getId(),
                empleado.getId(),
                caja.getId(),
                producto.getId(),
                "3",
                "10.50"));

        assertThat(compra.getId()).isNotNull();
        assertThat(compra.getEstado()).isEqualTo(EstadoCompra.REGISTRADA);
        assertThat(compra.getFormaPago()).isEqualTo(FormaPagoCompra.CONTADO);
        assertThat(compra.getMedioPago()).isEqualTo(MedioPagoCompra.EFECTIVO);
        assertThat(compra.getSubtotal()).isEqualByComparingTo("31.50");
        assertThat(compra.getTotal()).isEqualByComparingTo("31.50");
        assertThat(compra.getDetalles()).hasSize(1).first().satisfies(detalle -> {
            assertThat(detalle.getProductoId()).isEqualTo(producto.getId());
            assertThat(detalle.getCantidadCompra()).isEqualByComparingTo("3.000");
            assertThat(detalle.getFactorConversionAplicado()).isEqualTo(12);
            assertThat(detalle.getCantidadInventario()).isEqualByComparingTo("36.000");
            assertThat(detalle.getCostoUnitario()).isEqualByComparingTo("10.50");
            assertThat(detalle.getSubtotal()).isEqualByComparingTo("31.50");
        });

        assertThat(productoRepository.findById(producto.getId()).orElseThrow().getStock()).isEqualTo(36);
        assertThat(movimientoInventarioRepository.findByProductoIdOrderByFechaAsc(producto.getId()))
                .filteredOn(mov -> mov.getReferenciaTipo() == ReferenciaInventario.COMPRA)
                .hasSize(1)
                .first()
                .satisfies(mov -> {
                    assertThat(mov.getReferenciaId()).isEqualTo(compra.getId());
                    assertThat(mov.getStockNuevo()).isEqualByComparingTo("36.000");
                });
        assertThat(movimientoCajaRepository.findByCajaIdOrderByFechaAsc(caja.getId()))
                .hasSize(1)
                .first()
                .satisfies(mov -> {
                    assertThat(mov.getTipo()).isEqualTo(TipoMovimientoCaja.EGRESO);
                    assertThat(mov.getOrigen()).isEqualTo(OrigenMovimientoCaja.COMPRA);
                    assertThat(mov.getMetodoPago()).isEqualTo(MetodoPagoCaja.EFECTIVO);
                    assertThat(mov.getMonto()).isEqualByComparingTo("31.50");
                    assertThat(mov.getReferenciaTipo()).isEqualTo("COMPRA");
                    assertThat(mov.getReferenciaId()).isEqualTo(compra.getId());
                });
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

    private AperturaCajaRequestDTO aperturaRequest(Long empleadoId, String montoInicial) {
        AperturaCajaRequestDTO dto = new AperturaCajaRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setMontoInicial(new BigDecimal(montoInicial));
        dto.setObservaciones("Apertura para compras");
        return dto;
    }

    private Proveedor crearProveedor(String documento, String razonSocial) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("RUC COMPRA " + documento)
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
                .descripcion("Perfil de compras")
                .estado(1)
                .build());

        return empleadoRepository.save(Empleado.builder()
                .nombre("Empleado")
                .username(username)
                .apellidoPaterno("Compras")
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
                .descripcion("Producto para compras")
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
