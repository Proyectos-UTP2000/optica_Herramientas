import api from "./axiosConfig";

function extraerArray(data) {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export const listarCompras = () =>
  api.get("/api/v1/compras").then((r) => extraerArray(r.data));

export const buscarCompraPorId = (id) =>
  api.get(`/api/v1/compras/${id}`).then((r) => r.data);

export const registrarCompra = (dto) =>
  api.post("/api/v1/compras", dto).then((r) => r.data);

export const listarProveedores = () =>
  api.get("/api/v1/proveedores").then((r) => extraerArray(r.data));

export const listarTiposComprobante = () =>
  api.get("/api/v1/tipos-comprobante").then((r) => extraerArray(r.data));

export const getEmpleadoActual = () =>
  api.get("/api/v1/empleados").then((r) => {
    const token = localStorage.getItem("token");
    const username = JSON.parse(atob(token.split(".")[1]))?.sub;
    const lista = extraerArray(r.data);
    const emp = lista.find(
      (e) =>
        e.username === username ||
        e.usuario === username ||
        e.correo === username ||
        e.email === username ||
        e.nombreUsuario === username,
    );
    return emp?.id ?? emp?.idEmpleado ?? null;
  });

export const listarProductos = () =>
  api.get("/api/v1/productos").then((r) => extraerArray(r.data));

export const recibirCompra = (id, empleadoId) =>
  api
    .put(`/api/v1/compras/${id}/recibir?empleadoId=${empleadoId}`)
    .then((r) => r.data);

export const anularCompra = (id, empleadoId) =>
  api
    .put(`/api/v1/compras/${id}/anular?empleadoId=${empleadoId}`)
    .then((r) => r.data);
