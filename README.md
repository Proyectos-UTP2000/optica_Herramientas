# Sistema de Gestión de Óptica

Este es un proyecto integral para la gestión de una óptica, desarrollado con un backend en **Spring Boot** y un frontend en **React**.

## 🚀 Tecnologías Utilizadas

### Backend
- **Java 22**
- **Spring Boot 4.0.5** (Nota: Revisar versión, posiblemente 3.x)
- **Spring Security** con **JWT**
- **Spring Data JPA** (MySQL / H2)
- **Lombok**
- **Validation Starter**
- **Java Mail Sender**

### Frontend
- **React** con **Vite**
- **Axios** para consumo de APIs
- **Tailwind CSS** (o estilos personalizados según `global.css`)

### Infraestructura y Otros
- **Docker Compose**
- **MySQL** (Base de Datos principal)
- **H2** (Base de Datos para pruebas/consola)

## 📁 Estructura del Proyecto

El backend está organizado por módulos funcionales:
- **api**: Integración con servicios externos (RENIEC/SUNAT).
- **clientes**: Gestión de clientes con validación automática de DNI/RUC.
- **empleados**: Gestión de personal, perfiles y permisos.
- **productos**: Inventario (Categorías, Marcas, Unidades).
- **security**: Autenticación y control de acceso.

## 🛠️ Configuración y Ejecución

1. **Backend**:
   - Configurar variables de entorno o ajustar `application.yml`.
   - Ejecutar con `./mvnw spring-boot:run`.
2. **Frontend**:
   - Navegar a `cd frontend`.
   - Instalar dependencias: `npm install`.
   - Ejecutar en desarrollo: `npm run dev`.

## 📝 Observaciones y Mejores Prácticas (Evaluación)

He realizado una revisión inicial del proyecto siguiendo las mejores prácticas de **Java-SpringBoot**:

### Puntos Positivos ✅
- **Inyección por Constructor**: Los controladores y servicios utilizan inyección por constructor de forma correcta.
- **Uso de DTOs**: Se utilizan objetos de transferencia de datos para desacoplar las entidades de la API.
- **Manejo Global de Excepciones**: Implementado mediante `@RestControllerAdvice`.
- **Estructura por Características**: Organización modular que facilita el escalado.

### Áreas de Mejora 🛠️
1. **Seguridad de Secretos**: Actualmente hay claves API, contraseñas de Gmail y secretos JWT hardcodeados en `application.yml`. Se recomienda moverlos a variables de entorno o un archivo `.env` no trackeado.
2. **Validación en DTOs**: Falta el uso de anotaciones como `@NotBlank`, `@Email`, `@Size` en los DTOs para validar las peticiones antes de llegar al servicio.
3. **Logging**: No se observa una estrategia de logging (SLF4J). Es vital para el diagnóstico en producción.
4. **Versión de Spring Boot**: La versión `4.0.5` en el `pom.xml` es inusual (actualmente la estable es 3.x). Se recomienda verificar si es intencional o un error de configuración.

---
*Documentación generada automáticamente y revisada para asegurar la calidad del código.*
