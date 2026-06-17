package com.herramientas.optica.modules.cotizaciones.model;

import com.herramientas.optica.modules.productos.model.Producto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "cotizacion_detalle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotizacionDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cotizacion_detalle")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cotizacion", nullable = false)
    @ToString.Exclude
    private Cotizacion cotizacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "coti_cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "coti_precio_lista", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioLista;

    @Column(name = "coti_subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
}
