package com.herramientas.optica.modules.cotizaciones.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.cotizaciones.dto.CotizacionDTO;
import com.herramientas.optica.modules.cotizaciones.dto.CotizacionDetalleDTO;
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
class CotizacionServiceTest {

    @Autowired
    private CotizacionService cotizacionService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired
    private UnidadRepository unidadRepository;

    @Autowired
    private com.herramientas.optica.modules.clientes.repository.ClienteRepository clienteRepository;

    @Autowired
    private com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Producto crearMockProducto(String codigo, String precioStr) {
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
                .descripcion("Producto para pruebas de cotizaciones")
                .precio(new BigDecimal(precioStr))
                .costo(new BigDecimal("10.00"))
                .stock(10)
                .stockMinimo(1)
                .tipoProducto(TipoProducto.ACCESORIO)
                .categoria(categoria)
                .marca(marca)
                .unidadVenta(unidadVenta)
                .unidadCompra(unidadCompra)
                .factorConversion(1)
                .estado(1)
                .visibleWeb(true)
                .build());
    }

    @Test
    void crearCotizacionCalculaTotalesYRegistraDetalle() {
        Producto prod1 = crearMockProducto("PROD001", "120.00");
        Producto prod2 = crearMockProducto("PROD002", "50.50");

        CotizacionDTO request = CotizacionDTO.builder()
                .clienteNombre("Juan Pérez")
                .clienteDocumento("12345678")
                .clienteTelefono("999888777")
                .clienteCorreo("juan@perez.com")
                .observaciones("Entrega coordinar por la tarde")
                .detalles(List.of(
                        CotizacionDetalleDTO.builder()
                                .productoId(prod1.getId())
                                .cantidad(2)
                                .build(),
                        CotizacionDetalleDTO.builder()
                                .productoId(prod2.getId())
                                .cantidad(3)
                                .build()
                ))
                .build();

        CotizacionDTO response = cotizacionService.crearCotizacion(request);

        assertThat(response.getId()).isNotNull();
        assertThat(response.getClienteNombre()).isEqualTo("Juan Pérez");
        assertThat(response.getEstado()).isEqualTo("PENDIENTE");
        assertThat(response.getDetalles()).hasSize(2);

        // Validar calculo de total estimado
        // 2 * 120.00 + 3 * 50.50 = 240.00 + 151.50 = 391.50
        assertThat(response.getTotalEstimado()).isEqualByComparingTo("391.50");

        CotizacionDetalleDTO det1 = response.getDetalles().stream().filter(d -> d.getProductoId().equals(prod1.getId())).findFirst().orElseThrow();
        assertThat(det1.getPrecioLista()).isEqualByComparingTo("120.00");
        assertThat(det1.getSubtotal()).isEqualByComparingTo("240.00");
    }

    @Test
    void crearCotizacionConProductoNoExistenteFalla() {
        CotizacionDTO request = CotizacionDTO.builder()
                .clienteNombre("Pedro")
                .clienteTelefono("999999999")
                .detalles(List.of(
                        CotizacionDetalleDTO.builder()
                                .productoId(99999L)
                                .cantidad(1)
                                .build()
                ))
                .build();

        assertThatThrownBy(() -> cotizacionService.crearCotizacion(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Producto no encontrado");
    }

    @Test
    void crearCotizacionConProductoSinStockFalla() {
        Producto prod = crearMockProducto("PROD_SIN_STOCK", "10.00");
        prod.setStock(0);
        productoRepository.save(prod);

        CotizacionDTO request = CotizacionDTO.builder()
                .clienteNombre("Pedro")
                .clienteTelefono("999999999")
                .detalles(List.of(
                        CotizacionDetalleDTO.builder()
                                .productoId(prod.getId())
                                .cantidad(1)
                                .build()
                ))
                .build();

        assertThatThrownBy(() -> cotizacionService.crearCotizacion(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no está disponible o no tiene stock");
    }

    @Test
    void crearCotizacionConProductoNoVisibleFalla() {
        Producto prod = crearMockProducto("PROD_OCULTO", "10.00");
        prod.setVisibleWeb(false);
        productoRepository.save(prod);

        CotizacionDTO request = CotizacionDTO.builder()
                .clienteNombre("Pedro")
                .clienteTelefono("999999999")
                .detalles(List.of(
                        CotizacionDetalleDTO.builder()
                                .productoId(prod.getId())
                                .cantidad(1)
                                .build()
                ))
                .build();

        assertThatThrownBy(() -> cotizacionService.crearCotizacion(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no está disponible o no tiene stock");
    }

    @Test
    void obtenerCotizacionPorIdYActualizarEstado() {
        Producto prod = crearMockProducto("PROD003", "10.00");
        CotizacionDTO response = cotizacionService.crearCotizacion(CotizacionDTO.builder()
                .clienteNombre("Maria")
                .clienteTelefono("987654321")
                .detalles(List.of(
                        CotizacionDetalleDTO.builder()
                                .productoId(prod.getId())
                                .cantidad(5)
                                .build()
                ))
                .build());

        // Obtener por ID
        CotizacionDTO obtenida = cotizacionService.obtenerPorId(response.getId());
        assertThat(obtenida.getClienteNombre()).isEqualTo("Maria");
        assertThat(obtenida.getTotalEstimado()).isEqualByComparingTo("50.00");

        // Actualizar Estado
        CotizacionDTO actualizada = cotizacionService.actualizarEstado(response.getId(), "CONTACTADO");
        assertThat(actualizada.getEstado()).isEqualTo("CONTACTADO");

        // Listar todas
        List<CotizacionDTO> todas = cotizacionService.listarTodas();
        assertThat(todas).isNotEmpty();
        assertThat(todas.get(0).getId()).isEqualTo(response.getId());
    }

    @Test
    void crearCotizacionConNuevoDocumentoCreaClienteAutomatico() {
        if (!tipoDocumentoRepository.existsById(1L)) {
            jdbcTemplate.update(
                    "INSERT INTO tipo_documento (id_tipodocumento, tipodoc_nombre, tipodoc_estado) VALUES (?, ?, ?)",
                    1L, "DNI", 1);
        }

        Producto prod = crearMockProducto("PROD_AUTO_CLI", "50.00");
        String nuevoDni = "99887766";

        // El cliente no debe existir
        assertThat(clienteRepository.findByNumeroDocumento(nuevoDni)).isEmpty();

        CotizacionDTO request = CotizacionDTO.builder()
                .clienteNombre("GOMEZ PEREZ CARLOS")
                .clienteDocumento(nuevoDni)
                .clienteTelefono("987654321")
                .clienteCorreo("carlos@gomez.com")
                .direccion("Av. Progreso 123")
                .detalles(List.of(
                        CotizacionDetalleDTO.builder()
                                .productoId(prod.getId())
                                .cantidad(1)
                                .build()
                ))
                .build();

        CotizacionDTO response = cotizacionService.crearCotizacion(request);

        // Debe haberse creado el cliente
        var optCliente = clienteRepository.findByNumeroDocumento(nuevoDni);
        assertThat(optCliente).isPresent();

        com.herramientas.optica.modules.clientes.model.Cliente cliente = optCliente.get();
        assertThat(cliente.getNumeroDocumento()).isEqualTo(nuevoDni);
        assertThat(cliente.getCorreo()).isEqualTo("carlos@gomez.com");

        // Y el link debe estar configurado
        assertThat(response.getClienteUsuarioId()).isEqualTo(cliente.getId());
    }
}
