import { useEffect, useState } from 'react';
import axios from 'axios';

const Perfiles = () => {
    const [perfiles, setPerfiles] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [paginaActual, setPaginaActual] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('/api/v1/perfiles', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setPerfiles(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filtrados = perfiles.filter(p =>
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const totalPaginas = Math.ceil(filtrados.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const paginados = filtrados.slice(inicio, inicio + registrosPorPagina);

    return (
        <div>
            <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Lista de Perfiles</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                    Mostrar{' '}
                    <select value={registrosPorPagina} onChange={e => { setRegistrosPorPagina(Number(e.target.value)); setPaginaActual(1); }}
                        style={{ margin: '0 5px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        {[5, 10, 25, 50].map(n => <option key={n}>{n}</option>)}
                    </select>
                    {' '}registros
                </div>
                <div>
                    Buscar:{' '}
                    <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                            {['ID', 'Nombre', 'Descripción', 'Opciones de Acceso', 'Estado', 'Acciones'].map(col => (
                                <th key={col} style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Cargando...</td></tr>
                        ) : paginados.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No se encontraron perfiles.</td></tr>
                        ) : paginados.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '10px 12px' }}>{p.id}</td>
                                <td style={{ padding: '10px 12px', fontWeight: '500' }}>{p.nombre}</td>
                                <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.descripcion || '—'}</td>
                                <td style={{ padding: '10px 12px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {p.opciones && p.opciones.length > 0
                                            ? p.opciones.map(o => (
                                                <span key={o.id} style={{
                                                    padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
                                                    background: '#e0f2fe', color: '#0369a1', fontWeight: '500'
                                                }}>{o.nombre}</span>
                                            ))
                                            : <span style={{ color: '#94a3b8', fontSize: '12px' }}>Sin opciones</span>
                                        }
                                    </div>
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                                        background: p.estado === 1 ? '#dcfce7' : '#fee2e2',
                                        color: p.estado === 1 ? '#166534' : '#991b1b'
                                    }}>
                                        {p.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                    <button title="Editar accesos" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '6px' }}>✏️</button>
                                    <button title="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', fontSize: '13px', color: '#64748b' }}>
                <span>Mostrando registros del {filtrados.length === 0 ? 0 : inicio + 1} al {Math.min(inicio + registrosPorPagina, filtrados.length)} de un total de {filtrados.length} registros</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1}
                        style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', background: paginaActual === 1 ? '#f1f5f9' : '#fff' }}>Anterior</button>
                    <span style={{ padding: '5px 12px', background: '#3b82f6', color: 'white', borderRadius: '6px' }}>{paginaActual}</span>
                    <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas || totalPaginas === 0}
                        style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', background: paginaActual === totalPaginas ? '#f1f5f9' : '#fff' }}>Siguiente</button>
                </div>
            </div>
        </div>
    );
};

export default Perfiles;