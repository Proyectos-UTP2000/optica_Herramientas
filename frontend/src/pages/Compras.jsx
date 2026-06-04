import { useEffect, useState } from 'react';
import { listarCompras } from '../api/comprasService';
import { mostrarAlerta } from '../utils/alerts';
import ModalVerCompra from './compras/ModalVerCompra';
import ModalCrearCompra from './compras/ModalCrearCompra';

const ESTADOS = ['TODOS', 'REGISTRADA', 'ANULADA'];

export default function Compras() {
    const [compras, setCompras] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [mostrarCrear, setMostrarCrear] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');

    const cargarCompras = () => {
        setCargando(true);
        listarCompras()
            .then(setCompras)
            .catch(() => mostrarAlerta('Error', 'No se pudieron cargar las compras.', 'error'))
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargarCompras(); }, []);

    const comprasFiltradas = compras.filter(c => {
        const q = busqueda.toLowerCase();
        const coincideBusqueda =
            (c.proveedorNombre ?? '').toLowerCase().includes(q) ||
            (c.numeroComprobante ?? '').toLowerCase().includes(q) ||
            (c.medioPago ?? '').toLowerCase().includes(q) ||
            (c.formaPago ?? '').toLowerCase().includes(q) ||
            String(c.id).includes(q);
        const coincideEstado =
            filtroEstado === 'TODOS' || (c.estado ?? '') === filtroEstado;
        return coincideBusqueda && coincideEstado;
    });

    // Devuelve la clase CSS que ya existe en tu global.css
    const claseFormaPago = (fp) => {
        const map = { CONTADO: 'badge--contado', CREDITO: 'badge--credito' };
        return map[(fp ?? '').toUpperCase()] ?? 'badge--otro';
    };

    const claseMedioPago = (mp) => {
        const map = {
            EFECTIVO: 'badge--efectivo',
            TRANSFERENCIA: 'badge--transferencia',
            TARJETA: 'badge--tarjeta',
            YAPE: 'badge--yape',
            PLIN: 'badge--plin',
            OTRO: 'badge--otro',
        };
        return map[(mp ?? '').toUpperCase()] ?? 'badge--otro';
    };

    const claseEstado = (est) => {
        const map = {
            REGISTRADA: 'badge--registrada',
            ANULADA: 'badge--anulada',
            PENDIENTE: 'badge--pendiente',
            COMPLETADA: 'badge--completada',
        };
        return map[(est ?? '').toUpperCase()] ?? 'badge--otro';
    };

    if (cargando) return <div className="page-loading">Cargando compras...</div>;

    return (
        <div className="page-container">

            {/* HEADER */}
            <div className="page-header">
                <h1 className="page-title">Gestión de Compras</h1>
                <button className="btn-primary" onClick={() => setMostrarCrear(true)}>
                    + Nueva Compra
                </button>
            </div>

            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '1.25rem', flexWrap: 'wrap'
            }}>
                {/* Buscador */}
                <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
                    <svg style={{
                        position: 'absolute', left: '10px', top: '50%',
                        transform: 'translateY(-50%)', width: 15, height: 15,
                        color: 'var(--text-muted)', pointerEvents: 'none'
                    }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por proveedor, comprobante..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="input-control"
                        style={{ paddingLeft: '32px' }}
                    />
                </div>

                {/* Filtros de estado */}
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                    {ESTADOS.map(est => (
                        <button
                            key={est}
                            onClick={() => setFiltroEstado(est)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '999px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                border: '1.5px solid',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                borderColor: filtroEstado === est ? 'var(--primary)' : 'var(--border-color)',
                                background: filtroEstado === est ? 'var(--primary)' : 'white',
                                color: filtroEstado === est ? '#fff' : 'var(--text-muted)',
                            }}
                        >
                            {est === 'TODOS' ? 'Todos'
                                : est.charAt(0) + est.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Contador */}
                <span style={{
                    marginLeft: 'auto', fontSize: '0.8rem',
                    color: 'var(--text-muted)', fontWeight: 500
                }}>
                    {comprasFiltradas.length}{' '}
                    {comprasFiltradas.length === 1 ? 'compra' : 'compras'}
                </span>
            </div>

            {/* TABLA */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Fecha</th>
                            <th>Proveedor</th>
                            <th>Comprobante</th>
                            <th>Forma Pago</th>
                            <th>Medio Pago</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comprasFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="table-empty">
                                    {busqueda || filtroEstado !== 'TODOS'
                                        ? 'No se encontraron compras con ese criterio.'
                                        : 'No hay compras registradas.'}
                                </td>
                            </tr>
                        ) : (
                            comprasFiltradas.map(c => (
                                <tr key={c.id}>
                                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                        {c.id}
                                    </td>
                                    <td>{c.fecha ? new Date(c.fecha).toLocaleDateString('es-PE') : '—'}</td>
                                    <td style={{ fontWeight: 500 }}>{c.proveedorNombre ?? '—'}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                                        {c.numeroComprobante ?? '—'}
                                    </td>
                                    <td>
                                        <span className={`badge ${claseFormaPago(c.formaPago)}`}>
                                            {c.formaPago ?? '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${claseMedioPago(c.medioPago)}`}>
                                            {c.medioPago ?? '—'}
                                        </span>
                                    </td>
                                    <td className="text-right" style={{ fontWeight: 700 }}>
                                        S/ {Number(c.total ?? 0).toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={`badge ${claseEstado(c.estado)}`}>
                                            {c.estado ?? '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-icon view"
                                            onClick={() => setCompraSeleccionada(c)}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" strokeWidth="2"
                                                style={{ marginRight: 4 }}>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {compraSeleccionada && (
                <ModalVerCompra
                    compra={compraSeleccionada}
                    onCerrar={() => setCompraSeleccionada(null)}
                />
            )}

            {mostrarCrear && (
                <ModalCrearCompra
                    onCerrar={() => setMostrarCrear(false)}
                    onGuardado={() => { setMostrarCrear(false); cargarCompras(); }}
                />
            )}
        </div>
    );
}