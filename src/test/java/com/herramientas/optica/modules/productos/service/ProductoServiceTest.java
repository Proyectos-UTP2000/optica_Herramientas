package com.herramientas.optica.modules.productos.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.inventario.service.InventarioService;
import com.herramientas.optica.modules.productos.dto.ProductoRequestDTO;
import com.herramientas.optica.modules.productos.dto.ProductoResponseDTO;
import com.herramientas.optica.modules.productos.model.Categoria;
import com.herramientas.optica.modules.productos.model.Marca;
import com.herramientas.optica.modules.productos.model.TipoProducto;
import com.herramientas.optica.modules.productos.model.Unidad;
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProductoServiceTest {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired
    private UnidadRepository unidadRepository;

    @Test
    void actualizarProductoSincronizaStockMinimoConInventario() throws Exception {
        Categoria categoria = categoriaRepository.save(Categoria.builder()
                .nombre("Categoria producto actualiza minimo")
                .estado(1)
                .build());
        Marca marca = marcaRepository.save(Marca.builder()
                .nombre("Marca producto actualiza minimo")
                .estado(1)
                .build());
        Unidad unidadVenta = unidadRepository.save(Unidad.builder()
                .nombre("UND VENTA PRODUCTO MINIMO")
                .estado(1)
                .build());
        Unidad unidadCompra = unidadRepository.save(Unidad.builder()
                .nombre("UND COMPRA PRODUCTO MINIMO")
                .estado(1)
                .build());

        ProductoRequestDTO crear = productoRequest(
                "Producto minimo inicial",
                "PROD-MIN-001",
                categoria.getId(),
                marca.getId(),
                unidadVenta.getId(),
                unidadCompra.getId(),
                2,
                1);
        ProductoResponseDTO creado = productoService.crear(crear, null);

        ProductoRequestDTO actualizar = productoRequest(
                "Producto minimo actualizado",
                "PROD-MIN-001",
                categoria.getId(),
                marca.getId(),
                unidadVenta.getId(),
                unidadCompra.getId(),
                6,
                1);
        productoService.actualizar(creado.getId(), actualizar, null);

        assertThat(inventarioService.obtenerSaldoPorProducto(creado.getId()).getStockMinimo())
                .isEqualByComparingTo("6.000");
    }


    @Test
    void listarTodosPriorizaProductosConCatalogosEnDesuso() throws Exception {
        Categoria categoriaActiva = categoriaRepository.save(Categoria.builder()
                .nombre("Categoria producto activa lista")
                .estado(1)
                .build());
        Categoria categoriaEnDesuso = categoriaRepository.save(Categoria.builder()
                .nombre("Categoria producto desuso lista")
                .estado(2)
                .build());
        Marca marcaActiva = marcaRepository.save(Marca.builder()
                .nombre("Marca producto activa lista")
                .estado(1)
                .build());
        Marca marcaEnDesuso = marcaRepository.save(Marca.builder()
                .nombre("Marca producto desuso lista")
                .estado(2)
                .build());
        Unidad unidad = unidadRepository.save(Unidad.builder()
                .nombre("UND PRODUCTO LISTA DESUSO")
                .estado(1)
                .build());

        ProductoResponseDTO normal = productoService.crear(productoRequest(
                "Producto normal listado",
                "PROD-LISTA-NORMAL",
                categoriaActiva.getId(),
                marcaActiva.getId(),
                unidad.getId(),
                unidad.getId(),
                2,
                1), null);
        ProductoResponseDTO revisar = productoService.crear(productoRequest(
                "Producto revisar listado",
                "PROD-LISTA-REVISAR",
                categoriaEnDesuso.getId(),
                marcaEnDesuso.getId(),
                unidad.getId(),
                unidad.getId(),
                2,
                1), null);

        var productos = productoService.listarTodos();

        assertThat(productos.get(0).getId()).isEqualTo(revisar.getId());
        assertThat(productos.get(0).getCategoriaEstado()).isEqualTo(2);
        assertThat(productos.get(0).getMarcaEstado()).isEqualTo(2);
        assertThat(productos).extracting(ProductoResponseDTO::getId).contains(normal.getId());
    }

    private ProductoRequestDTO productoRequest(String nombre, String codigo, Long categoriaId, Long marcaId,
            Integer unidadVentaId, Integer unidadCompraId, Integer stockMinimo, Integer factorConversion) {
        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setNombre(nombre);
        dto.setCodigo(codigo);
        dto.setModelo("Modelo test");
        dto.setDescripcion("Producto para prueba de sincronizacion");
        dto.setPrecio(new BigDecimal("20.00"));
        dto.setCosto(new BigDecimal("10.00"));
        dto.setStockInicial(5);
        dto.setStockMinimo(stockMinimo);
        dto.setTipoProducto(TipoProducto.ACCESORIO);
        dto.setIdCategoria(categoriaId);
        dto.setIdMarca(marcaId);
        dto.setIdUnidadVenta(unidadVentaId);
        dto.setIdUnidadCompra(unidadCompraId);
        dto.setFactorConversion(factorConversion);
        return dto;
    }
}
