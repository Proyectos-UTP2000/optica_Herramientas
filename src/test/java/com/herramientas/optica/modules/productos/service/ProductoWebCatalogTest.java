package com.herramientas.optica.modules.productos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.dto.ProductoRequestDTO;
import com.herramientas.optica.modules.productos.dto.ProductoResponseDTO;
import com.herramientas.optica.modules.productos.dto.ProductoPublicResponseDTO;
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
class ProductoWebCatalogTest {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired
    private UnidadRepository unidadRepository;

    @Test
    void crearProductoGeneraSlugAutomaticoYCamposWeb() throws Exception {
        Categoria cat = crearCategoriaMock();
        Marca mar = crearMarcaMock();
        Unidad uni = crearUnidadMock();

        ProductoRequestDTO req = productoRequest(
                "Lentes Antireflex Premium Súper",
                "SLUG-1",
                cat.getId(),
                mar.getId(),
                uni.getId(),
                uni.getId()
        );
        req.setVisibleWeb(true);
        req.setDestacado(true);
        req.setDescripcionWeb("Gran lente comercial");
        req.setEtiquetas("premium, uv400, filtro-azul");
        req.setOrden(5);

        ProductoResponseDTO creado = productoService.crear(req, null);

        assertThat(creado.getSlug()).isEqualTo("lentes-antireflex-premium-super");
        assertThat(creado.getVisibleWeb()).isTrue();
        assertThat(creado.getDestacado()).isTrue();
        assertThat(creado.getDescripcionWeb()).isEqualTo("Gran lente comercial");
        assertThat(creado.getEtiquetas()).isEqualTo("premium, uv400, filtro-azul");
        assertThat(creado.getOrden()).isEqualTo(5);
    }

    @Test
    void crearProductoGeneraSlugUnicoSiDuplicado() throws Exception {
        Categoria cat = crearCategoriaMock();
        Marca mar = crearMarcaMock();
        Unidad uni = crearUnidadMock();

        ProductoRequestDTO req1 = productoRequest("Gafas Sol", "SOL-1", cat.getId(), mar.getId(), uni.getId(), uni.getId());
        ProductoResponseDTO p1 = productoService.crear(req1, null);

        ProductoRequestDTO req2 = productoRequest("Gafas Sol", "SOL-2", cat.getId(), mar.getId(), uni.getId(), uni.getId());
        ProductoResponseDTO p2 = productoService.crear(req2, null);

        assertThat(p1.getSlug()).isEqualTo("gafas-sol");
        assertThat(p2.getSlug()).isEqualTo("gafas-sol-1");
    }

    @Test
    void listarPublicosRetornaSoloProductosVisiblesWeb() throws Exception {
        Categoria cat = crearCategoriaMock();
        Marca mar = crearMarcaMock();
        Unidad uni = crearUnidadMock();

        // Producto visible
        ProductoRequestDTO req1 = productoRequest("Visible Web 1", "VIS-1", cat.getId(), mar.getId(), uni.getId(), uni.getId());
        req1.setVisibleWeb(true);
        req1.setOrden(10);
        productoService.crear(req1, null);

        // Producto no visible
        ProductoRequestDTO req2 = productoRequest("Oculto Web 2", "OCU-2", cat.getId(), mar.getId(), uni.getId(), uni.getId());
        req2.setVisibleWeb(false);
        productoService.crear(req2, null);

        List<ProductoPublicResponseDTO> publicos = productoService.listarPublicos();

        assertThat(publicos).hasSize(1);
        assertThat(publicos.get(0).getNombre()).isEqualTo("VISIBLE WEB 1");
        assertThat(publicos.get(0).getOrden()).isEqualTo(10);
        assertThat(publicos.get(0).getConStock()).isFalse(); // stock inicial 0
    }

    @Test
    void buscarPorSlugYFallasSiNoExiste() throws Exception {
        Categoria cat = crearCategoriaMock();
        Marca mar = crearMarcaMock();
        Unidad uni = crearUnidadMock();

        ProductoRequestDTO req = productoRequest("Buscado Por Slug", "BUSC-1", cat.getId(), mar.getId(), uni.getId(), uni.getId());
        req.setVisibleWeb(true);
        productoService.crear(req, null);

        ProductoPublicResponseDTO dto = productoService.buscarPorSlug("buscado-por-slug");
        assertThat(dto).isNotNull();
        assertThat(dto.getNombre()).isEqualTo("BUSCADO POR SLUG");

        assertThatThrownBy(() -> productoService.buscarPorSlug("slug-inexistente"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Producto no encontrado con el slug");
    }

    private Categoria crearCategoriaMock() {
        return categoriaRepository.save(Categoria.builder().nombre("Cat Mock " + System.nanoTime()).estado(1).build());
    }

    private Marca crearMarcaMock() {
        return marcaRepository.save(Marca.builder().nombre("Marca Mock " + System.nanoTime()).estado(1).build());
    }

    private Unidad crearUnidadMock() {
        return unidadRepository.save(Unidad.builder().nombre("Und Mock " + System.nanoTime()).estado(1).build());
    }

    private ProductoRequestDTO productoRequest(String nombre, String codigo, Long categoriaId, Long marcaId,
            Integer unidadVentaId, Integer unidadCompraId) {
        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setNombre(nombre);
        dto.setCodigo(codigo);
        dto.setModelo("Modelo Web");
        dto.setDescripcion("Producto para catálogo");
        dto.setPrecio(new BigDecimal("120.00"));
        dto.setCosto(new BigDecimal("60.00"));
        dto.setStockInicial(0);
        dto.setStockMinimo(1);
        dto.setTipoProducto(TipoProducto.ARMAZON);
        dto.setIdCategoria(categoriaId);
        dto.setIdMarca(marcaId);
        dto.setIdUnidadVenta(unidadVentaId);
        dto.setIdUnidadCompra(unidadCompraId);
        dto.setFactorConversion(1);
        return dto;
    }
}
