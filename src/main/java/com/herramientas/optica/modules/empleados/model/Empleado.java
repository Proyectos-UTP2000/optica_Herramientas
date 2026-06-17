package com.herramientas.optica.modules.empleados.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "empleado")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long id;

    @Column(name = "emple_nombre", nullable = false, length = 100)
    private String nombre;

    @Column(
        name = "emple_nombreuser",
        nullable = false,
        unique = true,
        length = 50
    )
    private String username;

    @Column(name = "emple_apellido_paterno", nullable = false, length = 100)
    private String apellidoPaterno;

    @Column(name = "emple_apellido_materno", nullable = false, length = 100)
    private String apellidoMaterno;

    @Column(name = "emple_correo", nullable = false, unique = true, length = 60)
    private String correo;

    @Column(name = "emple_contrasena", nullable = false, length = 150)
    private String contrasena;

    @Column(
        name = "emple_telefono",
        nullable = false,
        unique = true,
        length = 9
    )
    private String telefono;

    @Column(name = "emple_direccion", nullable = false, length = 100)
    private String direccion;

    @Column(name = "emple_estado", nullable = false)
    @Builder.Default
    private Integer estado = 1;

    @Column(
        name = "emple_ndocumento",
        nullable = false,
        unique = true,
        length = 20
    )
    private String numeroDocumento;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_perfil", nullable = false)
    private Perfil perfil;

    @Column(name = "id_tipodocumento", nullable = false)
    private Long idTipoDocumento;


    @Column(name = "emple_reset_codigo", length = 6)
    private String resetCodigo;

    @Column(name = "emple_reset_expiracion")
    private java.time.LocalDateTime resetExpiracion;
}
