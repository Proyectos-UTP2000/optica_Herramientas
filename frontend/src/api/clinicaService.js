import api from "./axiosConfig";

function extraerArray(data) {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export const getRecetasPorCliente = async (clienteId) => {
  return api
    .get(`/api/v1/recetas/cliente/${clienteId}`)
    .then((r) => extraerArray(r.data));
};

export const registrarReceta = async (data) => {
  return api.post("/api/v1/recetas", data).then((r) => r.data);
};

export const getOrdenesLaboratorio = async (estado) => {
  const params = estado ? { estado } : {};
  return api
    .get("/api/v1/ordenes-laboratorio", { params })
    .then((r) => extraerArray(r.data));
};

export const getOrdenesLaboratorioPorCliente = async (clienteId) => {
  return api
    .get(`/api/v1/ordenes-laboratorio/cliente/${clienteId}`)
    .then((r) => extraerArray(r.data));
};

export const actualizarEstadoOrden = async (id, data) => {
  return api
    .put(`/api/v1/ordenes-laboratorio/${id}/estado`, data)
    .then((r) => r.data);
};
