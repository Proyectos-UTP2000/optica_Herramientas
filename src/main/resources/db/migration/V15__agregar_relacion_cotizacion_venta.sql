-- V15__agregar_relacion_cotizacion_venta.sql
ALTER TABLE venta ADD COLUMN id_cotizacion BIGINT NULL;
ALTER TABLE venta ADD CONSTRAINT fk_venta_cotizacion FOREIGN KEY (id_cotizacion) REFERENCES cotizacion (id_cotizacion) ON DELETE SET NULL;
