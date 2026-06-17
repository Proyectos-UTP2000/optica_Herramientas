-- OPTICA SYSTEM INITIAL CONSOLIDATED SCHEMA

-- 1. tipo_documento
CREATE TABLE `tipo_documento` (
  `id_tipodocumento` bigint NOT NULL AUTO_INCREMENT,
  `tipodoc_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipodoc_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_tipodocumento`),
  UNIQUE KEY `tipodoc_nombre` (`tipodoc_nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. perfil
CREATE TABLE `perfil` (
  `id_perfil` bigint NOT NULL AUTO_INCREMENT,
  `perfil_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `perfil_descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `perfil_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_perfil`),
  UNIQUE KEY `perfil_nombre` (`perfil_nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. opcion
CREATE TABLE `opcion` (
  `id_opcion` bigint NOT NULL AUTO_INCREMENT,
  `opcion_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `opcion_ruta` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `opcion_icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `opcion_orden` int DEFAULT NULL,
  `visible_en_menu` tinyint(1) NOT NULL DEFAULT '1',
  `id_padre` bigint DEFAULT NULL,
  PRIMARY KEY (`id_opcion`),
  KEY `FKnk9w0tcdett0y2qb8kyy25b2g` (`id_padre`),
  CONSTRAINT `FKnk9w0tcdett0y2qb8kyy25b2g` FOREIGN KEY (`id_padre`) REFERENCES `opcion` (`id_opcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. perfil_opcion
CREATE TABLE `perfil_opcion` (
  `id_perfil` bigint NOT NULL,
  `id_opcion` bigint NOT NULL,
  PRIMARY KEY (`id_perfil`,`id_opcion`),
  KEY `FK_Opcion` (`id_opcion`),
  CONSTRAINT `FK_Opcion` FOREIGN KEY (`id_opcion`) REFERENCES `opcion` (`id_opcion`),
  CONSTRAINT `FK_Perfil` FOREIGN KEY (`id_perfil`) REFERENCES `perfil` (`id_perfil`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. empleado
CREATE TABLE `empleado` (
  `id_empleado` bigint NOT NULL AUTO_INCREMENT,
  `emple_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `emple_nombreuser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `emple_apellido_paterno` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `emple_apellido_materno` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `emple_correo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `emple_contrasena` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `emple_telefono` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `emple_direccion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `emple_estado` int NOT NULL DEFAULT '1',
  `emple_ndocumento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `id_tipodocumento` bigint NOT NULL,
  `id_perfil` bigint NOT NULL,
  `emple_reset_codigo` varchar(6) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `emple_reset_expiracion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_empleado`),
  UNIQUE KEY `emple_nombreuser` (`emple_nombreuser`),
  UNIQUE KEY `emple_correo` (`emple_correo`),
  UNIQUE KEY `emple_telefono` (`emple_telefono`),
  UNIQUE KEY `emple_ndocumento` (`emple_ndocumento`),
  KEY `FK_TipoDoc_Empleado` (`id_tipodocumento`),
  KEY `FK_Perfil_Empleado` (`id_perfil`),
  CONSTRAINT `FK_Perfil_Empleado` FOREIGN KEY (`id_perfil`) REFERENCES `perfil` (`id_perfil`),
  CONSTRAINT `FK_TipoDoc_Empleado` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipo_documento` (`id_tipodocumento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. cliente
CREATE TABLE `cliente` (
  `id_cliente` bigint NOT NULL AUTO_INCREMENT,
  `cli_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cli_apellido_paterno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cli_apellido_materno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cli_correo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cli_telefono` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cli_direccion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cli_estado` int NOT NULL DEFAULT '1',
  `cli_ndocumento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `id_tipodocumento` bigint NOT NULL,
  `cli_nombre_empresa` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cli_direccion_empresa` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cli_contrasena` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cli_reset_codigo` varchar(6) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cli_reset_expiracion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uq_cli_correo` (`cli_correo`),
  KEY `FK_TipoDoc_Cliente` (`id_tipodocumento`),
  CONSTRAINT `FK_TipoDoc_Cliente` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipo_documento` (`id_tipodocumento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. caja
CREATE TABLE `caja` (
  `id_caja` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `caja_diferencia` decimal(12,2) DEFAULT NULL,
  `caja_estado` enum('ABIERTA','CERRADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `caja_fecha_apertura` datetime(6) NOT NULL,
  `caja_fecha_cierre` datetime(6) DEFAULT NULL,
  `caja_monto_esperado` decimal(12,2) DEFAULT NULL,
  `caja_monto_inicial` decimal(12,2) NOT NULL,
  `caja_monto_real` decimal(12,2) DEFAULT NULL,
  `caja_observaciones` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `id_empleado` bigint NOT NULL,
  PRIMARY KEY (`id_caja`),
  KEY `FK1yfvnv9pdanq5r2u2sknfn0as` (`id_empleado`),
  KEY `idx_caja_empleado_estado` (`id_empleado`,`caja_estado`),
  CONSTRAINT `FK1yfvnv9pdanq5r2u2sknfn0as` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. movimiento_caja
CREATE TABLE `movimiento_caja` (
  `id_movimiento_caja` bigint NOT NULL AUTO_INCREMENT,
  `mov_anulado` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `mov_descripcion` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `mov_fecha` datetime(6) NOT NULL,
  `mov_metodo_pago` enum('EFECTIVO','OTRO','PLIN','TARJETA','TRANSFERENCIA','YAPE') COLLATE utf8mb4_general_ci NOT NULL,
  `mov_monto` decimal(12,2) NOT NULL,
  `mov_origen` enum('AJUSTE','APERTURA','COMPRA','GASTO','VENTA') COLLATE utf8mb4_general_ci NOT NULL,
  `mov_referencia_id` bigint DEFAULT NULL,
  `mov_referencia_tipo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mov_tipo` enum('EGRESO','INGRESO') COLLATE utf8mb4_general_ci NOT NULL,
  `id_caja` bigint NOT NULL,
  `id_empleado` bigint NOT NULL,
  PRIMARY KEY (`id_movimiento_caja`),
  KEY `FKhw08ftkmr79jqg9wsv7rrptqd` (`id_caja`),
  KEY `FKci27ljtoe58xxjwwi67y2jml9` (`id_empleado`),
  KEY `idx_movimiento_caja_caja_fecha` (`id_caja`,`mov_fecha`),
  CONSTRAINT `FKci27ljtoe58xxjwwi67y2jml9` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`),
  CONSTRAINT `FKhw08ftkmr79jqg9wsv7rrptqd` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 9. gasto
CREATE TABLE `gasto` (
  `id_gasto` bigint NOT NULL AUTO_INCREMENT,
  `id_caja` bigint NOT NULL,
  `gasto_categoria` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `gasto_descripcion` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `gasto_estado` enum('ANULADO','REGISTRADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `gasto_fecha` datetime(6) NOT NULL,
  `gasto_metodo_pago` enum('EFECTIVO','OTRO','PLIN','TARJETA','TRANSFERENCIA','YAPE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `gasto_monto` decimal(12,2) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `id_empleado` bigint NOT NULL,
  `id_movimiento_caja` bigint NOT NULL,
  PRIMARY KEY (`id_gasto`),
  UNIQUE KEY `UKjn94yeyps02ymfh5wagglop73` (`id_movimiento_caja`),
  KEY `FK_Caja_Gasto` (`id_caja`),
  KEY `FKds9uuyjmy9cj8jp88spjvfg8n` (`id_empleado`),
  KEY `idx_gasto_caja_fecha` (`id_caja`,`gasto_fecha`),
  CONSTRAINT `FK_Caja_Gasto` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`),
  CONSTRAINT `FKds9uuyjmy9cj8jp88spjvfg8n` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`),
  CONSTRAINT `FKfj6t5pjodvcshqjcs2s81i4q` FOREIGN KEY (`id_movimiento_caja`) REFERENCES `movimiento_caja` (`id_movimiento_caja`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 10. categoria
CREATE TABLE `categoria` (
  `id_categoria` bigint NOT NULL AUTO_INCREMENT,
  `categ_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `categ_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `categ_nombre` (`categ_nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 11. marca
CREATE TABLE `marca` (
  `id_marca` bigint NOT NULL AUTO_INCREMENT,
  `marca_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `marca_fecha` date DEFAULT NULL,
  `marca_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 12. unidad
CREATE TABLE `unidad` (
  `id_unidad` int NOT NULL AUTO_INCREMENT,
  `uni_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `uni_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_unidad`),
  UNIQUE KEY `uni_nombre` (`uni_nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 13. producto
CREATE TABLE `producto` (
  `id_producto` bigint NOT NULL AUTO_INCREMENT,
  `produc_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `produc_codigo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `produc_modelo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `produc_descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `produc_precio` decimal(38,2) DEFAULT NULL,
  `produc_costo` decimal(10,2) DEFAULT '0.00',
  `produc_fecha_creacion` date DEFAULT NULL,
  `produc_fecha_vencimiento` date DEFAULT NULL,
  `produc_stock` int DEFAULT '0',
  `produc_stock_minimo` int DEFAULT '1',
  `produc_estado` int NOT NULL DEFAULT '1',
  `tipo_producto` enum('ARMAZON','CRISTAL','LENTE_CONTACTO','ACCESORIO','CUIDADO_VISUAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ARMAZON',
  `id_categoria` bigint NOT NULL,
  `id_marca` bigint NOT NULL,
  `id_unidad_venta` int NOT NULL COMMENT 'Unidad en la que se vende al cliente (ej. Frasco, Unidad, Par)',
  `id_unidad_compra` int NOT NULL COMMENT 'Unidad en la que llega del proveedor (ej. Caja, Paquete)',
  `produc_factor_conversion` int NOT NULL DEFAULT '1' COMMENT 'Ej: Si la caja trae 24 frascos, el factor es 24',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `produc_visible_web` tinyint(1) NOT NULL DEFAULT '0',
  `produc_destacado` tinyint(1) NOT NULL DEFAULT '0',
  `produc_slug` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `produc_descripcion_web` text COLLATE utf8mb4_general_ci,
  `produc_orden` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `produc_slug` (`produc_slug`),
  KEY `FK_Catego_Produc` (`id_categoria`),
  KEY `FK_Marca_Produc` (`id_marca`),
  KEY `FK_UnidadVenta_Produc` (`id_unidad_venta`),
  KEY `FK_UnidadCompra_Produc` (`id_unidad_compra`),
  CONSTRAINT `FK_Catego_Produc` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  CONSTRAINT `FK_Marca_Produc` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`),
  CONSTRAINT `FK_UnidadCompra_Produc` FOREIGN KEY (`id_unidad_compra`) REFERENCES `unidad` (`id_unidad`),
  CONSTRAINT `FK_UnidadVenta_Produc` FOREIGN KEY (`id_unidad_venta`) REFERENCES `unidad` (`id_unidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 14. producto_imagen
CREATE TABLE `producto_imagen` (
  `id_imagen` bigint NOT NULL AUTO_INCREMENT,
  `id_producto` bigint NOT NULL,
  `ruta_imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 si es la portada, 0 si es galería',
  `imag_orden` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_imagen`),
  KEY `FK_Imagen_Producto` (`id_producto`),
  CONSTRAINT `FK_Imagen_Producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 15. etiqueta
CREATE TABLE `etiqueta` (
  `id_etiqueta` bigint NOT NULL AUTO_INCREMENT,
  `etiq_nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `etiq_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_etiqueta`),
  UNIQUE KEY `etiq_nombre` (`etiq_nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 16. producto_etiqueta
CREATE TABLE `producto_etiqueta` (
  `id_producto` bigint NOT NULL,
  `id_etiqueta` bigint NOT NULL,
  PRIMARY KEY (`id_producto`,`id_etiqueta`),
  KEY `fk_prod_etiq_etiqueta` (`id_etiqueta`),
  CONSTRAINT `fk_prod_etiq_etiqueta` FOREIGN KEY (`id_etiqueta`) REFERENCES `etiqueta` (`id_etiqueta`) ON DELETE CASCADE,
  CONSTRAINT `fk_prod_etiq_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 17. inventario_saldo
CREATE TABLE `inventario_saldo` (
  `id_inventario_saldo` bigint NOT NULL AUTO_INCREMENT,
  `id_producto` bigint NOT NULL,
  `inv_stock_actual` decimal(12,3) NOT NULL DEFAULT '0.000',
  `inv_stock_minimo` decimal(12,3) NOT NULL DEFAULT '0.000',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_inventario_saldo`),
  UNIQUE KEY `uk_inventario_saldo_producto` (`id_producto`),
  KEY `idx_inventario_saldo_stock_minimo` (`inv_stock_actual`,`inv_stock_minimo`),
  CONSTRAINT `fk_inventario_saldo_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 18. movimiento_inventario
CREATE TABLE `movimiento_inventario` (
  `id_movimiento_inventario` bigint NOT NULL AUTO_INCREMENT,
  `id_producto` bigint NOT NULL,
  `mov_tipo` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `mov_cantidad` decimal(12,3) NOT NULL,
  `mov_stock_previo` decimal(12,3) NOT NULL,
  `mov_stock_nuevo` decimal(12,3) NOT NULL,
  `mov_motivo` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `mov_referencia_tipo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `mov_referencia_id` bigint DEFAULT NULL,
  `id_empleado` bigint DEFAULT NULL,
  `mov_fecha` datetime(6) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_movimiento_inventario`),
  KEY `fk_movimiento_inventario_empleado` (`id_empleado`),
  KEY `idx_movimiento_inventario_producto_fecha` (`id_producto`,`mov_fecha`),
  KEY `idx_movimiento_inventario_referencia` (`mov_referencia_tipo`,`mov_referencia_id`),
  CONSTRAINT `fk_movimiento_inventario_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`),
  CONSTRAINT `fk_movimiento_inventario_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 19. proveedor
CREATE TABLE `proveedor` (
  `id_proveedor` bigint NOT NULL AUTO_INCREMENT,
  `provee_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `provee_nombre_comercial` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `provee_nacionalidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `provee_direccion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `provee_telefono` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provee_correo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provee_estado` int NOT NULL DEFAULT '1',
  `provee_ndocumento` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `id_tipodocumento` bigint NOT NULL,
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `provee_nombre` (`provee_nombre`),
  KEY `FK_TipoDoc_Proveedor` (`id_tipodocumento`),
  CONSTRAINT `FK_TipoDoc_Proveedor` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipo_documento` (`id_tipodocumento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 20. tipo_comprobante
CREATE TABLE `tipo_comprobante` (
  `id` int NOT NULL AUTO_INCREMENT,
  `correlativo_actual` int DEFAULT NULL,
  `estado` int DEFAULT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serie` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 21. compra
CREATE TABLE `compra` (
  `id_compra` bigint NOT NULL AUTO_INCREMENT,
  `estado` int NOT NULL,
  `compra_fecha` datetime(6) DEFAULT NULL,
  `compra_numero_comprobante` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `compra_subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `compra_descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT NULL,
  `id_proveedor` bigint NOT NULL,
  `id_tipo_comprobante` int DEFAULT NULL,
  `id_usuario` bigint NOT NULL,
  `id_caja` bigint DEFAULT NULL,
  `cuotas` int DEFAULT NULL,
  `deuda` decimal(12,2) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `forma_pago` enum('CONTADO','CREDITO') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `medio_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE','PLIN','OTRO') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pago_inicial` decimal(12,2) DEFAULT NULL,
  `nota_recepcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `FKo158ix00ljn91uet4xv15fq7o` (`id_proveedor`),
  KEY `FKmxy9j2xp5r9tt8b9glmt2eyax` (`id_tipo_comprobante`),
  KEY `FKg89bygbsyxpcgb83u1p46xgr4` (`id_usuario`),
  KEY `idx_compra_fecha` (`compra_fecha`),
  KEY `idx_compra_proveedor_fecha` (`id_proveedor`,`compra_fecha`),
  KEY `idx_compra_caja` (`id_caja`),
  CONSTRAINT `fk_compra_caja` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`),
  CONSTRAINT `FKg89bygbsyxpcgb83u1p46xgr4` FOREIGN KEY (`id_usuario`) REFERENCES `empleado` (`id_empleado`),
  CONSTRAINT `FKmxy9j2xp5r9tt8b9glmt2eyax` FOREIGN KEY (`id_tipo_comprobante`) REFERENCES `tipo_comprobante` (`id`),
  CONSTRAINT `FKo158ix00ljn91uet4xv15fq7o` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 22. detalle_compras
CREATE TABLE `detalle_compras` (
  `id_compra` bigint NOT NULL,
  `id_producto` bigint NOT NULL,
  `amount` decimal(12,3) NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `factor_conversion_aplicado` int NOT NULL DEFAULT '1',
  `cantidad_inventario` decimal(12,3) NOT NULL DEFAULT '0.000',
  `precio` decimal(12,2) NOT NULL,
  `stock_actual` decimal(12,3) NOT NULL,
  `stock_previo` decimal(12,3) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `cantidad_recibida` decimal(12,3) DEFAULT '0.000',
  PRIMARY KEY (`id_compra`,`id_producto`),
  KEY `FKc63p8dvdpsuniib9axx8j6i4l` (`id_producto`),
  CONSTRAINT `FKc63p8dvdpsuniib9axx8j6i4l` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `FKnqbfy3qgk6t914vr73idr5ggq` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 23. cotizacion
CREATE TABLE `cotizacion` (
  `id_cotizacion` bigint NOT NULL AUTO_INCREMENT,
  `coti_cliente_nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `coti_cliente_documento` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `coti_cliente_telefono` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `coti_cliente_correo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `coti_total_estimado` decimal(12,2) NOT NULL DEFAULT '0.00',
  `coti_estado` varchar(30) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDIENTE',
  `coti_fecha_creacion` datetime(6) NOT NULL,
  `coti_observaciones` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `id_cliente_usuario` bigint DEFAULT NULL,
  `coti_direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_cotizacion`),
  KEY `fk_coti_cliente_usuario` (`id_cliente_usuario`),
  CONSTRAINT `fk_coti_cliente_usuario` FOREIGN KEY (`id_cliente_usuario`) REFERENCES `cliente` (`id_cliente`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 24. cotizacion_detalle
CREATE TABLE `cotizacion_detalle` (
  `id_cotizacion_detalle` bigint NOT NULL AUTO_INCREMENT,
  `id_cotizacion` bigint NOT NULL,
  `id_producto` bigint NOT NULL,
  `coti_cantidad` int NOT NULL,
  `coti_precio_lista` decimal(12,2) NOT NULL,
  `coti_subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_cotizacion_detalle`),
  KEY `fk_detalle_cotizacion` (`id_cotizacion`),
  KEY `fk_detalle_producto` (`id_producto`),
  CONSTRAINT `fk_detalle_cotizacion` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id_cotizacion`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 25. venta
CREATE TABLE `venta` (
  `id_venta` bigint NOT NULL AUTO_INCREMENT,
  `id_cliente` bigint NOT NULL,
  `cuotas` int DEFAULT NULL,
  `deuda` decimal(12,2) DEFAULT NULL,
  `estado` int NOT NULL,
  `pago_inicial` decimal(12,2) DEFAULT NULL,
  `total` decimal(12,2) DEFAULT NULL,
  `id_tipo_comprobante` int DEFAULT NULL,
  `id_usuario` bigint NOT NULL,
  `id_caja` bigint DEFAULT NULL,
  `venta_fecha` datetime(6) DEFAULT NULL,
  `venta_numero_comprobante` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `venta_subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `venta_descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `venta_observaciones` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `forma_pago` varchar(50) DEFAULT NULL,
  `medio_pago` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_cotizacion` bigint DEFAULT NULL,
  PRIMARY KEY (`id_venta`),
  KEY `FK_Cliente_Venta` (`id_cliente`),
  KEY `FKeofpgsq7k2s96kmc102p79y0a` (`id_tipo_comprobante`),
  KEY `FKngd2by0oq0noh796aom37hcj` (`id_usuario`),
  KEY `idx_venta_fecha` (`venta_fecha`),
  KEY `idx_venta_cliente_fecha` (`id_cliente`,`venta_fecha`),
  KEY `idx_venta_caja` (`id_caja`),
  KEY `fk_venta_cotizacion` (`id_cotizacion`),
  CONSTRAINT `FK_Cliente_Venta` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `fk_venta_caja` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`),
  CONSTRAINT `fk_venta_cotizacion` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id_cotizacion`) ON DELETE SET NULL,
  CONSTRAINT `FKeofpgsq7k2s96kmc102p79y0a` FOREIGN KEY (`id_tipo_comprobante`) REFERENCES `tipo_comprobante` (`id`),
  CONSTRAINT `FKngd2by0oq0noh796aom37hcj` FOREIGN KEY (`id_usuario`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 26. detalle_ventas
CREATE TABLE `detalle_ventas` (
  `id_producto` bigint NOT NULL,
  `id_venta` bigint NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `precio` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `stock_previo` decimal(12,3) NOT NULL DEFAULT '0.000',
  `stock_actual` decimal(12,3) NOT NULL DEFAULT '0.000',
  `descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_producto`,`id_venta`),
  KEY `FKkmoe7spkf9amgos61a18xs147` (`id_venta`),
  CONSTRAINT `FKeksv16ui7t2k5alv3efkrvc6c` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `FKkmoe7spkf9amgos61a18xs147` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 27. receta_clinica
CREATE TABLE `receta_clinica` (
  `id_receta` bigint NOT NULL AUTO_INCREMENT,
  `id_cliente` bigint NOT NULL,
  `id_empleado` bigint NOT NULL,
  `fecha_evaluacion` datetime(6) NOT NULL,
  `od_esfera` decimal(5,2) DEFAULT NULL,
  `od_cilindro` decimal(5,2) DEFAULT NULL,
  `od_eje` int DEFAULT NULL,
  `od_av_lejos` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `od_av_cerca` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `oi_esfera` decimal(5,2) DEFAULT NULL,
  `oi_cilindro` decimal(5,2) DEFAULT NULL,
  `oi_eje` int DEFAULT NULL,
  `oi_av_lejos` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `oi_av_cerca` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `distancia_pupilar` decimal(5,2) DEFAULT NULL,
  `adicion` decimal(5,2) DEFAULT NULL,
  `tipo_luna` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `material_sugerido` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_receta`),
  KEY `fk_receta_cliente` (`id_cliente`),
  KEY `fk_receta_empleado` (`id_empleado`),
  CONSTRAINT `fk_receta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `fk_receta_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 28. receta_tratamiento
CREATE TABLE `receta_tratamiento` (
  `id_receta` bigint NOT NULL,
  `tratamiento` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_receta`,`tratamiento`),
  CONSTRAINT `fk_tratamiento_receta` FOREIGN KEY (`id_receta`) REFERENCES `receta_clinica` (`id_receta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 29. orden_laboratorio
CREATE TABLE `orden_laboratorio` (
  `id_orden` bigint NOT NULL AUTO_INCREMENT,
  `id_venta` bigint NOT NULL,
  `id_receta` bigint NOT NULL,
  `estado_orden` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDIENTE',
  `fecha_promesa_entrega` date DEFAULT NULL,
  `laboratorio_nombre` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_general_ci,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_orden`),
  KEY `fk_orden_venta` (`id_venta`),
  KEY `fk_orden_receta` (`id_receta`),
  CONSTRAINT `fk_orden_receta` FOREIGN KEY (`id_receta`) REFERENCES `receta_clinica` (`id_receta`),
  CONSTRAINT `fk_orden_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 30. web_config
CREATE TABLE `web_config` (
  `id_web_config` bigint NOT NULL AUTO_INCREMENT,
  `web_logo_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `web_telefono_contacto` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `web_correo_contacto` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `web_direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `web_horario_atencion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `web_enlace_facebook` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `web_enlace_instagram` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `web_enlace_tiktok` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_web_config`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 31. web_carousel_imagen
CREATE TABLE `web_carousel_imagen` (
  `id_web_carousel_imagen` bigint NOT NULL AUTO_INCREMENT,
  `id_web_config` bigint NOT NULL,
  `imag_url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `imag_orden` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_web_carousel_imagen`),
  KEY `fk_carousel_web_config` (`id_web_config`),
  CONSTRAINT `fk_carousel_web_config` FOREIGN KEY (`id_web_config`) REFERENCES `web_config` (`id_web_config`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
