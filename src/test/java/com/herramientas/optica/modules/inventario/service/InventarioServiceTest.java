package com.herramientas.optica.modules.inventario.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;
import com.herramientas.optica.modules.inventario.dto.AjusteInventarioRequestDTO;
import com.herramientas.optica.modules.inventario.dto.InventarioSaldoResponseDTO;
import com.herramientas.optica.modules.inventario.dto.MovimientoInventarioResponseDTO;
import com.herramientas.optica.modules.inventario.model.ReferenciaInventario;
import com.herramientas.optica.modules.inventario.model.TipoMovimientoInventario;
import com.herramientas.optica.modules.inventario.repository.MovimientoInventarioRepository;
import com.herramientas.optica.modules.productos.model.Categoria;
import com.herramientas.optica.modules.productos.model.Marca;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.model.TipoProducto;
import com.herramientas.optica.modules.productos.model.Unidad;
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class InventarioServiceTest {

    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private MovimientoInventarioRepository movimientoInventarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired
    private UnidadRepository unidadRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Test
    void inicializarProductoCreaSaldoYMovimientoDeEntrada() {
        Producto producto = crearProducto("INV-INICIAL", 1, 2);

        InventarioSaldoResponseDTO saldo = inventarioService.inicializarProducto(producto, new BigDecimal("7"), 1);

        assertThat(saldo.getProductoId()).isEqualTo(producto.getId());
        assertThat(saldo.getStockActual()).isEqualByComparingTo("7.000");
        assertThat(saldo.getStockMinimo()).isEqualByComparingTo("1.000");
        assertThat(productoRepository.findById(producto.getId()).orElseThrow().getStock()).isEqualTo(7);
        assertThat(movimientoInventarioRepository.findByProductoIdOrderByFechaAsc(producto.getId()))
                .hasSize(1)
                .first()
                .satisfies(mov -> {
                    assertThat(mov.getTipo()).isEqualTo(TipoMovimientoInventario.ENTRADA);
                    assertThat(mov.getReferenciaTipo()).isEqualTo(ReferenciaInventario.PRODUCTO_INICIAL);
                    assertThat(mov.getStockNuevo()).isEqualByComparingTo("7.000");
                });
    }

    @Test
    void entradaNormalizaCantidadDeCompraConFactorConversion() {
        Producto producto = crearProducto("INV-ENTRADA", 1, 12);
        inventarioService.inicializarProducto(producto, BigDecimal.ZERO, 1);

        MovimientoInventarioResponseDTO movimiento = inventarioService.registrarEntradaCompra(
                producto.getId(),
                new BigDecimal("3"),
                "Compra recibida",
                ReferenciaInventario.COMPRA,
                77L,
                null);

        assertThat(movimiento.getCantidad()).isEqualByComparingTo("36.000");
        assertThat(movimiento.getStockPrevio()).isEqualByComparingTo("0.000");
        assertThat(movimiento.getStockNuevo()).isEqualByComparingTo("36.000");
        assertThat(productoRepository.findById(producto.getId()).orElseThrow().getStock()).isEqualTo(36);
    }

    @Test
    void salidaCompraNormalizaCantidadYDescuentaSaldo() {
        Producto producto = crearProducto("INV-SALIDA-COMPRA", 1, 12);
        inventarioService.inicializarProducto(producto, new BigDecimal("48"), 1);

        MovimientoInventarioResponseDTO movimiento = inventarioService.registrarSalidaCompra(
                producto.getId(),
                new BigDecimal("2"),
                "Compra anulada",
                ReferenciaInventario.COMPRA,
                77L,
                null);

        assertThat(movimiento.getTipo()).isEqualTo(TipoMovimientoInventario.SALIDA);
        assertThat(movimiento.getCantidad()).isEqualByComparingTo("24.000");
        assertThat(movimiento.getStockPrevio()).isEqualByComparingTo("48.000");
        assertThat(movimiento.getStockNuevo()).isEqualByComparingTo("24.000");
        assertThat(productoRepository.findById(producto.getId()).orElseThrow().getStock()).isEqualTo(24);
    }

    @Test
    void salidaConStockSuficienteDescuentaSaldo() {
        Producto producto = crearProducto("INV-SALIDA", 1, 1);
        inventarioService.inicializarProducto(producto, new BigDecimal("10"), 1);

        MovimientoInventarioResponseDTO movimiento = inventarioService.registrarSalidaVenta(
                producto.getId(),
                new BigDecimal("4"),
                "Venta emitida",
                ReferenciaInventario.VENTA,
                90L,
                null);

        assertThat(movimiento.getTipo()).isEqualTo(TipoMovimientoInventario.SALIDA);
        assertThat(movimiento.getStockPrevio()).isEqualByComparingTo("10.000");
        assertThat(movimiento.getStockNuevo()).isEqualByComparingTo("6.000");
    }

    @Test
    void salidaSinStockSuficienteFalla() {
        Producto producto = crearProducto("INV-SIN-STOCK", 1, 1);
        inventarioService.inicializarProducto(producto, new BigDecimal("2"), 1);

        assertThatThrownBy(() -> inventarioService.registrarSalidaVenta(
                producto.getId(),
                new BigDecimal("3"),
                "Venta sin stock",
                ReferenciaInventario.VENTA,
                91L,
                null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Stock insuficiente");
    }

    @Test
    void actualizarStockMinimoNoCreaMovimientoDeInventario() {
        Producto producto = crearProducto("INV-MINIMO", 1, 1);
        inventarioService.inicializarProducto(producto, new BigDecimal("4"), 1);

        InventarioSaldoResponseDTO saldo = inventarioService.actualizarStockMinimoProducto(producto.getId(), 3);

        assertThat(saldo.getStockActual()).isEqualByComparingTo("4.000");
        assertThat(saldo.getStockMinimo()).isEqualByComparingTo("3.000");
        assertThat(movimientoInventarioRepository.findByProductoIdOrderByFechaAsc(producto.getId()))
                .hasSize(1)
                .first()
                .satisfies(mov -> assertThat(mov.getReferenciaTipo()).isEqualTo(ReferenciaInventario.PRODUCTO_INICIAL));
    }

    @Test
    void actualizarStockMinimoInicializaInventarioFaltanteDesdeProducto() {
        Producto producto = crearProducto("INV-MINIMO-LEGADO", 2, 1);
        producto.setStock(8);
        productoRepository.save(producto);

        InventarioSaldoResponseDTO saldo = inventarioService.actualizarStockMinimoProducto(producto.getId(), 5);

        assertThat(saldo.getStockActual()).isEqualByComparingTo("8.000");
        assertThat(saldo.getStockMinimo()).isEqualByComparingTo("5.000");
        assertThat(movimientoInventarioRepository.findByProductoIdOrderByFechaAsc(producto.getId()))
                .hasSize(1)
                .first()
                .satisfies(mov -> {
                    assertThat(mov.getReferenciaTipo()).isEqualTo(ReferenciaInventario.PRODUCTO_INICIAL);
                    assertThat(mov.getStockNuevo()).isEqualByComparingTo("8.000");
                });
    }

    @Test
    void ajusteManualPositivoRequiereMotivoYEmpleadoActivo() {
        Producto producto = crearProducto("INV-AJUSTE-POS", 1, 1);
        Empleado empleado = crearEmpleado("inventario_ajuste_pos");
        inventarioService.inicializarProducto(producto, BigDecimal.ZERO, 1);

        MovimientoInventarioResponseDTO movimiento = inventarioService.ajustarStockPositivo(
                producto.getId(),
                ajusteRequest(empleado.getId(), "5", "Conteo fisico sobrante"));

        assertThat(movimiento.getTipo()).isEqualTo(TipoMovimientoInventario.AJUSTE_POSITIVO);
        assertThat(movimiento.getEmpleadoId()).isEqualTo(empleado.getId());
        assertThat(movimiento.getStockNuevo()).isEqualByComparingTo("5.000");
    }

    @Test
    void ajusteManualNegativoNoPermiteDejarStockNegativo() {
        Producto producto = crearProducto("INV-AJUSTE-NEG", 1, 1);
        Empleado empleado = crearEmpleado("inventario_ajuste_neg");
        inventarioService.inicializarProducto(producto, new BigDecimal("2"), 1);

        assertThatThrownBy(() -> inventarioService.ajustarStockNegativo(
                producto.getId(),
                ajusteRequest(empleado.getId(), "3", "Conteo fisico faltante")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Stock insuficiente");
    }


    @Test
    void listarSaldosPriorizaProductosConCatalogosEnDesuso() {
        Producto normal = crearProducto("INV-LISTA-NORMAL", 1, 1);
        inventarioService.inicializarProducto(normal, BigDecimal.ZERO, 1);

        Producto revisar = crearProducto("INV-LISTA-REVISION", 1, 1);
        revisar.getCategoria().setEstado(2);
        revisar.getMarca().setEstado(2);
        categoriaRepository.save(revisar.getCategoria());
        marcaRepository.save(revisar.getMarca());
        inventarioService.inicializarProducto(revisar, BigDecimal.ZERO, 1);

        var saldos = inventarioService.listarSaldos();

        assertThat(saldos.get(0).getProductoId()).isEqualTo(revisar.getId());
        assertThat(saldos.get(0).getCategoriaEstado()).isEqualTo(2);
        assertThat(saldos.get(0).getMarcaEstado()).isEqualTo(2);
        assertThat(saldos.get(0).getRequiereRevisionCatalogo()).isTrue();
        assertThat(saldos).extracting(InventarioSaldoResponseDTO::getProductoId).contains(normal.getId());
    }

    private AjusteInventarioRequestDTO ajusteRequest(Long empleadoId, String cantidad, String motivo) {
        AjusteInventarioRequestDTO dto = new AjusteInventarioRequestDTO();
        dto.setEmpleadoId(empleadoId);
        dto.setCantidad(new BigDecimal(cantidad));
        dto.setMotivo(motivo);
        return dto;
    }

    private Producto crearProducto(String codigo, int stockMinimo, int factorConversion) {
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
                .descripcion("Producto para pruebas de inventario")
                .precio(new BigDecimal("20.00"))
                .costo(new BigDecimal("10.00"))
                .stock(0)
                .stockMinimo(stockMinimo)
                .tipoProducto(TipoProducto.ACCESORIO)
                .categoria(categoria)
                .marca(marca)
                .unidadVenta(unidadVenta)
                .unidadCompra(unidadCompra)
                .factorConversion(factorConversion)
                .estado(1)
                .build());
    }

    private Empleado crearEmpleado(String username) {
        Perfil perfil = perfilRepository.save(Perfil.builder()
                .nombre("PERFIL_" + username)
                .descripcion("Perfil de inventario")
                .estado(1)
                .build());

        return empleadoRepository.save(Empleado.builder()
                .nombre("Empleado")
                .username(username)
                .apellidoPaterno("Inventario")
                .apellidoMaterno("Prueba")
                .correo(username + "@example.test")
                .contrasena("secret")
                .telefono(String.format("%09d", Math.abs(username.hashCode()) % 1_000_000_000))
                .direccion("Direccion de prueba")
                .estado(1)
                .numeroDocumento(String.format("%08d", Math.abs((username + "doc").hashCode()) % 100_000_000))
                .perfil(perfil)
                .idTipoDocumento(1L)
                .build());
    }
}
