package com.herramientas.optica.modules.productos.service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.model.Categoria;
import com.herramientas.optica.modules.productos.model.Etiqueta;
import com.herramientas.optica.modules.productos.model.Marca;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.model.TipoProducto;
import com.herramientas.optica.modules.productos.model.Unidad;
import com.herramientas.optica.modules.productos.repository.CategoriaRepository;
import com.herramientas.optica.modules.productos.repository.EtiquetaRepository;
import com.herramientas.optica.modules.productos.repository.MarcaRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.productos.repository.UnidadRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(2)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class ProductoDataLoader implements ApplicationRunner {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;
    private final UnidadRepository unidadRepository;
    private final EtiquetaRepository etiquetaRepository;

    public ProductoDataLoader(ProductoRepository productoRepository,
                              CategoriaRepository categoriaRepository,
                              MarcaRepository marcaRepository,
                              UnidadRepository unidadRepository,
                              EtiquetaRepository etiquetaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.marcaRepository = marcaRepository;
        this.unidadRepository = unidadRepository;
        this.etiquetaRepository = etiquetaRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (productoRepository.count() == 0) {
            Categoria monturas = categoriaRepository.findByNombre("Monturas")
                .orElseThrow(() -> new IllegalStateException("Categoria Monturas no encontrada"));
            Categoria cristales = categoriaRepository.findByNombre("Cristales")
                .orElseThrow(() -> new IllegalStateException("Categoria Cristales no encontrada"));
            Categoria lentesContacto = categoriaRepository.findByNombre("Lentes de Contacto")
                .orElseThrow(() -> new IllegalStateException("Categoria Lentes de Contacto no encontrada"));

            Marca rayban = marcaRepository.findByNombre("Ray-Ban")
                .orElseThrow(() -> new IllegalStateException("Marca Ray-Ban no encontrada"));
            Marca oakley = marcaRepository.findByNombre("Oakley")
                .orElseThrow(() -> new IllegalStateException("Marca Oakley no encontrada"));
            Marca generico = marcaRepository.findByNombre("Generico")
                .orElseThrow(() -> new IllegalStateException("Marca Generico no encontrada"));

            Unidad unidad = unidadRepository.findByNombre("Unidad")
                .orElseThrow(() -> new IllegalStateException("Unidad de medida 'Unidad' no encontrada"));
            Unidad par = unidadRepository.findByNombre("Par")
                .orElseThrow(() -> new IllegalStateException("Unidad de medida 'Par' no encontrada"));

            Etiqueta destacado = etiquetaRepository.findByNombreIgnoreCase("Destacado")
                .orElseThrow(() -> new IllegalStateException("Etiqueta Destacado no encontrada"));
            Etiqueta nuevo = etiquetaRepository.findByNombreIgnoreCase("Nuevo")
                .orElseThrow(() -> new IllegalStateException("Etiqueta Nuevo no encontrada"));

            Set<Etiqueta> etiquetas1 = new HashSet<>();
            etiquetas1.add(destacado);
            etiquetas1.add(nuevo);

            Set<Etiqueta> etiquetas2 = new HashSet<>();
            etiquetas2.add(nuevo);

            // Producto 1: Armazon Ray-Ban
            productoRepository.save(Producto.builder()
                .nombre("Lentes Ray-Ban Classic Aviator")
                .codigo("RB-AVIATOR-001")
                .modelo("Aviator Classic")
                .descripcion("Lentes de sol Aviator Classic con montura dorada y cristales verdes.")
                .precio(new BigDecimal("599.90"))
                .costo(new BigDecimal("300.00"))
                .stock(15)
                .stockMinimo(2)
                .estado(1)
                .tipoProducto(TipoProducto.ARMAZON)
                .categoria(monturas)
                .marca(rayban)
                .unidadVenta(unidad)
                .unidadCompra(unidad)
                .factorConversion(1)
                .visibleWeb(true)
                .destacado(true)
                .slug("lentes-ray-ban-classic-aviator")
                .descripcionWeb("Los lentes Ray-Ban Aviator Classic son el modelo más icónico. Diseñados originalmente para los aviadores estadounidenses en 1937, combinan un gran estilo con una calidad excepcional, comodidad y protección.")
                .etiquetas(etiquetas1)
                .orden(1)
                .build());

            // Producto 2: Cristal Oakley
            productoRepository.save(Producto.builder()
                .nombre("Cristales Antireflex Oakley Prizm")
                .codigo("OK-PRIZM-002")
                .modelo("Prizm Road")
                .descripcion("Cristales de repuesto con tecnología Prizm y filtro antireflejo.")
                .precio(new BigDecimal("250.00"))
                .costo(new BigDecimal("120.00"))
                .stock(20)
                .stockMinimo(3)
                .estado(1)
                .tipoProducto(TipoProducto.CRISTAL)
                .categoria(cristales)
                .marca(oakley)
                .unidadVenta(par)
                .unidadCompra(par)
                .factorConversion(1)
                .visibleWeb(true)
                .destacado(false)
                .slug("cristales-antireflex-oakley-prizm")
                .descripcionWeb("Optimiza tu visión en la carretera con los cristales Oakley Prizm Road, diseñados para mejorar el contraste y la visibilidad en condiciones de luz cambiante.")
                .etiquetas(etiquetas2)
                .orden(2)
                .build());

            // Producto 3: Lente de contacto Genérico
            productoRepository.save(Producto.builder()
                .nombre("Lentes de Contacto Blandos Diarios")
                .codigo("GN-LC-003")
                .modelo("Blandos Diarios")
                .descripcion("Lentes de contacto desechables de uso diario para corrección de miopía.")
                .precio(new BigDecimal("95.00"))
                .costo(new BigDecimal("45.00"))
                .stock(50)
                .stockMinimo(5)
                .estado(1)
                .tipoProducto(TipoProducto.LENTE_CONTACTO)
                .categoria(lentesContacto)
                .marca(generico)
                .unidadVenta(unidad)
                .unidadCompra(unidad)
                .factorConversion(1)
                .visibleWeb(true)
                .destacado(false)
                .slug("lentes-de-contacto-blandos-diarios")
                .descripcionWeb("Lentes de contacto de hidrogel para máxima hidratación y comodidad durante todo el día.")
                .etiquetas(new HashSet<>())
                .orden(3)
                .build());
        }
    }
}
