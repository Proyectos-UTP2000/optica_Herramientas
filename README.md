# Sistema de Gestión Óptica

> Solución ERP interna + Catálogo Web B2C para la administración integral de una óptica.  
> Backend en **Spring Boot 4** · Frontends en **React 19 + Vite**

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características](#características)
  - [ERP Interno (Panel Administrativo)](#erp-interno-panel-administrativo)
  - [Catálogo Web B2C (Portal Público)](#catálogo-web-b2c-portal-público)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
  - [1. Clonar el Repositorio](#1-clonar-el-repositorio)
  - [2. Variables de Entorno](#2-variables-de-entorno)
  - [3. Base de Datos (Docker)](#3-base-de-datos-docker)
  - [4. Backend (Spring Boot)](#4-backend-spring-boot)
  - [5. Frontend ERP (Panel Admin)](#5-frontend-erp-panel-admin)
  - [6. Frontend B2C (Catálogo Público)](#6-frontend-b2c-catálogo-público)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos del Backend](#módulos-del-backend)
- [Módulos del Frontend ERP](#módulos-del-frontend-erp)
- [Seguridad](#seguridad)
- [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
- [Tests](#tests)
- [Decisiones de Diseño](#decisiones-de-diseño)
- [Roadmap](#roadmap)

---

## Descripción General

Este proyecto es un **sistema híbrido de gestión** diseñado para una óptica. Combina un ERP operativo interno con un catálogo web público orientado al cliente (B2C), bajo una arquitectura desacoplada que permite escalar ambas capas de forma independiente.

El sistema se divide en **dos fases estratégicas**:

| Fase | Nombre | Estado |
|------|--------|--------|
| 1 | ERP Interno | ✅ En producción |
| 2 | Catálogo Web B2C + Cotizaciones | ✅ Implementado |

---

## Características

### ERP Interno (Panel Administrativo)

#### 🗂️ Catálogo de Productos
- CRUD de Productos con soporte para galería de imágenes ordenables (integración Cloudinary)
- Gestión de Marcas, Categorías y Unidades con estado "En Desuso" para preservar histórico
- Factor de conversión entre unidades de compra y venta (ej. 1 caja = 12 unidades)

#### 📦 Inventario
- Saldos de stock en tiempo real normalizados a la unidad base de venta
- Movimientos de inventario: entradas, salidas y ajustes
- Kárdex por producto con historial completo de movimientos
- Alertas visuales de bajo stock

#### 💰 Caja
- Apertura y cierre de caja (accesible desde el header del ERP)
- Registro de ingresos y egresos manuales
- Reporte diario de caja y conciliaciones

#### 🛒 Compras y Ventas
- Registro de compras con impacto automático en inventario
- Anulación de compras con reversión de stock
- Ventas al contado integradas con caja (exige caja abierta) y descuento de stock
- Búsqueda predictiva de clientes (por DNI/RUC) y productos en el punto de venta
- Emisión de comprobantes

#### 👥 Clientes y Proveedores
- CRUD de clientes con consulta automática a servicios externos (RENIEC/SUNAT)
- CRUD de proveedores con validación de unicidad de documentos

#### 🏥 Módulo Clínico
- Gestión de Recetas de pacientes (datos ópticos)
- Órdenes de Laboratorio con seguimiento del estado de fabricación de lentes

#### 📊 Reportes
- Reporte de Kárdex por producto y rango de fechas
- Reporte de Ventas con filtros de período
- Reporte de Compras con filtros de período
- Reporte de Cajas histórico con conciliaciones

#### ⚙️ Administración del Sistema
- Gestión de Empleados con sistema de roles (RBAC)
- Gestión de Perfiles y Opciones de menú con control de acceso por perfil
- Menú lateral dinámico configurable visualmente desde la interfaz (sin tocar código)
- Configuración de parámetros del sistema

### Catálogo Web B2C (Portal Público)

- **Portal público** accesible sin autenticación en una URL independiente
- Carrusel de banners dinámico configurable desde el panel administrativo
- Búsqueda predictiva de productos por nombre o descripción
- Filtros avanzados por Categoría, Marca y Etiquetas B2C
- Modal de detalle del producto con galería de imágenes y descripción comercial
- **Carrito de cotización** con formulario de contacto del cliente
- Redirección a **WhatsApp** con detalle de productos solicitados y número de cotización
- Página de cuenta de cliente (`/mi-cuenta`) con historial de cotizaciones

#### 🏷️ Gestión desde el Panel Admin (B2C)
- Panel `/catalogo-web` para gestionar visibilidad web, SEO (slug, descripción), imágenes ordenables y etiquetas de cada producto
- Panel `/contenido-web` para administrar datos de la tienda: logo, teléfono de contacto, redes sociales y carrusel de banners
- Panel `/cotizaciones` para seguimiento de cotizaciones: cambio de estados (`PENDIENTE` → `CONTACTADO` → `PROCESADO` / `ANULADO`) y contacto directo por WhatsApp

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE / BROWSER                        │
├───────────────────────────┬─────────────────────────────────────┤
│  ERP Admin (puerto 5173)  │  Catálogo B2C (puerto 5174)         │
│  React 19 + Vite          │  React 19 + Vite (app separada)     │
├───────────────────────────┴─────────────────────────────────────┤
│              Spring Boot API REST (puerto 8080)                 │
│  • JWT Stateless Auth          • RBAC dinámico por perfil       │
│  • Módulos por dominio         • Flyway Migrations              │
│  • Cloudinary (imágenes)       • JavaMail (correo)              │
├─────────────────────────────────────────────────────────────────┤
│                    MySQL 8.0 (Docker)                           │
└─────────────────────────────────────────────────────────────────┘
```

El backend expone dos grupos de endpoints:
- **`/api/v1/...`** — Rutas privadas protegidas por JWT y el filtro RBAC dinámico.
- **`/api/v1/public/...`** — Rutas públicas accesibles sin autenticación (catálogo, configuración de tienda, cotizaciones).

---

## Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Java | 22 | Lenguaje principal |
| Spring Boot | 4.0.5 | Framework de aplicación |
| Spring Security + JWT (jjwt) | 0.11.5 | Autenticación y autorización |
| Spring Data JPA + Hibernate | — | Capa de persistencia |
| MySQL Connector/J | — | Driver de base de datos |
| Flyway | — | Migraciones de esquema |
| Cloudinary SDK | 1.36.0 | Almacenamiento y gestión de imágenes |
| JavaMail (Spring Mail) | — | Envío de correos |
| Lombok | — | Reducción de boilerplate |
| Bean Validation | — | Validación de DTOs |
| H2 | — | Base de datos en memoria para tests |

### Frontend ERP (`/frontend`)
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.x | Biblioteca de UI |
| Vite | 8.x | Bundler y dev server |
| React Router DOM | 7.x | Enrutamiento SPA |
| Axios | 1.x | Cliente HTTP centralizado |
| Bootstrap | 5.3 | Grid y componentes base |
| Bootstrap Icons | 1.11 | Iconografía |
| Recharts | 3.x | Gráficas en el dashboard |
| SweetAlert2 | 11.x | Alertas y confirmaciones |
| CSS Vanilla | — | Estilos personalizados |

### Frontend B2C (`/catalogo-b2c`)
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.x | Biblioteca de UI |
| Vite | 8.x | Bundler y dev server |
| React Router DOM | 7.x | Enrutamiento público |
| Axios | 1.x | Cliente HTTP |
| Bootstrap | 5.3 | Componentes y layout |

### Infraestructura
| Tecnología | Uso |
|---|---|
| Docker + Docker Compose | Despliegue de MySQL en contenedor |
| MySQL 8.0 | Motor principal de persistencia |
| Cloudinary | CDN para imágenes de productos y banners |

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Java 22** o superior (`java -version`)
- **Maven** (o usa el wrapper incluido `./mvnw`)
- **Node.js 18+** y **npm** (`node -v`, `npm -v`)
- **Docker** y **Docker Compose** (`docker -v`)
- Una cuenta de **Cloudinary** (plan gratuito suficiente para desarrollo)
- Un token de la **API de RENIEC/SUNAT** para consulta de DNI/RUC

---

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/LauroGuspar/optica_Herramientas.git
cd optica_Herramientas
```

### 2. Variables de Entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales reales:

```env
# Perfil activo de Spring
SPRING_PROFILES_ACTIVE=dev

# Conexión a base de datos
DB_URL=jdbc:mysql://localhost:3306/optica?useSSL=false&serverTimezone=America/Lima&allowPublicKeyRetrieval=true
DB_USERNAME=admin_optica
DB_PASSWORD=tu_password_seguro

# Docker MySQL
MYSQL_DATABASE=optica
MYSQL_USER=admin_optica
MYSQL_PASSWORD=tu_password_seguro
MYSQL_ROOT_PASSWORD=tu_root_password_seguro

# Servidor
SERVER_PORT=8080
FRONTEND_URL=http://localhost:5173
CATALOGO_URL=http://localhost:5174

# Correo (SMTP Gmail)
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_app_password_de_gmail

# API RENIEC/SUNAT
API_PERU_URL_DNI=https://miapi.cloud/v1/dni/
API_PERU_URL_RUC=https://miapi.cloud/v1/ruc/
API_PERU_TOKEN=tu_token_api_peru

# JWT
JWT_SECRET=un_secreto_con_al_menos_32_caracteres
JWT_EXPIRATION=86400000

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

> **Importante:** El archivo `.env` contiene secretos. Nunca lo incluyas en el control de versiones. Está incluido en el `.gitignore`.

### 3. Base de Datos (Docker)

Levanta el contenedor de MySQL:

```bash
docker compose up -d
```

El esquema se creará y migrará automáticamente al iniciar el backend por primera vez gracias a **Flyway**.

Para detener el contenedor:

```bash
docker compose down
```

### 4. Backend (Spring Boot)

```bash
# Desde la raíz del proyecto
./mvnw spring-boot:run
```

El servidor estará disponible en `http://localhost:8080`.

Para compilar el artefacto desplegable:

```bash
./mvnw clean package -DskipTests
java -jar target/optica-0.0.1-SNAPSHOT.jar
```

### 5. Frontend ERP (Panel Admin)

```bash
cd frontend
npm install
npm run dev
```

Panel administrativo disponible en `http://localhost:5173`.

### 6. Frontend B2C (Catálogo Público)

```bash
cd catalogo-b2c
npm install
npm run dev
```

Catálogo público disponible en `http://localhost:5174`.

---

## Estructura del Proyecto

```
optica_Herramientas/
├── src/                            # Código fuente del backend (Spring Boot)
│   └── main/
│       ├── java/com/herramientas/optica/
│       │   ├── modules/            # Módulos de dominio del negocio
│       │   │   ├── api/            # Integración con APIs externas (RENIEC/SUNAT)
│       │   │   ├── caja/           # Gestión de caja diaria
│       │   │   ├── clientes/       # Clientes
│       │   │   ├── compras/        # Compras y proveedores
│       │   │   ├── cotizaciones/   # Cotizaciones B2C
│       │   │   ├── empleados/      # Empleados y RBAC
│       │   │   ├── inventario/     # Stock y movimientos
│       │   │   ├── laboratorio/    # Órdenes de laboratorio
│       │   │   ├── productos/      # Productos y catálogo
│       │   │   ├── proveedores/    # Proveedores
│       │   │   ├── receta/         # Recetas oftalmológicas
│       │   │   ├── reportes/       # Generación de reportes
│       │   │   ├── shared/         # Servicios y entidades compartidas
│       │   │   ├── ventas/         # Ventas y punto de venta
│       │   │   └── webconfig/      # Configuración del sitio web B2C
│       └── resources/
│           ├── application.yml     # Configuración principal
│           ├── application-dev.yml # Configuración de desarrollo
│           ├── application-prod.yml# Configuración de producción
│           └── db/migration/       # Scripts de migración Flyway
├── frontend/                       # SPA del panel administrativo ERP
│   └── src/
│       ├── api/                    # Servicios Axios por módulo
│       ├── components/             # Componentes reutilizables
│       ├── layouts/                # Layouts (MainLayout, etc.)
│       ├── pages/                  # Páginas por módulo
│       └── styles/                 # CSS global
├── catalogo-b2c/                   # SPA del catálogo público (B2C)
│   └── src/
│       ├── api/                    # Servicios Axios (APIs públicas)
│       ├── components/             # Componentes del catálogo
│       ├── layouts/                # Layout público con navbar/footer
│       └── pages/                  # Páginas del catálogo y cuenta
├── database/                       # Backups de base de datos
├── compose.yaml                    # Docker Compose (MySQL)
├── pom.xml                         # Dependencias y build Maven
├── mvnw / mvnw.cmd                 # Maven Wrapper
└── .env.example                    # Plantilla de variables de entorno
```

---

## Módulos del Backend

Cada módulo sigue la estructura `model → repository → dto → service → controller` y vive en su propio paquete bajo `com.herramientas.optica.modules`.

| Módulo | Descripción | Endpoints principales |
|---|---|---|
| `api` | Integración RENIEC/SUNAT para consulta de DNI y RUC | `/api/v1/consulta/dni`, `/api/v1/consulta/ruc` |
| `caja` | Aperturas, cierres, ingresos/egresos y reportes de caja | `/api/v1/cajas/**` |
| `clientes` | CRUD de clientes con validación de documentos | `/api/v1/clientes/**` |
| `compras` | Registro y anulación de compras (afecta inventario) | `/api/v1/compras/**` |
| `cotizaciones` | Registro público y seguimiento administrativo de cotizaciones | `/api/v1/public/cotizaciones`, `/api/v1/cotizaciones/**` |
| `empleados` | CRUD de empleados con asignación de perfiles | `/api/v1/empleados/**` |
| `inventario` | Saldos, movimientos y kárdex por producto | `/api/v1/inventario/**` |
| `laboratorio` | Órdenes de laboratorio y seguimiento de fabricación | `/api/v1/ordenes-laboratorio/**` |
| `productos` | CRUD de productos con galería de imágenes (Cloudinary) | `/api/v1/productos/**` |
| `proveedores` | CRUD de proveedores | `/api/v1/proveedores/**` |
| `receta` | Gestión de recetas oftalmológicas de pacientes | `/api/v1/recetas/**` |
| `reportes` | Generación de reportes de ventas, compras, caja y kárdex | `/api/v1/reportes/**` |
| `shared` | Marcas, Categorías, Unidades, Perfiles, Opciones, Correo, Imágenes | Varios `/api/v1/**` |
| `ventas` | Registro de ventas (afecta caja y stock) | `/api/v1/ventas/**` |
| `webconfig` | Configuración del sitio B2C (singleton) y carrusel de banners | `/api/v1/web-config`, `/api/v1/public/web-config` |

---

## Módulos del Frontend ERP

Rutas del panel administrativo (requieren autenticación JWT):

| Ruta | Módulo |
|---|---|
| `/` | Dashboard con KPIs y gráficas |
| `/clientes` | Gestión de clientes |
| `/empleados` | Gestión de empleados |
| `/perfiles` | Roles y perfiles de usuario |
| `/configuracion-menu` | Configuración visual del menú |
| `/productos` | Catálogo ERP de productos |
| `/marcas` / `/categorias` / `/unidades` | Catálogos auxiliares |
| `/inventario` | Saldos y movimientos de stock |
| `/proveedores` | Gestión de proveedores |
| `/compras` | Registro de compras |
| `/ventas` | Punto de venta |
| `/recetas` | Recetas oftalmológicas |
| `/ordenes-laboratorio` | Órdenes de laboratorio |
| `/reportes/ventas` | Reporte de ventas |
| `/reportes/compras` | Reporte de compras |
| `/reportes/kardex` | Reporte de kárdex |
| `/reportes/caja` | Reporte de cajas |
| `/catalogo-web` | Panel B2C de productos (SEO, galería, etiquetas) |
| `/contenido-web` | Configuración del sitio público |
| `/cotizaciones` | Seguimiento de cotizaciones de clientes |
| `/configuracion` | Parámetros generales del sistema |

---

## Seguridad

El sistema implementa una seguridad de doble capa:

1. **`JwtAuthenticationFilter`**: Valida el token JWT en cada petición privada y establece el contexto de seguridad de Spring.

2. **`DynamicAuthorizationFilter`**: Valida que la URL solicitada esté dentro de las `Opciones` asignadas al Perfil del usuario autenticado, consultando la base de datos. Usa una caché thread-safe para evitar consultas repetidas dentro de la misma request.

> Las rutas bajo `/api/v1/public/**` están **excluidas** de ambos filtros y son accesibles sin autenticación.

**Reglas generales:**
- Los tokens JWT son stateless con expiración configurable (por defecto 24 horas).
- Las contraseñas se almacenan hasheadas con BCrypt.
- CORS está configurado para aceptar solo los orígenes definidos en las variables de entorno (`FRONTEND_URL`, `CATALOGO_URL`).

---

## Migraciones de Base de Datos

El esquema se gestiona con **Flyway** y los scripts viven en:

```
src/main/resources/db/migration/
└── V1__init.sql    # Esquema inicial completo + datos seed
```

Flyway corre automáticamente al arrancar el backend. Cualquier nueva migración debe seguir la convención `V{n}__{descripcion}.sql`.

Para entornos de test se usa una base de datos **H2** en memoria configurada en `application-test.yml`, lo que permite ejecutar tests sin necesitar MySQL.

---

## Tests

Ejecutar la suite de tests unitarios:

```bash
./mvnw test
```

Los tests usan el perfil `test` con base de datos H2 en memoria. No requieren tener Docker ni MySQL corriendo.

Cobertura incluye: autenticación JWT, módulo `webconfig` (singleton), módulo `cotizaciones` (reglas de negocio y transaccionalidad).

---

## Decisiones de Diseño

| Decisión | Justificación |
|---|---|
| **DTOs en todas las capas** | Desacopla las entidades JPA de la API. Permite evolucionar el esquema sin romper contratos. |
| **RBAC dinámico desde BD** | El menú y los permisos se configuran visualmente sin redeployar. Ideal para múltiples perfiles de empleados. |
| **`BigDecimal` para montos** | Evita errores de precisión en cálculos monetarios inherentes a `float`/`double`. |
| **`@Transactional` en operaciones críticas** | Garantiza atomicidad en ventas (caja + stock), compras (inventario) y cotizaciones (totales). |
| **Estado "En Desuso" en catálogos** | Marcas, Categorías y Unidades se desactivan sin eliminar para preservar la integridad de datos históricos. |
| **Factor de conversión de unidades** | Permite comprar por caja y vender por unidad, normalizando el inventario a la unidad base de venta. |
| **Cloudinary para imágenes** | Evita gestionar almacenamiento propio. Soporta transformaciones y optimización automática. |
| **Dos frontends independientes** | El ERP admin y el catálogo público son aplicaciones Vite separadas, con sus propias dependencias y despliegues. |
| **Flyway para migraciones** | Control de versiones del esquema de BD. Permite despliegues reproducibles y seguros. |

---

## Roadmap

- [ ] Módulo de despacho y seguimiento de pedidos
- [ ] Notificaciones por correo al cambiar estado de una cotización
- [ ] Generación de PDF para órdenes de laboratorio y comprobantes de venta
- [ ] Dashboard avanzado con métricas de conversión B2C vs. ventas directas
- [ ] Soporte multi-sucursal

---
# Texto sin Motivo

<div align="center">
  <sub>Desarrollado como proyecto de gestión integral para ópticas · Stack: Spring Boot + React + MySQL</sub>
</div>
