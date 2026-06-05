package com.herramientas.optica.modules.ventas.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.herramientas.optica.modules.caja.model.Caja;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.compras.model.TipoComprobante;
import com.herramientas.optica.modules.empleados.model.Empleado;

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
@Table(name = "venta")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Empleado empleado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_caja")
    private Caja caja;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo_comprobante")
    private TipoComprobante tipoComprobante;

    @Column(name = "venta_fecha")
    private LocalDateTime fecha;

    @Column(name = "venta_numero_comprobante", length = 50)
    private String numeroComprobante;

    @Column(name = "venta_subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "venta_descuento", precision = 12, scale = 2)
    private BigDecimal descuento;

    @Column(name = "total", precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "estado", nullable = false)
    private Integer estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pago")
    private FormaPagoVenta formaPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "medio_pago")
    private MedioPagoVenta medioPago;

    @Column(name = "venta_observaciones", length = 255)
    private String observaciones;

    @Column(name = "pago_inicial", precision = 12, scale = 2)
    private BigDecimal pagoInicial;

    @Column(name = "deuda", precision = 12, scale = 2)
    private BigDecimal deuda;

    @Column(name = "cuotas")
    private Integer cuotas;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Builder.Default
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VentaDetalle> detalles = new ArrayList<>();

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

    public void agregarDetalle(VentaDetalle detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }
}
