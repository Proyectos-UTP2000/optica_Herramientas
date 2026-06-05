CREATE TABLE IF NOT EXISTS venta (
    id_venta BIGINT NOT NULL AUTO_INCREMENT,
    id_cliente BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    id_caja BIGINT NULL,
    id_tipo_comprobante INT NULL,
    venta_fecha DATETIME(6) NULL,
    venta_numero_comprobante VARCHAR(50) NULL,
    venta_subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    venta_descuento DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total DECIMAL(12, 2) NULL,
    estado INT NOT NULL,
    forma_pago ENUM('CONTADO','CREDITO') NULL,
    medio_pago ENUM('EFECTIVO','YAPE','PLIN','TRANSFERENCIA','TARJETA','OTRO') NULL,
    venta_observaciones VARCHAR(255) NULL,
    pago_inicial DECIMAL(12, 2) NULL,
    deuda DECIMAL(12, 2) NULL,
    cuotas INT NULL,
    fecha_vencimiento DATE NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id_venta),
    CONSTRAINT fk_venta_cliente FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente),
    CONSTRAINT fk_venta_empleado FOREIGN KEY (id_usuario) REFERENCES empleado (id_empleado),
    CONSTRAINT fk_venta_caja FOREIGN KEY (id_caja) REFERENCES caja (id_caja),
    CONSTRAINT fk_venta_tipo_comprobante FOREIGN KEY (id_tipo_comprobante) REFERENCES tipo_comprobante (id)
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id_venta BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    cantidad DECIMAL(12, 3) NOT NULL,
    precio DECIMAL(12, 2) NOT NULL,
    descuento DECIMAL(12, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL,
    stock_previo DECIMAL(12, 3) NOT NULL DEFAULT 0,
    stock_actual DECIMAL(12, 3) NOT NULL DEFAULT 0,
    PRIMARY KEY (id_venta, id_producto),
    CONSTRAINT fk_detalle_ventas_venta FOREIGN KEY (id_venta) REFERENCES venta (id_venta),
    CONSTRAINT fk_detalle_ventas_producto FOREIGN KEY (id_producto) REFERENCES producto (id_producto)
);

DELIMITER //

CREATE PROCEDURE ensure_column(
    IN p_table_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_column_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = p_table_name
          AND column_name = p_column_name
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN ', p_column_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

CREATE PROCEDURE ensure_index(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_index_columns TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = p_table_name
          AND index_name = p_index_name
    ) THEN
        SET @ddl = CONCAT('CREATE INDEX `', p_index_name, '` ON `', p_table_name, '` ', p_index_columns);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

CREATE PROCEDURE ensure_foreign_key(
    IN p_table_name VARCHAR(64),
    IN p_constraint_name VARCHAR(64),
    IN p_constraint_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = DATABASE()
          AND table_name = p_table_name
          AND constraint_name = p_constraint_name
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD CONSTRAINT `', p_constraint_name, '` ', p_constraint_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

DELIMITER ;

CALL ensure_column('venta', 'id_caja', 'id_caja BIGINT NULL AFTER id_usuario');
CALL ensure_column('venta', 'venta_numero_comprobante', 'venta_numero_comprobante VARCHAR(50) NULL AFTER venta_fecha');
CALL ensure_column('venta', 'venta_subtotal', 'venta_subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER venta_numero_comprobante');
CALL ensure_column('venta', 'venta_descuento', 'venta_descuento DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER venta_subtotal');
CALL ensure_column('venta', 'venta_observaciones', 'venta_observaciones VARCHAR(255) NULL AFTER medio_pago');
CALL ensure_column('venta', 'created_at', 'created_at DATETIME(6) NULL');
CALL ensure_column('venta', 'updated_at', 'updated_at DATETIME(6) NULL');

UPDATE venta
SET venta_fecha = COALESCE(venta_fecha, fecha),
    venta_subtotal = COALESCE(NULLIF(venta_subtotal, 0), total, 0),
    venta_descuento = COALESCE(venta_descuento, 0),
    pago_inicial = CASE
        WHEN forma_pago = 'CONTADO' THEN COALESCE(total, 0)
        ELSE pago_inicial
    END,
    deuda = CASE
        WHEN forma_pago = 'CONTADO' THEN 0
        ELSE deuda
    END
WHERE id_venta IS NOT NULL;

ALTER TABLE venta
    MODIFY COLUMN total DECIMAL(12, 2) NULL,
    MODIFY COLUMN deuda DECIMAL(12, 2) NULL,
    MODIFY COLUMN pago_inicial DECIMAL(12, 2) NULL,
    MODIFY COLUMN forma_pago ENUM('CONTADO','CREDITO') NULL,
    MODIFY COLUMN medio_pago ENUM('EFECTIVO','YAPE','PLIN','TRANSFERENCIA','TARJETA','OTRO') NULL,
    MODIFY COLUMN venta_subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    MODIFY COLUMN venta_descuento DECIMAL(12, 2) NOT NULL DEFAULT 0;

CALL ensure_column('detalle_ventas', 'stock_previo', 'stock_previo DECIMAL(12, 3) NOT NULL DEFAULT 0 AFTER subtotal');
CALL ensure_column('detalle_ventas', 'stock_actual', 'stock_actual DECIMAL(12, 3) NOT NULL DEFAULT 0 AFTER stock_previo');

UPDATE detalle_ventas
SET descuento = COALESCE(descuento, 0),
    stock_previo = COALESCE(stock_previo, 0),
    stock_actual = COALESCE(stock_actual, 0)
WHERE id_venta IS NOT NULL;

ALTER TABLE detalle_ventas
    MODIFY COLUMN cantidad DECIMAL(12, 3) NOT NULL,
    MODIFY COLUMN precio DECIMAL(12, 2) NOT NULL,
    MODIFY COLUMN descuento DECIMAL(12, 2) NOT NULL DEFAULT 0,
    MODIFY COLUMN subtotal DECIMAL(12, 2) NOT NULL,
    MODIFY COLUMN stock_previo DECIMAL(12, 3) NOT NULL DEFAULT 0,
    MODIFY COLUMN stock_actual DECIMAL(12, 3) NOT NULL DEFAULT 0;

CALL ensure_index('venta', 'idx_venta_fecha', '(`venta_fecha`)');
CALL ensure_index('venta', 'idx_venta_cliente_fecha', '(`id_cliente`, `venta_fecha`)');
CALL ensure_index('venta', 'idx_venta_caja', '(`id_caja`)');

CALL ensure_foreign_key('venta', 'fk_venta_caja', 'FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`)');

DROP PROCEDURE ensure_foreign_key;
DROP PROCEDURE ensure_index;
DROP PROCEDURE ensure_column;
