-- Active: 1776392829242@@127.0.0.1@3306@optica
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-04-2026 a las 08:21:14
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `ajustes` (
  `id` bigint(20) NOT NULL,
  `clave` varchar(255) DEFAULT NULL,
  `valor` varchar(1024) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `ajustes` (`id`, `clave`, `valor`) VALUES
(1, 'nombre', 'MULTI SOLUCIONES R & V S.A.C.'),
(2, 'direccion', 'CAL.SANTA ROSA DE LIMA NRO. 355 P.J.  SANTA ROSA DE LIMA'),
(3, 'ruc', '20607693588'),
(4, 'logo', '9cdeaa7f5f85977fd3ecb49b78eeb379_Logo_SinFondo.png'),
(5, 'sliders', '');

CREATE TABLE `caja` (
  `id_caja` bigint(20) NOT NULL,
  `fecha_apertura` datetime(6) NOT NULL,
  `fecha_cierre` datetime(6) DEFAULT NULL,
  `monto_inicial` decimal(10,2) NOT NULL,
  `total_ventas_efectivo` decimal(10,2) DEFAULT 0.00,
  `total_gastos` decimal(10,2) DEFAULT 0.00,
  `monto_final_esperado` decimal(10,2) DEFAULT 0.00,
  `monto_final_real` decimal(10,2) DEFAULT 0.00,
  `diferencia` decimal(10,2) DEFAULT 0.00,
  `estado` varchar(20) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `id_usuario` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `categoria` (
  `id_categoria` bigint(20) NOT NULL,
  `categ_nombre` varchar(100) NOT NULL,
  `categ_estado` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categoria` (`id_categoria`, `categ_nombre`, `categ_estado`) VALUES
(1, 'Niños', 1),
(2, 'Hombre', 1),
(3, 'Mujer', 1),
(4, 'Unisex', 1);

CREATE TABLE `cliente` (
  `id_cliente` bigint(20) NOT NULL,
  `cli_nombre` varchar(100) NOT NULL,
  `cli_apellido_paterno` varchar(255) DEFAULT NULL,
  `cli_apellido_materno` varchar(255) DEFAULT NULL,
  `cli_correo` varchar(255) DEFAULT NULL,
  `cli_telefono` varchar(255) DEFAULT NULL,
  `cli_direccion` varchar(255) NOT NULL,
  `cli_estado` int(11) NOT NULL DEFAULT 1,
  `cli_ndocumento` varchar(20) NOT NULL,
  `id_tipodocumento` bigint(20) NOT NULL,
  `cli_nombre_empresa` varchar(100) DEFAULT NULL,
  `cli_direccion_empresa` varchar(100) DEFAULT NULL,
  `cli_clave` varchar(255) DEFAULT NULL,
  `token_reseteo` varchar(255) DEFAULT NULL,
  `token_reseteo_expira` datetime(6) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `cliente` (`id_cliente`, `cli_nombre`, `cli_apellido_paterno`, `cli_apellido_materno`, `cli_correo`, `cli_telefono`, `cli_direccion`, `cli_estado`, `cli_ndocumento`, `id_tipodocumento`, `cli_nombre_empresa`, `cli_direccion_empresa`, `cli_clave`, `token_reseteo`, `token_reseteo_expira`) VALUES
(1, 'Clientes Varios', '', '', '', '', '', 1, '99999999', 1, NULL, NULL, NULL, NULL, NULL);

CREATE TABLE `compra` (
  `id_compra` bigint(20) NOT NULL,
  `estado` int(11) NOT NULL,
  `compra_fecha` datetime(6) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `id_proveedor` bigint(20) NOT NULL,
  `id_tipo_comprobante` int(11) DEFAULT NULL,
  `id_usuario` bigint(20) NOT NULL,
  `cuotas` int(11) DEFAULT NULL,
  `deuda` decimal(10,2) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `forma_pago` enum('CONTADO','CREDITO') DEFAULT NULL,
  `medio_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE') DEFAULT NULL,
  `pago_inicial` decimal(10,2) DEFAULT NULL,
  `nota_recepcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `compra_pagos_credito_detalle` (
  `id_compra_pago_detalle` bigint(20) NOT NULL,
  `comentarios` varchar(255) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_pago` datetime(6) DEFAULT NULL,
  `fecha_vencimiento` date NOT NULL,
  `medio_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE') DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `monto_pagado` decimal(10,2) DEFAULT NULL,
  `numero_cuota` int(11) NOT NULL,
  `id_compra` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cotizacion` (
  `id_cotizacion` bigint(20) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `telefono_contacto` varchar(15) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `id_cliente` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cotizacion_detalle` (
  `id_cotizacion_detalle` bigint(20) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `id_cotizacion` bigint(20) NOT NULL,
  `id_producto` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `detalle_compras` (
  `id_compra` bigint(20) NOT NULL,
  `id_producto` bigint(20) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock_actual` int(11) NOT NULL,
  `stock_previo` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `cantidad_recibida` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `detalle_ventas` (
  `id_producto` bigint(20) NOT NULL,
  `id_venta` bigint(20) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `descuento` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `empleado` (
  `id_empleado` bigint(20) NOT NULL,
  `emple_nombre` varchar(100) NOT NULL,
  `emple_nombreuser` varchar(50) NOT NULL,
  `emple_apellido_paterno` varchar(100) NOT NULL,
  `emple_apellido_materno` varchar(100) NOT NULL,
  `emple_correo` varchar(60) NOT NULL,
  `emple_contrasena` varchar(150) NOT NULL,
  `emple_telefono` varchar(9) NOT NULL,
  `emple_direccion` varchar(100) NOT NULL,
  `emple_estado` int(11) NOT NULL DEFAULT 1,
  `emple_ndocumento` varchar(20) NOT NULL,
  `id_tipodocumento` bigint(20) NOT NULL,
  `id_perfil` bigint(20) NOT NULL,
  `id_empresa` bigint(20) NOT NULL DEFAULT 1,
  `token_reseteo` varchar(255) DEFAULT NULL,
  `token_reseteo_expira` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `empresa` (
  `id_empresa` bigint(20) NOT NULL,
  `empresa_nombre` varchar(100) NOT NULL,
  `empresa_direccion` varchar(100) NOT NULL,
  `empresa_ruc` varchar(11) NOT NULL,
  `empresa_logo` varchar(255) NOT NULL,
  `empresa_sidebar` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `empresa` (`id_empresa`, `empresa_nombre`, `empresa_direccion`, `empresa_ruc`, `empresa_logo`, `empresa_sidebar`) VALUES
(1, 'MULTI SOLUCIONES R & V S.A.C.', 'CAL.SANTA ROSA DE LIMA NRO. 355 P.J.  SANTA ROSA DE LIMA', '20607693588', '173e8f21-e429-4432-a441-d9dd46761622_opt_logo.jpg', '');

CREATE TABLE `empresa_sidebar_imagen` (
  `id_imagen` bigint(20) NOT NULL,
  `ruta_imagen` varchar(255) NOT NULL,
  `id_empresa` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE `forma_pago` (
  `id_fpago` bigint(20) NOT NULL,
  `fpago_metodo` varchar(15) DEFAULT NULL,
  `fpago_estado` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `forma_pago` (`id_fpago`, `fpago_metodo`, `fpago_estado`) VALUES
(1, 'Tarjeta de Cred', 1),
(2, 'Efectivo', 1),
(3, 'Pago Movil', 1);

CREATE TABLE `gasto` (
  `id_gasto` bigint(20) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `id_caja` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `marca` (
  `id_marca` bigint(20) NOT NULL,
  `marca_nombre` varchar(100) NOT NULL,
  `marca_fecha` date DEFAULT NULL,
  `marca_estado` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `opcion` (
  `id_opcion` bigint(20) NOT NULL,
  `opcion_nombre` varchar(100) NOT NULL,
  `opcion_ruta` varchar(100) DEFAULT NULL,
  `opcion_icon` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `opcion` (`id_opcion`, `opcion_nombre`, `opcion_ruta`, `opcion_icon`) VALUES
(1, 'Dashboard', '/', NULL),
(2, 'Configuración', '/empresa/configuracion', NULL),
(3, 'Listar Usuarios', '/usuarios/listar', NULL),
(4, 'Perfiles', '/usuarios/perfiles/listar', NULL),
(5, 'Clientes', '/clientes/listar', NULL),
(6, 'Listar Productos', '/productos/listar', NULL),
(7, 'Categorías', '/productos/categorias/listar', NULL),
(8, 'Marcas', '/productos/marcas/listar', NULL),
(9, 'Unidad', '/productos/unidades/listar', NULL),
(10, 'Listar Proveedores', '/proveedores/listar', NULL),
(11, 'Ordenes de Compra', '/compras/listar', NULL),
(12, 'Movimientos', '/inventario/listar', NULL),
(13, 'Ventas', '/ventas/listar', NULL),
(14, 'Gestión de Cotizacion', '/ventas/cotizacion/listar', NULL);

CREATE TABLE `orden_laboratorio` (
  `id_orden` bigint(20) NOT NULL,
  `id_venta` bigint(20) NOT NULL,
  `id_receta` bigint(20) NOT NULL,
  `estado_orden` enum('PENDIENTE','ENVIADO_LABORATORIO','RECIBIDO_TIENDA','ENTREGADO_CLIENTE') NOT NULL DEFAULT 'PENDIENTE',
  `fecha_promesa_entrega` date DEFAULT NULL,
  `laboratorio_nombre` varchar(150) DEFAULT NULL,
  `notas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pagos_credito_detalle` (
  `id_pago_detalle` bigint(20) NOT NULL,
  `comentarios` varchar(255) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_pago` datetime(6) DEFAULT NULL,
  `fecha_vencimiento` date NOT NULL,
  `medio_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE') DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `monto_pagado` decimal(10,2) DEFAULT NULL,
  `numero_cuota` int(11) NOT NULL,
  `id_venta` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `perfil` (
  `id_perfil` bigint(20) NOT NULL,
  `perfil_nombre` varchar(50) NOT NULL,
  `perfil_descripcion` varchar(255) DEFAULT NULL,
  `perfil_estado` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `perfil` (`id_perfil`, `perfil_nombre`, `perfil_descripcion`, `perfil_estado`) VALUES
(1, 'Administrador', 'Acceso total al sistema.', 1),
(2, 'Editor', 'Puede gestionar usuarios pero no perfiles.', 1),
(3, 'Supervisor', 'Solo puede visualizar información.', 1),
(4, 'Cliente', 'Solo puede ver los catálogos y realizar compras.', 2);

CREATE TABLE `perfil_opcion` (
  `id_perfil` bigint(20) NOT NULL,
  `id_opcion` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `perfil_opcion` (`id_perfil`, `id_opcion`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(2, 1),
(2, 2),
(3, 1),
(4, 7),
(4, 8);

CREATE TABLE `producto` (
  `id_producto` bigint(20) NOT NULL,
  `produc_nombre` varchar(255) NOT NULL,
  `produc_codigo` varchar(255) NOT NULL,
  `produc_modelo` varchar(255) DEFAULT NULL,
  `produc_descripcion` varchar(255) NOT NULL,
  `produc_precio` decimal(38,2) DEFAULT NULL,
  `produc_fecha_creacion` date DEFAULT NULL,
  `produc_fecha_vencimiento` date DEFAULT NULL,
  `produc_stock` int(11) DEFAULT 0,
  `produc_stock_minimo` int(11) DEFAULT 1,
  `produc_estado` int(11) NOT NULL DEFAULT 1,
  `tipo_producto` enum('ARMAZON','CRISTAL','LENTE_CONTACTO','ACCESORIO') NOT NULL DEFAULT 'ARMAZON',
  `id_unidad` int(11) NOT NULL,
  `id_categoria` bigint(20) NOT NULL,
  `id_marca` bigint(20) NOT NULL,
  `produc_costo` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `producto_imagen` (
  `id_imagen` bigint(20) NOT NULL,
  `id_producto` bigint(20) NOT NULL,
  `ruta_imagen` varchar(255) NOT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 si es la portada, 0 si es galería'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `proveedor` (
  `id_proveedor` bigint(20) NOT NULL,
  `provee_nombre` varchar(100) NOT NULL,
  `provee_nombre_comercial` varchar(100) NOT NULL,
  `provee_nacionalidad` varchar(100) NOT NULL,
  `provee_direccion` varchar(100) NOT NULL,
  `provee_telefono` varchar(255) DEFAULT NULL,
  `provee_correo` varchar(255) DEFAULT NULL,
  `provee_correo_adicional` varchar(150) DEFAULT NULL,
  `provee_estado` int(11) NOT NULL DEFAULT 1,
  `provee_ndocumento` varchar(11) NOT NULL,
  `id_tipodocumento` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `receta_clinica` (
  `id_receta` bigint(20) NOT NULL,
  `id_cliente` bigint(20) NOT NULL,
  `id_empleado` bigint(20) NOT NULL COMMENT 'El optometrista que evaluó',
  `fecha_evaluacion` datetime(6) NOT NULL,
  `od_esfera` decimal(5,2) DEFAULT NULL COMMENT 'Ojo Derecho Esfera',
  `od_cilindro` decimal(5,2) DEFAULT NULL COMMENT 'Ojo Derecho Cilindro',
  `od_eje` int(11) DEFAULT NULL COMMENT 'Ojo Derecho Eje',
  `oi_esfera` decimal(5,2) DEFAULT NULL COMMENT 'Ojo Izquierdo Esfera',
  `oi_cilindro` decimal(5,2) DEFAULT NULL COMMENT 'Ojo Izquierdo Cilindro',
  `oi_eje` int(11) DEFAULT NULL COMMENT 'Ojo Izquierdo Eje',
  `distancia_pupilar` decimal(5,2) DEFAULT NULL,
  `adicion` decimal(5,2) DEFAULT NULL COMMENT 'Para lentes bifocales/progresivos',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_comprobante` (
  `id` int(11) NOT NULL,
  `correlativo_actual` int(11) DEFAULT NULL,
  `estado` int(11) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `serie` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tipo_comprobante` (`id`, `correlativo_actual`, `estado`, `nombre`, `serie`) VALUES
(1, 12, 1, 'NOTA DE VENTA', 'N001'),
(2, 5, 1, 'BOLETA', 'B001'),
(3, 5, 1, 'FACTURA', 'F001');

CREATE TABLE `tipo_documento` (
  `id_tipodocumento` bigint(20) NOT NULL,
  `tipodoc_nombre` varchar(255) DEFAULT NULL,
  `tipodoc_estado` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tipo_documento` (`id_tipodocumento`, `tipodoc_nombre`, `tipodoc_estado`) VALUES
(1, 'DNI', 1),
(2, 'RUC', 1),
(3, 'Carné de Extranjería', 1);

CREATE TABLE `tipo_venta` (
  `id_tipoventa` bigint(20) NOT NULL,
  `tipoventa_nombre` varchar(50) NOT NULL,
  `tipoventa_estado` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tipo_venta` (`id_tipoventa`, `tipoventa_nombre`, `tipoventa_estado`) VALUES
(1, 'Al contado', 1),
(2, 'Al Crédito', 1);

CREATE TABLE `unidad` (
  `id_unidad` int(11) NOT NULL,
  `uni_nombre` varchar(255) NOT NULL,
  `uni_estado` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `unidad` (`id_unidad`, `uni_nombre`, `uni_estado`) VALUES
(1, 'Unidades', 1);

CREATE TABLE `venta` (
  `id_venta` bigint(20) NOT NULL,
  `id_cliente` bigint(20) NOT NULL,
  `cuotas` int(11) DEFAULT NULL,
  `deuda` decimal(10,2) DEFAULT NULL,
  `estado` int(11) NOT NULL,
  `fecha` datetime(6) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `forma_pago` enum('CONTADO','CREDITO') DEFAULT NULL,
  `medio_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE') DEFAULT NULL,
  `numero_documento` varchar(20) DEFAULT NULL,
  `pago_inicial` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `id_tipo_comprobante` int(11) DEFAULT NULL,
  `id_usuario` bigint(20) NOT NULL,
  `venta_fecha` datetime(6) DEFAULT NULL,
  `id_cotizacion` bigint(20) DEFAULT NULL,
  `tasa_interes` decimal(5,2) DEFAULT 0.00,
  `evaluacion_crediticia` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `ajustes`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `caja`
  ADD PRIMARY KEY (`id_caja`),
  ADD KEY `FK_Usuario_Caja` (`id_usuario`);

ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `categ_nombre` (`categ_nombre`);

ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD KEY `FK_TipoDoc_Cliente` (`id_tipodocumento`);

ALTER TABLE `compra`
  ADD PRIMARY KEY (`id_compra`),
  ADD KEY `FKo158ix00ljn91uet4xv15fq7o` (`id_proveedor`),
  ADD KEY `FKmxy9j2xp5r9tt8b9glmt2eyax` (`id_tipo_comprobante`),
  ADD KEY `FKg89bygbsyxpcgb83u1p46xgr4` (`id_usuario`);

ALTER TABLE `compra_pagos_credito_detalle`
  ADD PRIMARY KEY (`id_compra_pago_detalle`),
  ADD KEY `FKloxsysuld0jk0h3sa71jhk9n8` (`id_compra`);

ALTER TABLE `cotizacion`
  ADD PRIMARY KEY (`id_cotizacion`),
  ADD KEY `FKnr8oxstwxh7rpntt36t01nxd` (`id_cliente`);

ALTER TABLE `cotizacion_detalle`
  ADD PRIMARY KEY (`id_cotizacion_detalle`),
  ADD KEY `FKgh9i74gdpkvai7t9uyq2c73v8` (`id_cotizacion`),
  ADD KEY `FKgtt14qis5y1ugjieivup0hpa` (`id_producto`);

ALTER TABLE `detalle_compras`
  ADD PRIMARY KEY (`id_compra`,`id_producto`),
  ADD KEY `FKc63p8dvdpsuniib9axx8j6i4l` (`id_producto`);

ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id_producto`,`id_venta`),
  ADD KEY `FKkmoe7spkf9amgos61a18xs147` (`id_venta`);

ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id_empleado`),
  ADD UNIQUE KEY `emple_nombreuser` (`emple_nombreuser`),
  ADD UNIQUE KEY `emple_correo` (`emple_correo`),
  ADD UNIQUE KEY `emple_telefono` (`emple_telefono`),
  ADD UNIQUE KEY `emple_ndocumento` (`emple_ndocumento`),
  ADD KEY `FK_TipoDoc_Empleado` (`id_tipodocumento`),
  ADD KEY `FK_Perfil_Empleado` (`id_perfil`),
  ADD KEY `FK_Empresa_Empleado` (`id_empresa`);

ALTER TABLE `empresa`
  ADD PRIMARY KEY (`id_empresa`);

ALTER TABLE `empresa_sidebar_imagen`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `FK_Empresa_Sidebar` (`id_empresa`);

ALTER TABLE `forma_pago`
  ADD PRIMARY KEY (`id_fpago`),
  ADD UNIQUE KEY `fpago_metodo` (`fpago_metodo`);

ALTER TABLE `gasto`
  ADD PRIMARY KEY (`id_gasto`),
  ADD KEY `FK_Caja_Gasto` (`id_caja`);

ALTER TABLE `marca`
  ADD PRIMARY KEY (`id_marca`);

ALTER TABLE `opcion`
  ADD PRIMARY KEY (`id_opcion`);

ALTER TABLE `orden_laboratorio`
  ADD PRIMARY KEY (`id_orden`),
  ADD KEY `FK_OrdenLab_Venta` (`id_venta`),
  ADD KEY `FK_OrdenLab_Receta` (`id_receta`);

ALTER TABLE `pagos_credito_detalle`
  ADD PRIMARY KEY (`id_pago_detalle`),
  ADD KEY `FKqqmd90c5e7abf82oaa8052y7u` (`id_venta`);

ALTER TABLE `perfil`
  ADD PRIMARY KEY (`id_perfil`),
  ADD UNIQUE KEY `perfil_nombre` (`perfil_nombre`);

ALTER TABLE `perfil_opcion`
  ADD PRIMARY KEY (`id_perfil`,`id_opcion`),
  ADD KEY `FK_Opcion` (`id_opcion`);

ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `FK_Unidad_Produc` (`id_unidad`),
  ADD KEY `FK_Catego_Produc` (`id_categoria`),
  ADD KEY `FK_Marca_Produc` (`id_marca`);

ALTER TABLE `producto_imagen`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `FK_Imagen_Producto` (`id_producto`);

ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `provee_nombre` (`provee_nombre`),
  ADD KEY `FK_TipoDoc_Proveedor` (`id_tipodocumento`);

ALTER TABLE `receta_clinica`
  ADD PRIMARY KEY (`id_receta`),
  ADD KEY `FK_Receta_Cliente` (`id_cliente`),
  ADD KEY `FK_Receta_Empleado` (`id_empleado`);

ALTER TABLE `tipo_comprobante`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tipo_documento`
  ADD PRIMARY KEY (`id_tipodocumento`),
  ADD UNIQUE KEY `tipodoc_nombre` (`tipodoc_nombre`);

ALTER TABLE `tipo_venta`
  ADD PRIMARY KEY (`id_tipoventa`),
  ADD UNIQUE KEY `tipoventa_nombre` (`tipoventa_nombre`);

ALTER TABLE `unidad`
  ADD PRIMARY KEY (`id_unidad`),
  ADD UNIQUE KEY `uni_nombre` (`uni_nombre`);

ALTER TABLE `venta`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `FK_Cliente_Venta` (`id_cliente`),
  ADD KEY `FKeofpgsq7k2s96kmc102p79y0a` (`id_tipo_comprobante`),
  ADD KEY `FKngd2by0oq0noh796aom37hcj` (`id_usuario`),
  ADD KEY `FKrpki5motc0ftufmsd3kvv0qbb` (`id_cotizacion`);

ALTER TABLE `ajustes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;
ALTER TABLE `caja`
  MODIFY `id_caja` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `categoria`
  MODIFY `id_categoria` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cliente`
  MODIFY `id_cliente` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `compra`
  MODIFY `id_compra` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `compra_pagos_credito_detalle`
  MODIFY `id_compra_pago_detalle` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cotizacion`
  MODIFY `id_cotizacion` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cotizacion_detalle`
  MODIFY `id_cotizacion_detalle` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `empleado`
  MODIFY `id_empleado` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `empresa_sidebar_imagen`
  MODIFY `id_imagen` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `forma_pago`
  MODIFY `id_fpago` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `gasto`
  MODIFY `id_gasto` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `marca`
  MODIFY `id_marca` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `opcion`
  MODIFY `id_opcion` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `orden_laboratorio`
  MODIFY `id_orden` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `pagos_credito_detalle`
  MODIFY `id_pago_detalle` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `perfil`
  MODIFY `id_perfil` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `producto`
  MODIFY `id_producto` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `producto_imagen`
  MODIFY `id_imagen` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `proveedor`
  MODIFY `id_proveedor` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `receta_clinica`
  MODIFY `id_receta` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tipo_comprobante`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tipo_documento`
  MODIFY `id_tipodocumento` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tipo_venta`
  MODIFY `id_tipoventa` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `unidad`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `venta`
  MODIFY `id_venta` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `caja`
  ADD CONSTRAINT `FK_Usuario_Caja` FOREIGN KEY (`id_usuario`) REFERENCES `empleado` (`id_empleado`);

ALTER TABLE `cliente`
  ADD CONSTRAINT `FK_TipoDoc_Cliente` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipo_documento` (`id_tipodocumento`);

ALTER TABLE `compra`
  ADD CONSTRAINT `FKg89bygbsyxpcgb83u1p46xgr4` FOREIGN KEY (`id_usuario`) REFERENCES `empleado` (`id_empleado`),
  ADD CONSTRAINT `FKmxy9j2xp5r9tt8b9glmt2eyax` FOREIGN KEY (`id_tipo_comprobante`) REFERENCES `tipo_comprobante` (`id`),
  ADD CONSTRAINT `FKo158ix00ljn91uet4xv15fq7o` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`);

ALTER TABLE `compra_pagos_credito_detalle`
  ADD CONSTRAINT `FKloxsysuld0jk0h3sa71jhk9n8` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`);

ALTER TABLE `cotizacion`
  ADD CONSTRAINT `FKnr8oxstwxh7rpntt36t01nxd` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);

ALTER TABLE `cotizacion_detalle`
  ADD CONSTRAINT `FKgh9i74gdpkvai7t9uyq2c73v8` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id_cotizacion`),
  ADD CONSTRAINT `FKgtt14qis5y1ugjieivup0hpa` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

ALTER TABLE `detalle_compras`
  ADD CONSTRAINT `FKc63p8dvdpsuniib9axx8j6i4l` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  ADD CONSTRAINT `FKnqbfy3qgk6t914vr73idr5ggq` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`);

ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `FKeksv16ui7t2k5alv3efkrvc6c` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  ADD CONSTRAINT `FKkmoe7spkf9amgos61a18xs147` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`);

ALTER TABLE `empleado`
  ADD CONSTRAINT `FK_Perfil_Empleado` FOREIGN KEY (`id_perfil`) REFERENCES `perfil` (`id_perfil`),
  ADD CONSTRAINT `FK_TipoDoc_Empleado` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipo_documento` (`id_tipodocumento`),
  ADD CONSTRAINT `FKaph0gjj93d3xrkx7ixnua3hny` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

ALTER TABLE `empresa_sidebar_imagen`
  ADD CONSTRAINT `FK_Empresa_Sidebar` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

ALTER TABLE `gasto`
  ADD CONSTRAINT `FK_Caja_Gasto` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`);

ALTER TABLE `orden_laboratorio`
  ADD CONSTRAINT `FK_OrdenLab_Receta` FOREIGN KEY (`id_receta`) REFERENCES `receta_clinica` (`id_receta`),
  ADD CONSTRAINT `FK_OrdenLab_Venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`);

ALTER TABLE `pagos_credito_detalle`
  ADD CONSTRAINT `FKqqmd90c5e7abf82oaa8052y7u` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`);

ALTER TABLE `perfil_opcion`
  ADD CONSTRAINT `FK_Opcion` FOREIGN KEY (`id_opcion`) REFERENCES `opcion` (`id_opcion`),
  ADD CONSTRAINT `FK_Perfil` FOREIGN KEY (`id_perfil`) REFERENCES `perfil` (`id_perfil`);

ALTER TABLE `producto`
  ADD CONSTRAINT `FK_Catego_Produc` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  ADD CONSTRAINT `FK_Marca_Produc` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`),
  ADD CONSTRAINT `FK_Unidad_Produc` FOREIGN KEY (`id_unidad`) REFERENCES `unidad` (`id_unidad`);

ALTER TABLE `producto_imagen`
  ADD CONSTRAINT `FK_Imagen_Producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

ALTER TABLE `proveedor`
  ADD CONSTRAINT `FK_TipoDoc_Proveedor` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipo_documento` (`id_tipodocumento`);

ALTER TABLE `receta_clinica`
  ADD CONSTRAINT `FK_Receta_Cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `FK_Receta_Empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);

ALTER TABLE `venta`
  ADD CONSTRAINT `FK_Cliente_Venta` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `FKeofpgsq7k2s96kmc102p79y0a` FOREIGN KEY (`id_tipo_comprobante`) REFERENCES `tipo_comprobante` (`id`),
  ADD CONSTRAINT `FKngd2by0oq0noh796aom37hcj` FOREIGN KEY (`id_usuario`) REFERENCES `empleado` (`id_empleado`),
  ADD CONSTRAINT `FKrpki5motc0ftufmsd3kvv0qbb` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id_cotizacion`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
