package com.herramientas.optica.modules.compras.model;

import java.math.BigDecimal;

import com.herramientas.optica.modules.productos.model.Producto;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "detalle_compras")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompraDetalle {

    @EmbeddedId
    private CompraDetalleId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("compraId")
    @JoinColumn(name = "id_compra", nullable = false)
    private Compra compra;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("productoId")
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false, precision = 12, scale = 3)
    private BigDecimal cantidadCompra;

    @Column(name = "factor_conversion_aplicado", nullable = false)
    private Integer factorConversionAplicado;

    @Column(name = "cantidad_inventario", nullable = false, precision = 12, scale = 3)
    private BigDecimal cantidadInventario;

    @Column(name = "precio", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoUnitario;

    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "stock_previo", nullable = false, precision = 12, scale = 3)
    private BigDecimal stockPrevio;

    @Column(name = "stock_actual", nullable = false, precision = 12, scale = 3)
    private BigDecimal stockActual;
}
