CREATE TABLE IF NOT EXISTS inventario_saldo (
    id_inventario_saldo BIGINT NOT NULL AUTO_INCREMENT,
    id_producto BIGINT NOT NULL,
    inv_stock_actual DECIMAL(12, 3) NOT NULL DEFAULT 0,
    inv_stock_minimo DECIMAL(12, 3) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id_inventario_saldo),
    CONSTRAINT uk_inventario_saldo_producto UNIQUE (id_producto),
    CONSTRAINT fk_inventario_saldo_producto FOREIGN KEY (id_producto) REFERENCES producto (id_producto)
);

CREATE INDEX idx_inventario_saldo_stock_minimo
    ON inventario_saldo (inv_stock_actual, inv_stock_minimo);

CREATE TABLE IF NOT EXISTS movimiento_inventario (
    id_movimiento_inventario BIGINT NOT NULL AUTO_INCREMENT,
    id_producto BIGINT NOT NULL,
    mov_tipo VARCHAR(30) NOT NULL,
    mov_cantidad DECIMAL(12, 3) NOT NULL,
    mov_stock_previo DECIMAL(12, 3) NOT NULL,
    mov_stock_nuevo DECIMAL(12, 3) NOT NULL,
    mov_motivo VARCHAR(500) NOT NULL,
    mov_referencia_tipo VARCHAR(50) NOT NULL,
    mov_referencia_id BIGINT NULL,
    id_empleado BIGINT NULL,
    mov_fecha DATETIME(6) NOT NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id_movimiento_inventario),
    CONSTRAINT fk_movimiento_inventario_producto FOREIGN KEY (id_producto) REFERENCES producto (id_producto),
    CONSTRAINT fk_movimiento_inventario_empleado FOREIGN KEY (id_empleado) REFERENCES empleado (id_empleado)
);

CREATE INDEX idx_movimiento_inventario_producto_fecha
    ON movimiento_inventario (id_producto, mov_fecha);

CREATE INDEX idx_movimiento_inventario_referencia
    ON movimiento_inventario (mov_referencia_tipo, mov_referencia_id);
