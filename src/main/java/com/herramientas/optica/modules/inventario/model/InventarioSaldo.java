package com.herramientas.optica.modules.inventario.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.herramientas.optica.modules.productos.model.Producto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventario_saldo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventarioSaldo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inventario_saldo")
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false, unique = true)
    private Producto producto;

    @Builder.Default
    @Column(name = "inv_stock_actual", nullable = false, precision = 12, scale = 3)
    private BigDecimal stockActual = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "inv_stock_minimo", nullable = false, precision = 12, scale = 3)
    private BigDecimal stockMinimo = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
