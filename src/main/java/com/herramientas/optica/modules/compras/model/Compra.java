package com.herramientas.optica.modules.compras.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.herramientas.optica.modules.caja.model.Caja;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.proveedores.model.Proveedor;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "compra")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compra")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Empleado empleado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_caja")
    private Caja caja;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo_comprobante")
    private TipoComprobante tipoComprobante;

    @Column(name = "compra_fecha")
    private LocalDateTime fecha;

    @Column(name = "compra_numero_comprobante", length = 50)
    private String numeroComprobante;

    @Column(name = "compra_subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "compra_descuento", precision = 12, scale = 2)
    private BigDecimal descuento;

    @Column(name = "total", precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "estado", nullable = false)
    private Integer estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pago")
    private FormaPagoCompra formaPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "medio_pago")
    private MedioPagoCompra medioPago;

    @Column(name = "nota_recepcion")
    private String notaRecepcion;

    @Column(name = "pago_inicial", precision = 12, scale = 2)
    private BigDecimal pagoInicial;

    @Column(name = "deuda", precision = 12, scale = 2)
    private BigDecimal deuda;

    @Column(name = "cuotas")
    private Integer cuotas;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Builder.Default
    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompraDetalle> detalles = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime ahora = LocalDateTime.now();
        this.createdAt = ahora;
        this.updatedAt = ahora;
        if (this.fecha == null) {
            this.fecha = ahora;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void agregarDetalle(CompraDetalle detalle) {
        detalles.add(detalle);
        detalle.setCompra(this);
    }
}
