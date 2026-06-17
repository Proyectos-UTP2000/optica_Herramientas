package com.herramientas.optica.modules.productos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.dto.CategoriaRequestDTO;
import com.herramientas.optica.modules.productos.dto.MarcaRequestDTO;
import com.herramientas.optica.modules.productos.dto.UnidadRequestDTO;
import com.herramientas.optica.modules.productos.model.Categoria;
import com.herramientas.optica.modules.productos.model.Marca;
import com.herramientas.optica.modules.productos.model.TipoProducto;
import com.herramientas.optica.modules.productos.model.Unidad;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CatalogoBasicoServiceTest {

    @Autowired
    private MarcaService marcaService;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private UnidadService unidadService;

    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UnidadRepository unidadRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Test
    void crearMarcaConNombreBorradoReactivaRegistroExistente() {
        Marca borrada = marcaRepository.save(Marca.builder()
                .nombre("MARCA REACTIVABLE")
                .fecha(LocalDate.now())
                .estado(0)
                .build());

        var response = marcaService.crear(marcaRequest(" marca reactivable "));

        assertThat(response.getId()).isEqualTo(borrada.getId());
        assertThat(response.getEstado()).isEqualTo(1);
        assertThat(marcaRepository.findById(borrada.getId()).orElseThrow().getEstado()).isEqualTo(1);
    }

    @Test
    void crearMarcaConNombreEnDesusoFalla() {
        marcaRepository.save(Marca.builder().nombre("MARCA EN DESUSO").estado(2).build());

        assertThatThrownBy(() -> marcaService.crear(marcaRequest("marca en desuso")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ya existe");
    }

    @Test
    void crearCategoriaConNombreBorradoReactivaRegistroExistente() {
        Categoria borrada = categoriaRepository.save(Categoria.builder()
                .nombre("CATEGORIA REACTIVABLE")
                .estado(0)
                .build());

        var response = categoriaService.crear(categoriaRequest(" categoria reactivable "));

        assertThat(response.getId()).isEqualTo(borrada.getId());
        assertThat(response.getEstado()).isEqualTo(1);
    }

    @Test
    void crearCategoriaConNombreEnDesusoFalla() {
        categoriaRepository.save(Categoria.builder().nombre("CATEGORIA EN DESUSO").estado(2).build());

        assertThatThrownBy(() -> categoriaService.crear(categoriaRequest("categoria en desuso")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ya existe");
    }

    @Test
    void crearUnidadConNombreBorradoReactivaRegistroExistente() {
        Unidad borrada = unidadRepository.save(Unidad.builder()
                .nombre("UNIDAD REACTIVABLE")
                .estado(0)
                .build());

        var response = unidadService.crear(unidadRequest(" unidad reactivable "));

        assertThat(response.getId()).isEqualTo(borrada.getId());
        assertThat(response.getEstado()).isEqualTo(1);
    }

    @Test
    void crearUnidadConNombreEnDesusoFalla() {
        unidadRepository.save(Unidad.builder().nombre("UNIDAD EN DESUSO").estado(2).build());

        assertThatThrownBy(() -> unidadService.crear(unidadRequest("unidad en desuso")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ya está registrada");
    }


    @Test
    void migrarProductosDeMarcaADestinoActivoYDesactivaOrigen() {
        Categoria categoria = categoriaRepository.save(Categoria.builder().nombre("CAT MIGRA MARCA").estado(1).build());
        Marca origen = marcaRepository.save(Marca.builder().nombre("MARCA ORIGEN MIGRA").estado(1).build());
        Marca destino = marcaRepository.save(Marca.builder().nombre("MARCA DESTINO MIGRA").estado(1).build());
        Unidad unidad = unidadRepository.save(Unidad.builder().nombre("UND MIGRA MARCA").estado(1).build());
        Producto producto = productoRepository.save(producto("PRODUCTO MIGRA MARCA", categoria, origen, unidad));

        var response = marcaService.migrarProductosYDesactivar(origen.getId(), destino.getId());

        assertThat(response.getEstado()).isEqualTo(2);
        assertThat(productoRepository.findById(producto.getId()).orElseThrow().getMarca().getId()).isEqualTo(destino.getId());
    }

    @Test
    void marcarCategoriaEnDesusoNoMigraProductos() {
        Categoria categoria = categoriaRepository.save(Categoria.builder().nombre("CAT SOLO DESUSO").estado(1).build());
        Marca marca = marcaRepository.save(Marca.builder().nombre("MARCA CAT DESUSO").estado(1).build());
        Unidad unidad = unidadRepository.save(Unidad.builder().nombre("UND CAT DESUSO").estado(1).build());
        Producto producto = productoRepository.save(producto("PRODUCTO CAT DESUSO", categoria, marca, unidad));

        var response = categoriaService.marcarEnDesuso(categoria.getId());

        assertThat(response.getEstado()).isEqualTo(2);
        assertThat(productoRepository.findById(producto.getId()).orElseThrow().getCategoria().getId()).isEqualTo(categoria.getId());
    }

    @Test
    void migrarCategoriaRechazaDestinoEliminado() {
        Categoria origen = categoriaRepository.save(Categoria.builder().nombre("CAT ORIGEN RECHAZA").estado(1).build());
        Categoria destino = categoriaRepository.save(Categoria.builder().nombre("CAT DESTINO BORRADA").estado(0).build());

        assertThatThrownBy(() -> categoriaService.migrarProductosYDesactivar(origen.getId(), destino.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("destino debe estar activa");
    }

    @Test
    void listarMarcasGestionIncluyeCantidadProductosActivosRelacionados() {
        Categoria categoria = categoriaRepository.save(Categoria.builder().nombre("CAT CONTEO MARCA").estado(1).build());
        Marca marca = marcaRepository.save(Marca.builder().nombre("MARCA CONTEO").estado(1).build());
        Unidad unidad = unidadRepository.save(Unidad.builder().nombre("UND CONTEO MARCA").estado(1).build());
        productoRepository.save(producto("PRODUCTO MARCA ACTIVO", categoria, marca, unidad));
        Producto borrado = producto("PRODUCTO MARCA BORRADO", categoria, marca, unidad);
        borrado.setEstado(0);
        productoRepository.save(borrado);

        var response = marcaService.listarGestion().stream()
                .filter(item -> item.getId().equals(marca.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(response.getCantidadProductosRelacionados()).isEqualTo(1);
    }

    @Test
    void listarCategoriasGestionIncluyeCantidadProductosActivosRelacionados() {
        Categoria categoria = categoriaRepository.save(Categoria.builder().nombre("CAT CONTEO").estado(1).build());
        Marca marca = marcaRepository.save(Marca.builder().nombre("MARCA CONTEO CAT").estado(1).build());
        Unidad unidad = unidadRepository.save(Unidad.builder().nombre("UND CONTEO CAT").estado(1).build());
        productoRepository.save(producto("PRODUCTO CAT ACTIVO", categoria, marca, unidad));
        Producto borrado = producto("PRODUCTO CAT BORRADO", categoria, marca, unidad);
        borrado.setEstado(0);
        productoRepository.save(borrado);

        var response = categoriaService.listarGestion().stream()
                .filter(item -> item.getId().equals(categoria.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(response.getCantidadProductosRelacionados()).isEqualTo(1);
    }

    @Test
    void listarUnidadesGestionCuentaCompraOVentaExcluyendoProductosBorrados() {
        Categoria categoria = categoriaRepository.save(Categoria.builder().nombre("CAT CONTEO UND").estado(1).build());
        Marca marca = marcaRepository.save(Marca.builder().nombre("MARCA CONTEO UND").estado(1).build());
        Unidad unidad = unidadRepository.save(Unidad.builder().nombre("UND CONTEO").estado(1).build());
        Unidad otraUnidad = unidadRepository.save(Unidad.builder().nombre("UND CONTEO OTRA").estado(1).build());

        Producto productoVenta = producto("PRODUCTO UND VENTA", categoria, marca, unidad);
        productoVenta.setUnidadCompra(otraUnidad);
        productoRepository.save(productoVenta);

        Producto productoCompra = producto("PRODUCTO UND COMPRA", categoria, marca, otraUnidad);
        productoCompra.setUnidadCompra(unidad);
        productoRepository.save(productoCompra);

        productoRepository.save(producto("PRODUCTO UND MISMA COMPRA VENTA", categoria, marca, unidad));

        Producto borradoConUnidadVenta = producto("PRODUCTO UND BORRADO", categoria, marca, unidad);
        borradoConUnidadVenta.setUnidadCompra(otraUnidad);
        borradoConUnidadVenta.setEstado(0);
        productoRepository.save(borradoConUnidadVenta);

        var response = unidadService.listarGestion().stream()
                .filter(item -> item.getId().equals(unidad.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(response.getCantidadProductosRelacionados()).isEqualTo(3);
    }

    private MarcaRequestDTO marcaRequest(String nombre) {
        MarcaRequestDTO dto = new MarcaRequestDTO();
        dto.setNombre(nombre);
        dto.setFecha(LocalDate.now());
        return dto;
    }

    private CategoriaRequestDTO categoriaRequest(String nombre) {
        CategoriaRequestDTO dto = new CategoriaRequestDTO();
        dto.setNombre(nombre);
        return dto;
    }

    private UnidadRequestDTO unidadRequest(String nombre) {
        UnidadRequestDTO dto = new UnidadRequestDTO();
        dto.setNombre(nombre);
        return dto;
    }
    private Producto producto(String nombre, Categoria categoria, Marca marca, Unidad unidad) {
        return Producto.builder()
                .nombre(nombre)
                .codigo(nombre.replace(" ", "-") + System.nanoTime())
                .modelo("MODELO")
                .descripcion("Producto para migracion")
                .precio(new BigDecimal("10.00"))
                .costo(new BigDecimal("5.00"))
                .stock(1)
                .stockMinimo(1)
                .estado(1)
                .tipoProducto(TipoProducto.ACCESORIO)
                .categoria(categoria)
                .marca(marca)
                .unidadVenta(unidad)
                .unidadCompra(unidad)
                .factorConversion(1)
                .build();
    }

}
