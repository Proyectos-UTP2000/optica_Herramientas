package com.herramientas.optica.modules.empleados.service;

import java.util.List;

/**
 * Catalogo unico de opciones del sistema para mantener sincronizados menu, RBAC
 * y futuras rutas planificadas.
 */
public final class OpcionCatalog {

    private OpcionCatalog() {
    }

    public static List<OpcionDefinition> definiciones() {
        return List.of(
                new OpcionDefinition("Administración", null, "IconPerfiles", 10, null, true),
                new OpcionDefinition("Clientes y Ventas", null, "IconClientes", 20, null, true),
                new OpcionDefinition("Inventario", null, "IconInventario", 30, null, true),
                new OpcionDefinition("Proveedor/Compras", null, "IconCompras", 40, null, true),
                new OpcionDefinition("Reportes", null, "IconReportes", 50, null, true),
                new OpcionDefinition("Gestión Web", null, "IconGestionWeb", 60, null, false),

                new OpcionDefinition("Listar Empleados", "/empleados", "IconEmpleados", 1, "Administración", true),
                new OpcionDefinition("Perfiles", "/perfiles", "IconPerfiles", 2, "Administración", true),
                new OpcionDefinition("Configuración Menú", "/configuracion-menu", "IconConfig", 3, "Administración", true),

                new OpcionDefinition("Gestión Clientes", "/clientes", "IconClientes", 1, "Clientes y Ventas", true),
                new OpcionDefinition("Cajas Operativas", "/cajas", "IconDashboard", 2, "Clientes y Ventas", true),
                new OpcionDefinition("Ventas Operativas", "/ventas", "IconVentas", 3, "Clientes y Ventas", true),

                new OpcionDefinition("Inventario Operativo", "/inventario", "IconInventario", 1, "Inventario", true),
                new OpcionDefinition("Productos", "/productos", "IconInventario", 2, "Inventario", true),
                new OpcionDefinition("Categorías", "/categorias", "IconCategorias", 3, "Inventario", true),
                new OpcionDefinition("Marcas", "/marcas", "IconMarcas", 4, "Inventario", true),
                new OpcionDefinition("Unidades", "/unidades", "IconUnidades", 5, "Inventario", true),

                new OpcionDefinition("Proveedor", "/proveedores", "IconDashboard", 1, "Proveedor/Compras", true),
                new OpcionDefinition("Compras", "/compras", "IconCompras", 2, "Proveedor/Compras", true),

                new OpcionDefinition("Caja", "/reportes/caja", "IconDashboard", 1, "Reportes", true),
                new OpcionDefinition("Kardex", "/reportes/kardex", "IconInventario", 2, "Reportes", true),
                new OpcionDefinition("Ventas", "/reportes/ventas", "IconVentas", 3, "Reportes", true),
                new OpcionDefinition("Compras por Proveedor", "/reportes/compras", "IconCompras", 4, "Reportes", true),
                //new OpcionDefinition("Productos Bajo Stock", "/reportes/bajo-stock", "IconInventario", 5, "Reportes", false),

                new OpcionDefinition("Catálogo Web", "/catalogo-web", "IconInventario", 1, "Gestión Web", false),
                new OpcionDefinition("Cotizaciones", "/cotizaciones", "IconVentas", 2, "Gestión Web", false));
    }

    public record OpcionDefinition(String nombre, String ruta, String icono, Integer orden, String padreNombre,
            boolean asignarAdministrador) {
    }
}
