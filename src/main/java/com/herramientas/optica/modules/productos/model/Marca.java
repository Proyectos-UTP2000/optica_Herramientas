package com.herramientas.optica.modules.productos.model;

import java.time.LocalDate;

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
@Table(name = "marca")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_marca")
    private Long id;

    @Column(name = "marca_nombre", nullable = false, unique = true, length = 255)
    private String nombre;

    @Column(name = "marca_fecha")
    private LocalDate fecha;

    @Builder.Default
    @Column(name = "marca_estado", nullable = false)
    private Integer estado = 1;
}