-- Safe and idempotent procedure to drop obsolete columns from 'caja' and 'gasto' tables in MySQL/MariaDB.
-- These columns belonged to previous modules/drafts and are not mapped in the current JPA entities.

DROP PROCEDURE IF EXISTS CleanCajaGastoObsoleteColumns;

DELIMITER //

CREATE PROCEDURE CleanCajaGastoObsoleteColumns()
BEGIN
    -- 1. Drop old FK constraint on 'caja' if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = DATABASE() 
          AND table_name = 'caja' 
          AND constraint_name = 'FK_Usuario_Caja'
    ) THEN
        ALTER TABLE caja DROP FOREIGN KEY FK_Usuario_Caja;
    END IF;

    -- 2. Drop obsolete columns from 'caja' if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'fecha_apertura') THEN
        ALTER TABLE caja DROP COLUMN fecha_apertura;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'fecha_cierre') THEN
        ALTER TABLE caja DROP COLUMN fecha_cierre;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'monto_inicial') THEN
        ALTER TABLE caja DROP COLUMN monto_inicial;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'total_ventas_efectivo') THEN
        ALTER TABLE caja DROP COLUMN total_ventas_efectivo;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'total_gastos') THEN
        ALTER TABLE caja DROP COLUMN total_gastos;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'monto_final_esperado') THEN
        ALTER TABLE caja DROP COLUMN monto_final_esperado;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'monto_final_real') THEN
        ALTER TABLE caja DROP COLUMN monto_final_real;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'diferencia') THEN
        ALTER TABLE caja DROP COLUMN diferencia;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'estado') THEN
        ALTER TABLE caja DROP COLUMN estado;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'observaciones') THEN
        ALTER TABLE caja DROP COLUMN observaciones;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'caja' AND column_name = 'id_usuario') THEN
        ALTER TABLE caja DROP COLUMN id_usuario;
    END IF;

    -- 3. Drop obsolete columns from 'gasto' if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'gasto' AND column_name = 'descripcion') THEN
        ALTER TABLE gasto DROP COLUMN descripcion;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'gasto' AND column_name = 'monto') THEN
        ALTER TABLE gasto DROP COLUMN monto;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'gasto' AND column_name = 'fecha') THEN
        ALTER TABLE gasto DROP COLUMN fecha;
    END IF;
END //

DELIMITER ;

CALL CleanCajaGastoObsoleteColumns();
DROP PROCEDURE CleanCajaGastoObsoleteColumns;
