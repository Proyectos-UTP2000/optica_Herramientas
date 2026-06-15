-- V14__agregar_credenciales_cliente_y_vinculo_cotizacion.sql
ALTER TABLE cliente ADD COLUMN cli_contrasena VARCHAR(255) NULL;
ALTER TABLE cliente ADD CONSTRAINT uq_cli_correo UNIQUE (cli_correo);

ALTER TABLE cotizacion ADD COLUMN id_cliente_usuario BIGINT NULL;
ALTER TABLE cotizacion ADD COLUMN coti_direccion VARCHAR(255) NULL;
ALTER TABLE cotizacion ADD CONSTRAINT fk_coti_cliente_usuario FOREIGN KEY (id_cliente_usuario) REFERENCES cliente (id_cliente) ON DELETE SET NULL;
