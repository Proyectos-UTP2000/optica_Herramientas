# Seguridad y Gestión de Perfiles Jerárquicos - Plan de Implementación

> **Para agentes:** REQUISITO: Usar superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan la sintaxis de checkbox (`- [ ]`) para seguimiento.

**Meta:** Corregir la seguridad de sub-recursos mediante herencia de permisos GET, arreglar la redirección de acceso denegado en el frontend y refactorizar la gestión de perfiles para soportar la jerarquía de la base de datos.

**Arquitectura:** 
- **Backend:** El `DynamicAuthorizationFilter` permitirá peticiones `GET` a rutas hijas si el usuario tiene permiso para la ruta padre.
- **Frontend:** `App.jsx` manejará errores 403 sin cerrar sesión. `Perfiles.jsx` renderizará un árbol de opciones dinámico.

**Tecnologías:** Spring Boot, React, Axios, React-Bootstrap-Icons.

---

### Tarea 1: Refactorización del Filtro de Autorización Dinámica

**Archivos:**
- Modificar: `src/main/java/com/herramientas/optica/security/jwt/DynamicAuthorizationFilter.java`

- [ ] **Paso 1: Implementar lógica de herencia de permisos GET**
Modificar el método `doFilterInternal` para que busque si el `path` actual es "descendiente" de alguna opción autorizada para el usuario. Si es descendiente y la petición es `GET`, permitir.

```java
// ... dentro de doFilterInternal ...
boolean hasExplicitAccess = empleado.getPerfil().getOpciones().stream()
        .anyMatch(opcion -> {
            String compareRuta = normalizePath(opcion.getRuta());
            return finalPath.equals(compareRuta) || finalPath.startsWith(compareRuta + "/");
        });

if (hasExplicitAccess) {
    filterChain.doFilter(request, response);
    return;
}

// NUEVA LÓGICA: Herencia para GET
if ("GET".equalsIgnoreCase(request.getMethod())) {
    boolean hasParentAccess = empleado.getPerfil().getOpciones().stream().anyMatch(opcion -> {
        // Buscar en la base de datos si alguna opción autorizada es padre/ancestro del recurso solicitado
        // O más simple: ¿Hay alguna opción autorizada cuyo hijo tenga esta ruta?
        return esHijoDeOpcionAutorizada(opcion, finalPath);
    });
    
    if (hasParentAccess) {
        filterChain.doFilter(request, response);
        return;
    }
}
// ... resto de la lógica (403) ...
```

- [ ] **Paso 2: Agregar método auxiliar `esHijoDeOpcionAutorizada`**
Este método debe verificar si el recurso solicitado pertenece a una opción que es hija de la opción proporcionada.

- [ ] **Paso 3: Validar con una prueba manual de API**
Intentar acceder a `/api/v1/marcas` con un usuario que solo tiene permiso para `Productos`.

---

### Tarea 2: Corrección de Gestión de Sesión en Frontend

**Archivos:**
- Modificar: `frontend/src/App.jsx`

- [ ] **Paso 1: Ajustar el manejo de errores en `cargarOpciones`**
Solo limpiar el almacenamiento si el error es `401`.

```javascript
// frontend/src/App.jsx
const cargarOpciones = async () => {
    setLoading(true);
    try {
      const data = await getMisOpciones();
      setOpciones(data);
    } catch (error) {
      console.error("Error al cargar opciones:", error);
      if (error.response?.status === 401) { // Cambiado de error.status a error.response?.status
        localStorage.clear();
        setToken(null);
      }
      // Si es 403, no hacemos nada aquí, el ProtectedRoute se encargará de redirigir a /
    } finally {
      setLoading(false);
    }
  };
```

---

### Tarea 3: Interfaz de Perfiles Dinámica y Jerárquica

**Archivos:**
- Modificar: `frontend/src/pages/Perfiles.jsx`

- [ ] **Paso 1: Eliminar `opcionesDisponibles` estáticas y cargar de API**
Usar `useEffect` para llamar a `/api/v1/opciones` al cargar el componente.

- [ ] **Paso 2: Crear función de utilidad para construir el árbol**
Convertir la lista plana de opciones en una estructura jerárquica.

```javascript
const construirArbol = (lista) => {
  const mapa = {};
  lista.forEach(op => { mapa[op.id] = { ...op, hijos: [] }; });
  const arbol = [];
  lista.forEach(op => {
    if (op.padre && mapa[op.padre.id]) {
      mapa[op.padre.id].hijos.push(mapa[op.id]);
    } else if (!op.padre) {
      arbol.push(mapa[op.id]);
    }
  });
  return arbol;
};
```

- [ ] **Paso 3: Renderizar el árbol en el Modal**
Usar recursividad o una lista indentada para mostrar la jerarquía. Agregar lógica de "Selección en Cascada".

- [ ] **Paso 4: Actualizar lógica de guardado**
Asegurarse de que el `POST` y `PUT` sigan enviando la lista plana de IDs.

---

### Tarea 4: Verificación Final

- [ ] **Paso 1: Probar acceso denegado**
Intentar entrar a una ruta no permitida (ej. `/configuracion-menu` siendo un usuario normal). Verificar que redirige a `/` y NO cierra sesión.
- [ ] **Paso 2: Probar herencia GET**
Entrar a la página de Productos (teniendo permiso) y verificar que los combos de Marcas/Categorías cargan correctamente sin errores 403.
- [ ] **Paso 3: Probar gestión de perfiles**
Crear un nuevo perfil, asignar un padre y verificar que se guardan los permisos correctamente.
