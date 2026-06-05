/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: optica
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `caja`
--

DROP TABLE IF EXISTS `caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `caja` (
  `id_caja` bigint NOT NULL AUTO_INCREMENT,
  `fecha_apertura` datetime(6) NOT NULL,
  `fecha_cierre` datetime(6) DEFAULT NULL,
  `monto_inicial` decimal(10,2) NOT NULL,
  `total_ventas_efectivo` decimal(10,2) DEFAULT '0.00',
  `total_gastos` decimal(10,2) DEFAULT '0.00',
  `monto_final_esperado` decimal(10,2) DEFAULT '0.00',
  `monto_final_real` decimal(10,2) DEFAULT '0.00',
  `diferencia` decimal(10,2) DEFAULT '0.00',
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `observaciones` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_usuario` bigint NOT NULL,
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
  KEY `FK_Usuario_Caja` (`id_usuario`),
  KEY `FK1yfvnv9pdanq5r2u2sknfn0as` (`id_empleado`),
  KEY `idx_caja_empleado_estado` (`id_empleado`,`caja_estado`),
  CONSTRAINT `FK1yfvnv9pdanq5r2u2sknfn0as` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`),
  CONSTRAINT `FK_Usuario_Caja` FOREIGN KEY (`id_usuario`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caja`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `caja` WRITE;
