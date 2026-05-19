# Sistema de Gestión Óptica

Solución integral diseñada para la gestión total de una óptica, dividida en dos fases estratégicas: ERP Interno (en desarrollo) y Catálogo Web B2C (futura extensión).

## Arquitectura y Módulos Core

El sistema sigue una arquitectura modular en Spring Boot y React, con un enfoque en la seguridad dinámica y la integridad de los datos.

### Módulos Principales

*   **Gestión de Inventario:** Control de productos con generación de códigos inteligentes, soporte para múltiples imágenes y gestión de Marcas, Categorías y Unidades.
*   **Clientes:** Validación automática de datos mediante servicios externos (RENIEC/SUNAT).
*   **Empleados y Seguridad:** Sistema de control de acceso basado en roles (RBAC) con permisos dinámicos y jerárquicos.
*   **Seguridad Dinámica:** Implementación de un filtro de autorización dinámica que valida cada petición API contra las opciones asignadas al perfil del usuario en la base de datos.

## Tecnologías Utilizadas

### Backend
*   Java 22
*   Spring Boot 3.4.x
*   Spring Security con JWT (Stateless)
*   Spring Data JPA (MySQL)
*   Lombok y Bean Validation

### Frontend
*   React con Vite
*   Axios (Instancia centralizada para consumo de API)
*   Vanilla CSS para máxima flexibilidad y rendimiento

### Infraestructura
*   Docker Compose para despliegue de base de datos
*   MySQL como motor principal de persistencia

## Configuración y Ejecución

### Requisitos Previos
*   Java 22 o superior
*   Node.js y npm
*   Docker y Docker Compose

### Instalación

1.  **Base de Datos:**
    Levantar el contenedor de MySQL utilizando Docker Compose:
    ```bash
    docker-compose up -d
    ```

2.  **Servidor Backend:**
    Configurar las credenciales en `src/main/resources/application.yml` y ejecutar:
    ```bash
    ./mvnw spring-boot:run
    ```

3.  **Cliente Frontend:**
    Navegar al directorio del frontend e instalar las dependencias:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Mejores Prácticas Implementadas

*   **Seguridad Escalable:** Uso de caché thread-safe para la validación de permisos en el filtro de seguridad, evitando consultas excesivas a la base de datos.
*   **Desacoplamiento:** Uso extensivo de DTOs para separar la lógica de negocio de la capa de presentación.
*   **Jerarquía de Menú Dinámica:** Interfaz administrativa para organizar el menú y los accesos visualmente sin modificar código.
*   **Validación de Datos:** Restricciones de integridad referencial y validaciones de entrada en DTOs.
