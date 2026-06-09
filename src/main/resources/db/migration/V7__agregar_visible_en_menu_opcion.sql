DELIMITER //

CREATE PROCEDURE ensure_visible_en_menu_opcion()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'opcion'
          AND column_name = 'visible_en_menu'
    ) THEN
        ALTER TABLE opcion ADD COLUMN visible_en_menu TINYINT(1) NOT NULL DEFAULT 1 AFTER opcion_orden;
    END IF;
END//

DELIMITER ;

CALL ensure_visible_en_menu_opcion();
DROP PROCEDURE ensure_visible_en_menu_opcion;

UPDATE opcion
SET visible_en_menu = 0
WHERE opcion_ruta = '/cajas'
   OR opcion_nombre = 'Cajas Operativas';