/*!40000 ALTER TABLE `caja` DISABLE KEYS */;
/*!40000 ALTER TABLE `caja` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` bigint NOT NULL AUTO_INCREMENT,
  `categ_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `categ_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `categ_nombre` (`categ_nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES
(1,'Niños',1),
(2,'Hombre',1),
(3,'Mujer',1),
(4,'Unisex',1);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  PRIMARY KEY (`id_cliente`),
  KEY `FK_TipoDoc_Cliente` (`id_tipodocumento`),
  CONSTRAINT `FK_TipoDoc_Cliente` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipo_documento` (`id_tipodocumento`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES
(1,'Clientes Varios',NULL,NULL,NULL,NULL,' ',1,'99999999',1,NULL,NULL,'2026-04-20 00:51:59','2026-04-20 00:51:59'),
(2,'ROGER PAUL','VELASCO','ZAPATA','rogervz.1710@gmail.com','729348888','CALLE SANTA ROSA 355',1,'72934888',1,NULL,NULL,'2026-05-19 09:07:54','2026-05-19 09:07:54');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `compra`
--

DROP TABLE IF EXISTS `compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra` (
  `id_compra` bigint NOT NULL AUTO_INCREMENT,
  `estado` int NOT NULL,
  `compra_fecha` datetime(6) DEFAULT NULL,
  `compra_numero_comprobante` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
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
  `medio_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE','PLIN','OTRO') COLLATE utf8mb4_general_ci DEFAULT NULL,
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `compra` WRITE;
/*!40000 ALTER TABLE `compra` DISABLE KEYS */;
/*!40000 ALTER TABLE `compra` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cotizacion`
--

DROP TABLE IF EXISTS `cotizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizacion` (
  `id_cotizacion` bigint NOT NULL AUTO_INCREMENT,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `telefono_contacto` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `id_cliente` bigint NOT NULL,
  PRIMARY KEY (`id_cotizacion`),
  KEY `FKnr8oxstwxh7rpntt36t01nxd` (`id_cliente`),
  CONSTRAINT `FKnr8oxstwxh7rpntt36t01nxd` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizacion`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cotizacion` WRITE;
/*!40000 ALTER TABLE `cotizacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `cotizacion` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cotizacion_detalle`
--

DROP TABLE IF EXISTS `cotizacion_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizacion_detalle` (
  `id_cotizacion_detalle` bigint NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `id_cotizacion` bigint NOT NULL,
  `id_producto` bigint NOT NULL,
  PRIMARY KEY (`id_cotizacion_detalle`),
  KEY `FKgh9i74gdpkvai7t9uyq2c73v8` (`id_cotizacion`),
  KEY `FKgtt14qis5y1ugjieivup0hpa` (`id_producto`),
  CONSTRAINT `FKgh9i74gdpkvai7t9uyq2c73v8` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id_cotizacion`),
  CONSTRAINT `FKgtt14qis5y1ugjieivup0hpa` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizacion_detalle`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cotizacion_detalle` WRITE;
/*!40000 ALTER TABLE `cotizacion_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `cotizacion_detalle` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `detalle_compras`
--

DROP TABLE IF EXISTS `detalle_compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compras` (
  `id_compra` bigint NOT NULL,
  `id_producto` bigint NOT NULL,
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compras`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `detalle_compras` WRITE;
/*!40000 ALTER TABLE `detalle_compras` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_compras` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `detalle_ventas`
--

DROP TABLE IF EXISTS `detalle_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ventas` (
  `id_producto` bigint NOT NULL,
  `id_venta` bigint NOT NULL,
  `cantidad` int NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `descuento` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id_producto`,`id_venta`),
  KEY `FKkmoe7spkf9amgos61a18xs147` (`id_venta`),
  CONSTRAINT `FKeksv16ui7t2k5alv3efkrvc6c` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `FKkmoe7spkf9amgos61a18xs147` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ventas`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `detalle_ventas` WRITE;
/*!40000 ALTER TABLE `detalle_ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_ventas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `empleado`
--

DROP TABLE IF EXISTS `empleado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `id_empresa` bigint NOT NULL DEFAULT '1',
  `token_reseteo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `token_reseteo_expira` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_empleado`),
  UNIQUE KEY `emple_nombreuser` (`emple_nombreuser`),
  UNIQUE KEY `emple_correo` (`emple_correo`),
  UNIQUE KEY `emple_telefono` (`emple_telefono`),
  UNIQUE KEY `emple_ndocumento` (`emple_ndocumento`),
  KEY `FK_TipoDoc_Empleado` (`id_tipodocumento`),
  KEY `FK_Perfil_Empleado` (`id_perfil`),
  KEY `FK_Empresa_Empleado` (`id_empresa`),
  CONSTRAINT `FK_Perfil_Empleado` FOREIGN KEY (`id_perfil`) REFERENCES `perfil` (`id_perfil`),
  CONSTRAINT `FK_TipoDoc_Empleado` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipo_documento` (`id_tipodocumento`),
  CONSTRAINT `FKaph0gjj93d3xrkx7ixnua3hny` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleado`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `empleado` WRITE;
/*!40000 ALTER TABLE `empleado` DISABLE KEYS */;
INSERT INTO `empleado` VALUES
(1,'admin','admin','','','admin@ejemplo.com','$2a$12$KHq9.h4WnAz0rod7c1Q8NejMMfCFdSnC58sJg.LZ2nEqdisGpKqlW','1','',1,'1',1,1,1,NULL,NULL),
(2,'ROGER PAUL','rvelasco','VELASCO','ZAPATA','rogervz.1710@gmail.com','$2a$10$1n21wzKLe.JkhBbTzTuN8OmiwThmHJEKvxCwEnTjDYj5BrRhqdgM6','987654321','CALLE SANTA ROSA 355',1,'72934888',1,2,1,NULL,NULL);
/*!40000 ALTER TABLE `empleado` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa` (
  `id_empresa` bigint NOT NULL,
  `empresa_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `empresa_direccion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `empresa_ruc` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `empresa_logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `empresa_sidebar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `empresa` WRITE;
/*!40000 ALTER TABLE `empresa` DISABLE KEYS */;
INSERT INTO `empresa` VALUES
(1,'MULTI SOLUCIONES R & V S.A.C.','CAL.SANTA ROSA DE LIMA NRO. 355 P.J.  SANTA ROSA DE LIMA','20607693588','173e8f21-e429-4432-a441-d9dd46761622_opt_logo.jpg','');
/*!40000 ALTER TABLE `empresa` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `empresa_sidebar_imagen`
--

DROP TABLE IF EXISTS `empresa_sidebar_imagen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa_sidebar_imagen` (
  `id_imagen` bigint NOT NULL AUTO_INCREMENT,
  `ruta_imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `id_empresa` bigint NOT NULL,
  PRIMARY KEY (`id_imagen`),
  KEY `FK_Empresa_Sidebar` (`id_empresa`),
  CONSTRAINT `FK_Empresa_Sidebar` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa_sidebar_imagen`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `empresa_sidebar_imagen` WRITE;
/*!40000 ALTER TABLE `empresa_sidebar_imagen` DISABLE KEYS */;
/*!40000 ALTER TABLE `empresa_sidebar_imagen` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES
(1,'0','<< Flyway Baseline >>','BASELINE','<< Flyway Baseline >>',NULL,'admin_optica','2026-06-02 20:42:25',0,1),
(2,'1','crear modulo caja','SQL','V1__crear_modulo_caja.sql',-1385297284,'admin_optica','2026-06-02 20:42:25',156,1),
(3,'2','crear modulo inventario','SQL','V2__crear_modulo_inventario.sql',-1219596683,'admin_optica','2026-06-02 20:42:26',249,1),
(4,'3','crear modulo proveedores','SQL','V3__crear_modulo_proveedores.sql',304301758,'admin_optica','2026-06-03 16:39:01',22,1),
(5,'4','crear modulo compras','SQL','V4__crear_modulo_compras.sql',956479998,'admin_optica','2026-06-03 17:06:51',1008,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `forma_pago`
--

DROP TABLE IF EXISTS `forma_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `forma_pago` (
  `id_fpago` bigint NOT NULL AUTO_INCREMENT,
  `fpago_metodo` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fpago_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_fpago`),
  UNIQUE KEY `fpago_metodo` (`fpago_metodo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forma_pago`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `forma_pago` WRITE;
/*!40000 ALTER TABLE `forma_pago` DISABLE KEYS */;
INSERT INTO `forma_pago` VALUES
(1,'Tarjeta de Cred',1),
(2,'Efectivo',1),
(3,'Pago Movil',1);
/*!40000 ALTER TABLE `forma_pago` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `gasto`
--

DROP TABLE IF EXISTS `gasto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `gasto` (
  `id_gasto` bigint NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha` datetime(6) NOT NULL,
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gasto`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `gasto` WRITE;
/*!40000 ALTER TABLE `gasto` DISABLE KEYS */;
/*!40000 ALTER TABLE `gasto` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `inventario_saldo`
--

DROP TABLE IF EXISTS `inventario_saldo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario_saldo`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `inventario_saldo` WRITE;
/*!40000 ALTER TABLE `inventario_saldo` DISABLE KEYS */;
INSERT INTO `inventario_saldo` VALUES
(1,1,10.000,5.000,'2026-06-02 21:39:12.368831','2026-06-02 21:39:12.391166'),
(2,2,1.000,7.000,'2026-06-02 21:46:56.863010','2026-06-03 11:14:00.208646'),
(3,3,1.000,1.000,'2026-06-02 21:51:51.337880','2026-06-02 21:51:53.383367');
/*!40000 ALTER TABLE `inventario_saldo` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `marca`
--

DROP TABLE IF EXISTS `marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca` (
  `id_marca` bigint NOT NULL AUTO_INCREMENT,
  `marca_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `marca_fecha` date DEFAULT NULL,
  `marca_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `marca` WRITE;
/*!40000 ALTER TABLE `marca` DISABLE KEYS */;
INSERT INTO `marca` VALUES
(2,'NIKE',NULL,1);
/*!40000 ALTER TABLE `marca` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `movimiento_caja`
--

DROP TABLE IF EXISTS `movimiento_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_caja` (
  `id_movimiento_caja` bigint NOT NULL AUTO_INCREMENT,
  `mov_anulado` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `mov_descripcion` varchar(500) NOT NULL,
  `mov_fecha` datetime(6) NOT NULL,
  `mov_metodo_pago` enum('EFECTIVO','OTRO','PLIN','TARJETA','TRANSFERENCIA','YAPE') NOT NULL,
  `mov_monto` decimal(12,2) NOT NULL,
  `mov_origen` enum('AJUSTE','APERTURA','COMPRA','GASTO','VENTA') NOT NULL,
  `mov_referencia_id` bigint DEFAULT NULL,
  `mov_referencia_tipo` varchar(50) DEFAULT NULL,
  `mov_tipo` enum('EGRESO','INGRESO') NOT NULL,
  `id_caja` bigint NOT NULL,
  `id_empleado` bigint NOT NULL,
  PRIMARY KEY (`id_movimiento_caja`),
  KEY `FKhw08ftkmr79jqg9wsv7rrptqd` (`id_caja`),
  KEY `FKci27ljtoe58xxjwwi67y2jml9` (`id_empleado`),
  KEY `idx_movimiento_caja_caja_fecha` (`id_caja`,`mov_fecha`),
  CONSTRAINT `FKci27ljtoe58xxjwwi67y2jml9` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`),
  CONSTRAINT `FKhw08ftkmr79jqg9wsv7rrptqd` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_caja`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `movimiento_caja` WRITE;
/*!40000 ALTER TABLE `movimiento_caja` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimiento_caja` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `movimiento_inventario`
--

DROP TABLE IF EXISTS `movimiento_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_inventario` (
  `id_movimiento_inventario` bigint NOT NULL AUTO_INCREMENT,
  `id_producto` bigint NOT NULL,
  `mov_tipo` varchar(30) NOT NULL,
  `mov_cantidad` decimal(12,3) NOT NULL,
  `mov_stock_previo` decimal(12,3) NOT NULL,
  `mov_stock_nuevo` decimal(12,3) NOT NULL,
  `mov_motivo` varchar(500) NOT NULL,
  `mov_referencia_tipo` varchar(50) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_inventario`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `movimiento_inventario` WRITE;
/*!40000 ALTER TABLE `movimiento_inventario` DISABLE KEYS */;
INSERT INTO `movimiento_inventario` VALUES
(1,1,'ENTRADA',10.000,0.000,10.000,'Stock inicial del producto','PRODUCTO_INICIAL',1,NULL,'2026-06-02 21:39:12.378162','2026-06-02 21:39:12.378948'),
(2,2,'ENTRADA',1.000,0.000,1.000,'Stock inicial del producto','PRODUCTO_INICIAL',2,NULL,'2026-06-02 21:46:56.870265','2026-06-02 21:46:56.871069'),
(3,3,'ENTRADA',1.000,0.000,1.000,'Stock inicial del producto','PRODUCTO_INICIAL',3,NULL,'2026-06-02 21:51:51.341948','2026-06-02 21:51:51.342225');
/*!40000 ALTER TABLE `movimiento_inventario` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `opcion`
--

DROP TABLE IF EXISTS `opcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `opcion` (
  `id_opcion` bigint NOT NULL AUTO_INCREMENT,
  `opcion_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `opcion_ruta` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `opcion_icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `opcion_orden` int DEFAULT NULL,
  `id_padre` bigint DEFAULT NULL,
  PRIMARY KEY (`id_opcion`),
  KEY `FKnk9w0tcdett0y2qb8kyy25b2g` (`id_padre`),
  CONSTRAINT `FKnk9w0tcdett0y2qb8kyy25b2g` FOREIGN KEY (`id_padre`) REFERENCES `opcion` (`id_opcion`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opcion`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `opcion` WRITE;
/*!40000 ALTER TABLE `opcion` DISABLE KEYS */;
INSERT INTO `opcion` VALUES
(1,'Dashboard','/',NULL,1,NULL),
(2,'Administración',NULL,'IconPerfiles',10,NULL),
(3,'Listar Empleados','/empleados',NULL,1,2),
(4,'Perfiles','/perfiles',NULL,2,2),
(5,'Configuración Menú','/configuracion-menu','',3,2),
(6,'Clientes','/clientes','IconClientes',20,NULL),
(7,'Inventario',NULL,'IconInventario',30,NULL),
(8,'Listar','/inventario',NULL,1,7),
(9,'Productos','/productos',NULL,2,7),
(10,'Categorias','/categorias',NULL,3,7),
(11,'Marca','/marcas',NULL,4,7),
(12,'Unidad','/unidades',NULL,5,7),
(13,'Caja','/cajas','IconVentas',6,NULL),
(14,'Proveedor/Compras',NULL,'IconCompras',40,NULL),
(15,'Proveedor','/proveedores',NULL,1,14),
(16,'Compras','/compras',NULL,2,14);
/*!40000 ALTER TABLE `opcion` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `orden_laboratorio`
--

DROP TABLE IF EXISTS `orden_laboratorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orden_laboratorio` (
  `id_orden` bigint NOT NULL AUTO_INCREMENT,
  `id_venta` bigint NOT NULL,
  `id_receta` bigint NOT NULL,
  `estado_orden` enum('PENDIENTE','ENVIADO_LABORATORIO','RECIBIDO_TIENDA','ENTREGADO_CLIENTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDIENTE',
  `fecha_promesa_entrega` date DEFAULT NULL,
  `laboratorio_nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id_orden`),
  KEY `FK_OrdenLab_Venta` (`id_venta`),
  KEY `FK_OrdenLab_Receta` (`id_receta`),
  CONSTRAINT `FK_OrdenLab_Receta` FOREIGN KEY (`id_receta`) REFERENCES `receta_clinica` (`id_receta`),
  CONSTRAINT `FK_OrdenLab_Venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden_laboratorio`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `orden_laboratorio` WRITE;
/*!40000 ALTER TABLE `orden_laboratorio` DISABLE KEYS */;
/*!40000 ALTER TABLE `orden_laboratorio` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `pagos_credito_detalle`
--

DROP TABLE IF EXISTS `pagos_credito_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos_credito_detalle` (
  `id_pago_detalle` bigint NOT NULL AUTO_INCREMENT,
  `comentarios` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_pago` datetime(6) DEFAULT NULL,
  `fecha_vencimiento` date NOT NULL,
  `medio_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `monto_pagado` decimal(10,2) DEFAULT NULL,
  `numero_cuota` int NOT NULL,
  `id_venta` bigint NOT NULL,
  PRIMARY KEY (`id_pago_detalle`),
  KEY `FKqqmd90c5e7abf82oaa8052y7u` (`id_venta`),
  CONSTRAINT `FKqqmd90c5e7abf82oaa8052y7u` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_credito_detalle`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `pagos_credito_detalle` WRITE;
/*!40000 ALTER TABLE `pagos_credito_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos_credito_detalle` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `perfil`
--

DROP TABLE IF EXISTS `perfil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `perfil` (
  `id_perfil` bigint NOT NULL AUTO_INCREMENT,
  `perfil_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `perfil_descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `perfil_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_perfil`),
  UNIQUE KEY `perfil_nombre` (`perfil_nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perfil`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `perfil` WRITE;
/*!40000 ALTER TABLE `perfil` DISABLE KEYS */;
INSERT INTO `perfil` VALUES
(1,'Administrador','Acceso total al sistema.',1),
(2,'Editor','Puede gestionar usuarios pero no perfiles.',1);
/*!40000 ALTER TABLE `perfil` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `perfil_opcion`
--

DROP TABLE IF EXISTS `perfil_opcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `perfil_opcion` (
  `id_perfil` bigint NOT NULL,
  `id_opcion` bigint NOT NULL,
  PRIMARY KEY (`id_perfil`,`id_opcion`),
  KEY `FK_Opcion` (`id_opcion`),
  CONSTRAINT `FK_Opcion` FOREIGN KEY (`id_opcion`) REFERENCES `opcion` (`id_opcion`),
  CONSTRAINT `FK_Perfil` FOREIGN KEY (`id_perfil`) REFERENCES `perfil` (`id_perfil`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perfil_opcion`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `perfil_opcion` WRITE;
/*!40000 ALTER TABLE `perfil_opcion` DISABLE KEYS */;
INSERT INTO `perfil_opcion` VALUES
(1,1),
(2,1),
(1,2),
(2,2),
(1,3),
(2,3),
(1,4),
(2,4),
(1,5),
(1,6),
(1,7),
(1,8),
(1,9),
(1,10),
(1,11),
(1,12),
(1,13),
(1,14),
(1,15),
(1,16);
/*!40000 ALTER TABLE `perfil_opcion` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  PRIMARY KEY (`id_producto`),
  KEY `FK_Catego_Produc` (`id_categoria`),
  KEY `FK_Marca_Produc` (`id_marca`),
  KEY `FK_UnidadVenta_Produc` (`id_unidad_venta`),
  KEY `FK_UnidadCompra_Produc` (`id_unidad_compra`),
  CONSTRAINT `FK_Catego_Produc` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  CONSTRAINT `FK_Marca_Produc` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`),
  CONSTRAINT `FK_UnidadCompra_Produc` FOREIGN KEY (`id_unidad_compra`) REFERENCES `unidad` (`id_unidad`),
  CONSTRAINT `FK_UnidadVenta_Produc` FOREIGN KEY (`id_unidad_venta`) REFERENCES `unidad` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES
(1,'PRUEBA1','ARM-00001','Prueba1','Prueba1',20.00,15.00,'2026-06-02',NULL,10,5,1,'ARMAZON',2,2,4,5,2,'2026-06-03 02:39:12','2026-06-03 02:39:12'),
(2,'PREUBAS01','ARM-00002','Preubas01','Preubas01',15.00,15.00,'2026-06-02','2026-06-19',1,7,1,'ARMAZON',1,2,4,4,1,'2026-06-03 02:46:57','2026-06-03 16:14:00'),
(3,'PREUBAS01','ARM-00003','Preubas01','Preubas01',15.00,15.00,'2026-06-02','2026-06-18',1,1,1,'ARMAZON',1,2,4,4,1,'2026-06-03 02:51:51','2026-06-03 06:01:45');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `producto_imagen`
--

DROP TABLE IF EXISTS `producto_imagen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_imagen` (
  `id_imagen` bigint NOT NULL AUTO_INCREMENT,
  `id_producto` bigint NOT NULL,
  `ruta_imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 si es la portada, 0 si es galería',
  PRIMARY KEY (`id_imagen`),
  KEY `FK_Imagen_Producto` (`id_producto`),
  CONSTRAINT `FK_Imagen_Producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_imagen`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `producto_imagen` WRITE;
/*!40000 ALTER TABLE `producto_imagen` DISABLE KEYS */;
INSERT INTO `producto_imagen` VALUES
(2,3,'https://res.cloudinary.com/dcagjocw2/image/upload/v1780455142/optica/productos/ARM-00003/a0umvuloeuaa6arleito.png',1),
(3,2,'https://res.cloudinary.com/dcagjocw2/image/upload/v1780464339/optica/productos/ARM-00002/zof7snfobt0alfuvtsch.png',1),
(4,1,'https://res.cloudinary.com/dcagjocw2/image/upload/v1780464358/optica/productos/ARM-00001/vkkphad0ccjgjhjzusim.png',1);
/*!40000 ALTER TABLE `producto_imagen` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` bigint NOT NULL AUTO_INCREMENT,
  `provee_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `provee_nombre_comercial` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `provee_nacionalidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `provee_direccion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `provee_telefono` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provee_correo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provee_correo_adicional` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provee_estado` int NOT NULL DEFAULT '1',
  `provee_ndocumento` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `id_tipodocumento` bigint NOT NULL,
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `provee_nombre` (`provee_nombre`),
  KEY `FK_TipoDoc_Proveedor` (`id_tipodocumento`),
  CONSTRAINT `FK_TipoDoc_Proveedor` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipo_documento` (`id_tipodocumento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `receta_clinica`
--

DROP TABLE IF EXISTS `receta_clinica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `receta_clinica` (
  `id_receta` bigint NOT NULL AUTO_INCREMENT,
  `id_cliente` bigint NOT NULL,
  `id_empleado` bigint NOT NULL COMMENT 'El optometrista que evaluó',
  `fecha_evaluacion` datetime(6) NOT NULL,
  `od_esfera` decimal(5,2) DEFAULT NULL COMMENT 'Ojo Derecho Esfera',
  `od_cilindro` decimal(5,2) DEFAULT NULL COMMENT 'Ojo Derecho Cilindro',
  `od_eje` int DEFAULT NULL COMMENT 'Ojo Derecho Eje',
  `oi_esfera` decimal(5,2) DEFAULT NULL COMMENT 'Ojo Izquierdo Esfera',
  `oi_cilindro` decimal(5,2) DEFAULT NULL COMMENT 'Ojo Izquierdo Cilindro',
  `oi_eje` int DEFAULT NULL COMMENT 'Ojo Izquierdo Eje',
  `distancia_pupilar` decimal(5,2) DEFAULT NULL,
  `adicion` decimal(5,2) DEFAULT NULL COMMENT 'Para lentes bifocales/progresivos',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id_receta`),
  KEY `FK_Receta_Cliente` (`id_cliente`),
  KEY `FK_Receta_Empleado` (`id_empleado`),
  CONSTRAINT `FK_Receta_Cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `FK_Receta_Empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta_clinica`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `receta_clinica` WRITE;
/*!40000 ALTER TABLE `receta_clinica` DISABLE KEYS */;
/*!40000 ALTER TABLE `receta_clinica` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tipo_comprobante`
--

DROP TABLE IF EXISTS `tipo_comprobante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_comprobante` (
  `id` int NOT NULL AUTO_INCREMENT,
  `correlativo_actual` int DEFAULT NULL,
  `estado` int DEFAULT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serie` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_comprobante`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tipo_comprobante` WRITE;
/*!40000 ALTER TABLE `tipo_comprobante` DISABLE KEYS */;
INSERT INTO `tipo_comprobante` VALUES
(1,0,1,'NOTA DE VENTA','N001'),
(2,0,1,'BOLETA','B001'),
(3,0,1,'FACTURA','F001');
/*!40000 ALTER TABLE `tipo_comprobante` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tipo_documento`
--

DROP TABLE IF EXISTS `tipo_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_documento` (
  `id_tipodocumento` bigint NOT NULL AUTO_INCREMENT,
  `tipodoc_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipodoc_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_tipodocumento`),
  UNIQUE KEY `tipodoc_nombre` (`tipodoc_nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_documento`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tipo_documento` WRITE;
/*!40000 ALTER TABLE `tipo_documento` DISABLE KEYS */;
INSERT INTO `tipo_documento` VALUES
(1,'DNI',1),
(2,'RUC',1),
(3,'Carné de Extranjería',1);
/*!40000 ALTER TABLE `tipo_documento` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tipo_venta`
--

DROP TABLE IF EXISTS `tipo_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_venta` (
  `id_tipoventa` bigint NOT NULL AUTO_INCREMENT,
  `tipoventa_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tipoventa_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_tipoventa`),
  UNIQUE KEY `tipoventa_nombre` (`tipoventa_nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_venta`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tipo_venta` WRITE;
/*!40000 ALTER TABLE `tipo_venta` DISABLE KEYS */;
INSERT INTO `tipo_venta` VALUES
(1,'Al contado',1),
(2,'Al Crédito',1);
/*!40000 ALTER TABLE `tipo_venta` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `unidad`
--

DROP TABLE IF EXISTS `unidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidad` (
  `id_unidad` int NOT NULL AUTO_INCREMENT,
  `uni_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `uni_estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_unidad`),
  UNIQUE KEY `uni_nombre` (`uni_nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidad`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `unidad` WRITE;
/*!40000 ALTER TABLE `unidad` DISABLE KEYS */;
INSERT INTO `unidad` VALUES
(4,'UNIDAD',1),
(5,'CAJA',1);
/*!40000 ALTER TABLE `unidad` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `id_venta` bigint NOT NULL AUTO_INCREMENT,
  `id_cliente` bigint NOT NULL,
  `cuotas` int DEFAULT NULL,
  `deuda` decimal(10,2) DEFAULT NULL,
  `estado` int NOT NULL,
  `fecha` datetime(6) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `forma_pago` enum('CONTADO','CREDITO') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `medio_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numero_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pago_inicial` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `id_tipo_comprobante` int DEFAULT NULL,
  `id_usuario` bigint NOT NULL,
  `venta_fecha` datetime(6) DEFAULT NULL,
  `id_cotizacion` bigint DEFAULT NULL,
  `tasa_interes` decimal(5,2) DEFAULT '0.00',
  `evaluacion_crediticia` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_venta`),
  KEY `FK_Cliente_Venta` (`id_cliente`),
  KEY `FKeofpgsq7k2s96kmc102p79y0a` (`id_tipo_comprobante`),
  KEY `FKngd2by0oq0noh796aom37hcj` (`id_usuario`),
  KEY `FKrpki5motc0ftufmsd3kvv0qbb` (`id_cotizacion`),
  CONSTRAINT `FK_Cliente_Venta` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `FKeofpgsq7k2s96kmc102p79y0a` FOREIGN KEY (`id_tipo_comprobante`) REFERENCES `tipo_comprobante` (`id`),
  CONSTRAINT `FKngd2by0oq0noh796aom37hcj` FOREIGN KEY (`id_usuario`) REFERENCES `empleado` (`id_empleado`),
  CONSTRAINT `FKrpki5motc0ftufmsd3kvv0qbb` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id_cotizacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping routines for database 'optica'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-06-03 12:43:58
