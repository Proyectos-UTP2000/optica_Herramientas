package com.herramientas.optica.modules.compras.model;

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
public class CompraDetalleId implements Serializable {

    @Column(name = "id_compra")
    private Long compraId;

    @Column(name = "id_producto")
    private Long productoId;
}
