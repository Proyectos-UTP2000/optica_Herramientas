package com.herramientas.optica.modules.empleados.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "perfil")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfil")
    private Long id;

    @Column(name = "perfil_nombre", nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(name = "perfil_descripcion", length = 255)
    private String descripcion;

    @Column(name = "perfil_estado", nullable = false)
    @Builder.Default
    private Integer estado = 1;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "perfil_opcion",
        joinColumns = @JoinColumn(name = "id_perfil"),
        inverseJoinColumns = @JoinColumn(name = "id_opcion")
    )
    @Builder.Default
    private java.util.Set<Opcion> opciones = new java.util.HashSet<>();
}