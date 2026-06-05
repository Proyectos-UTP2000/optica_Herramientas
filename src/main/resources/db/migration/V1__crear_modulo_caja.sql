CREATE TABLE IF NOT EXISTS caja (
    id_caja BIGINT NOT NULL AUTO_INCREMENT,
    id_empleado BIGINT NOT NULL,
    caja_fecha_apertura DATETIME(6) NOT NULL,
    caja_fecha_cierre DATETIME(6) NULL,
    caja_monto_inicial DECIMAL(12, 2) NOT NULL,
    caja_monto_esperado DECIMAL(12, 2) NULL,
    caja_monto_real DECIMAL(12, 2) NULL,
    caja_diferencia DECIMAL(12, 2) NULL,
    caja_estado VARCHAR(20) NOT NULL,
    caja_observaciones VARCHAR(500) NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id_caja),
    CONSTRAINT fk_caja_empleado FOREIGN KEY (id_empleado) REFERENCES empleado (id_empleado)
);

CREATE INDEX idx_caja_empleado_estado ON caja (id_empleado, caja_estado);

CREATE TABLE IF NOT EXISTS movimiento_caja (
    id_movimiento_caja BIGINT NOT NULL AUTO_INCREMENT,
    id_caja BIGINT NOT NULL,
    mov_tipo VARCHAR(20) NOT NULL,
    mov_origen VARCHAR(30) NOT NULL,
    mov_metodo_pago VARCHAR(30) NOT NULL,
    mov_monto DECIMAL(12, 2) NOT NULL,
    mov_descripcion VARCHAR(500) NOT NULL,
    mov_referencia_tipo VARCHAR(50) NULL,
    mov_referencia_id BIGINT NULL,
    id_empleado BIGINT NOT NULL,
    mov_fecha DATETIME(6) NOT NULL,
    mov_anulado BIT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id_movimiento_caja),
    CONSTRAINT fk_movimiento_caja_caja FOREIGN KEY (id_caja) REFERENCES caja (id_caja),
    CONSTRAINT fk_movimiento_caja_empleado FOREIGN KEY (id_empleado) REFERENCES empleado (id_empleado)
);

CREATE INDEX idx_movimiento_caja_caja_fecha ON movimiento_caja (id_caja, mov_fecha);

CREATE TABLE IF NOT EXISTS gasto (
    id_gasto BIGINT NOT NULL AUTO_INCREMENT,
    id_caja BIGINT NOT NULL,
    id_movimiento_caja BIGINT NOT NULL,
    id_empleado BIGINT NOT NULL,
    gasto_categoria VARCHAR(80) NOT NULL,
    gasto_descripcion VARCHAR(500) NOT NULL,
    gasto_monto DECIMAL(12, 2) NOT NULL,
    gasto_metodo_pago VARCHAR(30) NOT NULL,
    gasto_fecha DATETIME(6) NOT NULL,
    gasto_estado VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id_gasto),
    CONSTRAINT uk_gasto_movimiento_caja UNIQUE (id_movimiento_caja),
    CONSTRAINT fk_gasto_caja FOREIGN KEY (id_caja) REFERENCES caja (id_caja),
    CONSTRAINT fk_gasto_movimiento_caja FOREIGN KEY (id_movimiento_caja) REFERENCES movimiento_caja (id_movimiento_caja),
    CONSTRAINT fk_gasto_empleado FOREIGN KEY (id_empleado) REFERENCES empleado (id_empleado)
);

CREATE INDEX idx_gasto_caja_fecha ON gasto (id_caja, gasto_fecha);
