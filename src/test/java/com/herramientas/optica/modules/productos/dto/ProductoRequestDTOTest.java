package com.herramientas.optica.modules.productos.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.herramientas.optica.modules.productos.model.TipoProducto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

class ProductoRequestDTOTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void productoValidoNoGeneraErroresDeValidacion() {
        ProductoRequestDTO dto = productoValido();

        Set<ConstraintViolation<ProductoRequestDTO>> errores = validator.validate(dto);

        assertThat(errores).isEmpty();
    }

    @Test
    void rechazaFechaVencimientoQueNoSeaFutura() {
        ProductoRequestDTO dto = productoValido();
        dto.setFechaVencimiento(LocalDate.now());

        Set<ConstraintViolation<ProductoRequestDTO>> errores = validator.validate(dto);

        assertThat(errores).anySatisfy(error -> {
            assertThat(error.getPropertyPath().toString()).isEqualTo("fechaVencimiento");
            assertThat(error.getMessage()).isEqualTo("La fecha de vencimiento debe ser una fecha futura");
        });
    }

    @Test
    void rechazaMontosStockYFactorInvalidos() {
        ProductoRequestDTO dto = productoValido();
        dto.setPrecio(BigDecimal.ZERO);
        dto.setCosto(new BigDecimal("-0.01"));
        dto.setStockInicial(-1);
        dto.setStockMinimo(-1);
        dto.setFactorConversion(0);

        Set<ConstraintViolation<ProductoRequestDTO>> errores = validator.validate(dto);

        assertThat(errores)
                .extracting(error -> error.getPropertyPath().toString())
                .contains("precio", "costo", "stockInicial", "stockMinimo", "factorConversion");
    }

    private ProductoRequestDTO productoValido() {
        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setNombre("Lente antireflex");
        dto.setDescripcion("Lente con tratamiento antireflex");
        dto.setPrecio(new BigDecimal("120.00"));
        dto.setCosto(new BigDecimal("70.00"));
        dto.setFechaVencimiento(LocalDate.now().plusDays(1));
        dto.setStockInicial(0);
        dto.setStockMinimo(0);
        dto.setTipoProducto(TipoProducto.CRISTAL);
        dto.setIdCategoria(1L);
        dto.setIdMarca(1L);
        dto.setIdUnidadVenta(1);
        dto.setIdUnidadCompra(1);
        dto.setFactorConversion(1);
        return dto;
    }
}
