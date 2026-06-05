CREATE TABLE IF NOT EXISTS proveedor (
    id_proveedor BIGINT NOT NULL AUTO_INCREMENT,
    id_tipodocumento BIGINT NOT NULL,
    provee_nombre VARCHAR(100) NOT NULL,
    provee_nombre_comercial VARCHAR(100) NOT NULL,
    provee_nacionalidad VARCHAR(100) NOT NULL,
    provee_direccion VARCHAR(100) NOT NULL,
    provee_telefono VARCHAR(255) NULL,
    provee_correo VARCHAR(255) NULL,
    provee_correo_adicional VARCHAR(150) NULL,
    provee_estado INT NOT NULL DEFAULT 1,
    provee_ndocumento VARCHAR(11) NOT NULL,
    PRIMARY KEY (id_proveedor),
    CONSTRAINT uk_proveedor_nombre UNIQUE (provee_nombre),
    CONSTRAINT fk_proveedor_tipo_documento FOREIGN KEY (id_tipodocumento) REFERENCES tipo_documento (id_tipodocumento)
);
