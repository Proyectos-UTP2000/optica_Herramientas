import api from './axiosConfig';

const extraerArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const obtenerReporteCajas = ({ desde, hasta, empleadoId, estado }) =>
  api.get('/api/v1/reportes/caja', {
    params: {
      desde,
      hasta,
      empleadoId: empleadoId || undefined,
      estado: estado || undefined,
    },
  }).then((r) => r.data);

export const obtenerDetalleCaja = (id) =>
  api.get(`/api/v1/reportes/caja/${id}`).then((r) => r.data);

export const obtenerReporteVentas = ({ desde, hasta, empleadoId, texto, producto, numeroVenta, medioPago }) =>
  api.get('/api/v1/reportes/ventas', {
    params: {
      desde,
      hasta,
      empleadoId: empleadoId || undefined,
      texto: texto || undefined,
      producto: producto || undefined,
      numeroVenta: numeroVenta || undefined,
      medioPago: medioPago || undefined,
    },
  }).then((r) => r.data);

export const obtenerDetalleVenta = (id) =>
  api.get(`/api/v1/reportes/ventas/${id}`).then((r) => r.data);

export const obtenerReporteCompras = ({ proveedor, desde, hasta }) =>
  api
    .get('/api/v1/reportes/compras', {
      params: {
        proveedor: proveedor || undefined,
        desde,
        hasta,
      },
    })
    .then((r) => r.data);

export const obtenerDetalleCompra = (id) =>
  api.get(`/api/v1/reportes/compras/${id}`).then((r) => r.data);

export const obtenerReporteKardex = ({ productoId, desde, hasta }) =>
  api.get('/api/v1/reportes/kardex', { params: { productoId, desde, hasta } }).then((r) => r.data);

export const listarProductosReporte = () =>
  api.get('/api/v1/productos').then((r) => extraerArray(r.data));

export const listarProveedoresReporte = () =>
  api.get('/api/v1/proveedores').then((r) => extraerArray(r.data));

export const listarEmpleadosReporte = () =>
  api.get('/api/v1/empleados').then((r) => extraerArray(r.data));
