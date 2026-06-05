package com.herramientas.optica.modules.ventas.model;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaDetalleId implements Serializable {

    @Column(name = "id_venta")
    private Long ventaId;

    @Column(name = "id_producto")
    private Long productoId;
}
