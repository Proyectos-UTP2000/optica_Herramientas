package com.herramientas.optica.modules.proveedores.model;

import com.herramientas.optica.modules.clientes.model.TipoDocumento;

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
@Table(name = "proveedor")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipodocumento", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "provee_ndocumento", nullable = false, length = 11)
    private String numeroDocumento;

    @Column(name = "provee_nombre", nullable = false, length = 100, unique = true)
    private String razonSocial;

    @Column(name = "provee_nombre_comercial", nullable = false, length = 100)
    private String nombreComercial;

    @Builder.Default
    @Column(name = "provee_nacionalidad", nullable = false, length = 100)
    private String nacionalidad = "PERUANA";

    @Column(name = "provee_direccion", nullable = false, length = 100)
    private String direccion;

    @Column(name = "provee_telefono", length = 255)
    private String telefono;

    @Column(name = "provee_correo", length = 255)
    private String correo;

    @Builder.Default
    @Column(name = "provee_estado", nullable = false)
    private Integer estado = 1;

}
