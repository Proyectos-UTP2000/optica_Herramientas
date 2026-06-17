import test from "node:test";
import assert from "node:assert/strict";
import { filtrarOpcionesSidebar } from "./sidebarOptions.js";

test("filtrarOpcionesSidebar oculta opciones con visibleEnMenu false sin quitar permisos del arreglo original", () => {
  const opciones = [
    { id: 1, nombre: "Clientes y Ventas", idPadre: null, ruta: null },
    {
      id: 2,
      nombre: "Cajas Operativas",
      idPadre: 1,
      ruta: "/cajas",
      visibleEnMenu: false,
    },
    {
      id: 3,
      nombre: "Ventas Operativas",
      idPadre: 1,
      ruta: "/ventas",
      visibleEnMenu: true,
    },
    { id: 4, nombre: "Dashboard", idPadre: null, ruta: "/" },
  ];

  const resultado = filtrarOpcionesSidebar(opciones);

  assert.deepEqual(
    resultado.map((opcion) => opcion.nombre),
    ["Clientes y Ventas", "Ventas Operativas", "Dashboard"],
  );
  assert.equal(
    opciones.some((opcion) => opcion.ruta === "/cajas"),
    true,
  );
});
