package com.herramientas.optica.modules.productos.model;

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
@Table(name = "unidad")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_unidad")
    private Integer id;

    @Column(name = "uni_nombre", nullable = false, unique = true, length = 255)
    private String nombre;

    @Builder.Default
    @Column(name = "uni_estado", nullable = false)
    private Integer estado = 1;
}