CREATE TABLE IF NOT EXISTS tipo_comprobante (
    id INT NOT NULL AUTO_INCREMENT,
    correlativo_actual INT NULL,
    estado INT NULL,
    nombre VARCHAR(255) NULL,
    serie VARCHAR(255) NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS compra (
    id_compra BIGINT NOT NULL AUTO_INCREMENT,
    estado INT NOT NULL,
    compra_fecha DATETIME(6) NULL,
    total DECIMAL(10, 2) NULL,
    id_proveedor BIGINT NOT NULL,
    id_tipo_comprobante INT NULL,
    id_usuario BIGINT NOT NULL,
    cuotas INT NULL,
    deuda DECIMAL(10, 2) NULL,
    fecha_vencimiento DATE NULL,
    forma_pago ENUM('CONTADO','CREDITO') NULL,
    medio_pago ENUM('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE') NULL,
    pago_inicial DECIMAL(10, 2) NULL,
    nota_recepcion VARCHAR(255) NULL,
    PRIMARY KEY (id_compra),
    CONSTRAINT fk_compra_proveedor_base FOREIGN KEY (id_proveedor) REFERENCES proveedor (id_proveedor),
    CONSTRAINT fk_compra_tipo_comprobante_base FOREIGN KEY (id_tipo_comprobante) REFERENCES tipo_comprobante (id),
    CONSTRAINT fk_compra_empleado_base FOREIGN KEY (id_usuario) REFERENCES empleado (id_empleado)
);

ALTER TABLE compra
    ADD COLUMN id_caja BIGINT NULL AFTER id_usuario,
    ADD COLUMN compra_numero_comprobante VARCHAR(50) NULL AFTER compra_fecha,
    ADD COLUMN compra_subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER compra_numero_comprobante,
    ADD COLUMN compra_descuento DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER compra_subtotal,
    ADD COLUMN created_at DATETIME(6) NULL,
    ADD COLUMN updated_at DATETIME(6) NULL;

ALTER TABLE compra
    MODIFY COLUMN total DECIMAL(12, 2) NULL,
    MODIFY COLUMN deuda DECIMAL(12, 2) NULL,
    MODIFY COLUMN pago_inicial DECIMAL(12, 2) NULL,
    MODIFY COLUMN medio_pago ENUM('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE','PLIN','OTRO') NULL;

UPDATE compra
SET compra_subtotal = COALESCE(total, 0),
    compra_descuento = COALESCE(compra_descuento, 0),
    pago_inicial = CASE
        WHEN forma_pago = 'CONTADO' THEN COALESCE(total, 0)
        ELSE pago_inicial
    END,
    deuda = CASE
        WHEN forma_pago = 'CONTADO' THEN 0
        ELSE deuda
    END
WHERE id_compra IS NOT NULL;

CREATE INDEX idx_compra_fecha ON compra (compra_fecha);
CREATE INDEX idx_compra_proveedor_fecha ON compra (id_proveedor, compra_fecha);
CREATE INDEX idx_compra_caja ON compra (id_caja);

ALTER TABLE compra
    ADD CONSTRAINT fk_compra_caja FOREIGN KEY (id_caja) REFERENCES caja (id_caja);

CREATE TABLE IF NOT EXISTS detalle_compras (
    id_compra BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL,
    stock_previo INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    cantidad_recibida INT DEFAULT 0,
    PRIMARY KEY (id_compra, id_producto),
    CONSTRAINT fk_detalle_compras_producto_base FOREIGN KEY (id_producto) REFERENCES producto (id_producto),
    CONSTRAINT fk_detalle_compras_compra_base FOREIGN KEY (id_compra) REFERENCES compra (id_compra)
);

ALTER TABLE detalle_compras
    ADD COLUMN factor_conversion_aplicado INT NOT NULL DEFAULT 1 AFTER cantidad,
    ADD COLUMN cantidad_inventario DECIMAL(12, 3) NOT NULL DEFAULT 0 AFTER factor_conversion_aplicado;

ALTER TABLE detalle_compras
    MODIFY COLUMN cantidad DECIMAL(12, 3) NOT NULL,
    MODIFY COLUMN precio DECIMAL(12, 2) NOT NULL,
    MODIFY COLUMN stock_actual DECIMAL(12, 3) NOT NULL,
    MODIFY COLUMN stock_previo DECIMAL(12, 3) NOT NULL,
    MODIFY COLUMN subtotal DECIMAL(12, 2) NOT NULL,
    MODIFY COLUMN cantidad_recibida DECIMAL(12, 3) NULL DEFAULT 0;

UPDATE detalle_compras dc
JOIN producto p ON p.id_producto = dc.id_producto
SET dc.factor_conversion_aplicado = COALESCE(NULLIF(p.produc_factor_conversion, 0), 1),
    dc.cantidad_inventario = COALESCE(NULLIF(dc.cantidad_recibida, 0), dc.cantidad)
        * COALESCE(NULLIF(p.produc_factor_conversion, 0), 1)
WHERE dc.id_compra IS NOT NULL;
