# Migraciones de base de datos

Las migraciones Flyway deben agregarse en esta carpeta con el formato:

`V<version>__<descripcion>.sql`

Ejemplo:

`V1__crear_modulo_caja.sql`

La configuracion usa `baseline-on-migrate=true` para poder empezar a versionar una base existente sin destruir datos.
