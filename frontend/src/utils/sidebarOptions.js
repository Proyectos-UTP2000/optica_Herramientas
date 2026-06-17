export const filtrarOpcionesSidebar = (opciones = []) =>
  opciones.filter((opcion) => opcion.visibleEnMenu !== false);
