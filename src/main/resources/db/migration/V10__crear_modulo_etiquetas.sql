CREATE TABLE etiqueta (
    id_etiqueta BIGINT AUTO_INCREMENT PRIMARY KEY,
    etiq_nombre VARCHAR(100) NOT NULL UNIQUE,
    etiq_estado INT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE producto_etiqueta (
    id_producto BIGINT NOT NULL,
    id_etiqueta BIGINT NOT NULL,
    PRIMARY KEY (id_producto, id_etiqueta),
    CONSTRAINT fk_prod_etiq_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE,
    CONSTRAINT fk_prod_etiq_etiqueta FOREIGN KEY (id_etiqueta) REFERENCES etiqueta(id_etiqueta) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE producto DROP COLUMN produc_etiquetas;

-- Seed Tags
INSERT INTO etiqueta (id_etiqueta, etiq_nombre, etiq_estado) VALUES
(1, 'ANTIREFLEX', 1),
(2, 'FILTRO AZUL', 1),
(3, 'FOTOCROMATICO', 1),
(4, 'UV400', 1),
(5, 'POLARIZADO', 1),
(6, 'RAY-BAN', 1),
(7, 'OAKLEY', 1),
(8, 'ACUVUE', 1);

-- Seed Relations
INSERT INTO producto_etiqueta (id_producto, id_etiqueta) VALUES
(1, 4), (1, 5), (1, 6),
(2, 4), (2, 5), (2, 7),
(3, 8),
(4, 1);
