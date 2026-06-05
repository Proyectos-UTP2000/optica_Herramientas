package com.herramientas.optica.modules.compras.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tipo_comprobante")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoComprobante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "serie")
    private String serie;

    @Column(name = "correlativo_actual")
    private Integer correlativoActual;

    @Column(name = "estado")
    private Integer estado;
}
