package com.herramientas.optica.modules.empleados.model;

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
@Table(name = "opcion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_opcion")
    private Long id;

    @Column(name = "opcion_nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "opcion_ruta", length = 100)
    private String ruta;

    @Column(name = "opcion_icon", length = 100)
    private String icono;
}