# Sistema de Gestion de Optica

Este es un proyecto integral para la gestion de una optica, desarrollado con un backend en Spring Boot y un frontend en React.

## Tecnologias Utilizadas

### Backend

- Java 22
- Spring Boot 4.0.5 (Nota: Revisar version, posiblemente 3.x)
- Spring Security con JWT
- Spring Data JPA (MySQL / H2)
- Lombok
- Validation Starter
- Java Mail Sender

### Frontend

- React con Vite
- Axios para consumo de APIs
- Tailwind CSS (o estilos personalizados segun global.css)

### Infraestructura y Otros

- Docker Compose
- MySQL (Base de Datos principal)
- H2 (Base de Datos para pruebas/consola)

## Estructura del Proyecto

El backend esta organizado por modulos funcionales:

- **api**: Integracion con servicios externos (RENIEC/SUNAT).
- **clientes**: Gestion de clientes con validacion automatica de DNI/RUC.
- **empleados**: Gestion de personal, perfiles y permisos.
- **productos**: Inventario completo con gestion de Marcas, Categorias y Unidades.
  - Autogeneracion de codigos inteligentes (ej: ARM-00001).
  - Soporte para multiples imagenes por producto.
  - Manejo de integridad referencial mediante estado "En Desuso" (Estado 2).
- **security**: Autenticacion y control de acceso.

## Configuracion y Ejecucion

1. **Backend**:
   - Configurar variables de entorno o ajustar application.yml.
   - Ejecutar con ./mvnw spring-boot:run.
2. **Frontend**:
   - Navegar a cd frontend.
   - Instalar dependencias: npm install.
   - Ejecutar en desarrollo: npm run dev.

## Observaciones y Mejores Practicas (Evaluacion)

He realizado una revision inicial del proyecto siguiendo las mejores practicas de Java-SpringBoot:

### Puntos Positivos

- **Inyeccion por Constructor**: Los controladores y servicios utilizan inyeccion por constructor de forma correcta.
- **Uso de DTOs**: Se utilizan objetos de transferencia de datos para desacoplar las entidades de la API.
- **Manejo Global de Excepciones**: Implementado mediante @RestControllerAdvice.
- **Estructura por Caracteristicas**: Organizacion modular que facilita el escalado.
