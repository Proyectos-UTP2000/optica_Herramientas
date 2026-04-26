import { useEffect, useState } from 'react';
import axios from 'axios';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [paginaActual, setPaginaActual] = useState(1);
    const [loading, setLoading] = useState(true);

    const [showModalCrear, setShowModalCrear] = useState(false);
    const [showModalVer, setShowModalVer] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    const [dni, setDni] = useState('');
    const [datosDni, setDatosDni] = useState(null);
    const [loadingDni, setLoadingDni] = useState(false);
    const [nombre, setNombre] = useState('');
    const [apePaterno, setApePaterno] = useState('');
    const [apeMaterno, setApeMaterno] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const cargarClientes = () => {
        setLoading(true);
        axios.get('/api/v1/clientes', { headers })
            .then(res => setClientes(Array.isArray(res.data) ? res.data : res.data.content ?? []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargarClientes(); }, []);

    // ── Validaciones ─────────────────────────────────────────
    const validarDni = v => {
        if (!v) return 'El DNI es obligatorio';
        if (!/^\d+$/.test(v)) return 'Solo se permiten números';
        if (v.length !== 8) return 'Debe tener exactamente 8 dígitos';
        return '';
    };
    const validarTelefono = v => {
        if (!v) return '';
        if (!/^\d+$/.test(v)) return 'Solo se permiten números';
        if (v.length !== 9) return 'Debe tener 9 dígitos';
        return '';
    };
    const validarCorreo = v => {
        if (!v) return '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Formato de correo inválido';
        return '';
    };

    const setErr = (campo, msg) => setErrores(prev => ({ ...prev, [campo]: msg }));

    const soloNumeros = (setter, campo, maxLen, resetDni = false) => (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, maxLen);
        setter(val);
        if (campo === 'dni') setErr('dni', validarDni(val));
        if (campo === 'telefono') setErr('telefono', validarTelefono(val));
        if (resetDni) {
            setDatosDni(null);
            setNombre(''); setApePaterno(''); setApeMaterno(''); setDireccion('');
        }
    };

    // ── Consulta DNI ─────────────────────────────────────────
    const consultarDni = async () => {
        const errDni = validarDni(dni);
        if (errDni) { setErr('dni', errDni); return; }
        setLoadingDni(true);
        setErrores(prev => ({ ...prev, dni: '', dniApi: '' }));
        try {
            const res = await axios.get(`/api/v1/dni/${dni}`, { headers });
            if (res.data?.success) {
                const d = res.data.datos;
                setDatosDni(d);
                setNombre(d.nombres || d.nombre || '');
                setApePaterno(d.ape_paterno || d.apePaterno || '');
                setApeMaterno(d.ape_materno || d.apeMaterno || '');
                setDireccion(d.domiciliado?.direccion || d.direccion || '');
            } else {
                setErr('dniApi', 'No se encontró el DNI');
                setDatosDni(null);
            }
        } catch {
            setErr('dniApi', 'Error al consultar el DNI');
            setDatosDni(null);
        } finally {
            setLoadingDni(false);
        }
    };

    // ── Guardar ───────────────────────────────────────────────
    const handleGuardar = async () => {
        const nuevoErr = {
            dni: validarDni(dni),
            correo: validarCorreo(correo),
            telefono: validarTelefono(telefono),
            direccion: !direccion.trim() ? 'La dirección es obligatoria' : '',
        };
        setErrores(nuevoErr);
        if (Object.values(nuevoErr).some(e => e)) return;
        if (!datosDni) { setErr('dniApi', 'Primero consulta el DNI'); return; }

        setGuardando(true);
        try {
            await axios.post('/api/v1/clientes', {
                nombre,
                apellidoPaterno: apePaterno,
                apellidoMaterno: apeMaterno,
                correo,
                telefono,
                direccion,
                numeroDocumento: dni,
                estado: 1,
                idTipoDocumento: 1,   // ← 1 = DNI
            }, { headers });
            cerrarModalCrear();
            cargarClientes();
        } catch (e) {
            setErr('general', e.response?.data?.message || 'Error al registrar cliente');
        } finally {
            setGuardando(false);
        }
    };

    const cerrarModalCrear = () => {
        setShowModalCrear(false);
        setDni(''); setDatosDni(null); setNombre(''); setApePaterno('');
        setApeMaterno(''); setCorreo(''); setTelefono('');
        setDireccion(''); setErrores({});
    };

    // ── Filtro y paginación ───────────────────────────────────
    const filtrados = clientes.filter(c => {
        const t = busqueda.toLowerCase();
        return (
            c.nombre?.toLowerCase().includes(t) ||
            c.apellidoPaterno?.toLowerCase().includes(t) ||
            c.apellidoMaterno?.toLowerCase().includes(t) ||
            c.correo?.toLowerCase().includes(t) ||
            c.numeroDocumento?.includes(t)
        );
    });
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const paginados = filtrados.slice(inicio, inicio + registrosPorPagina);

    // ── Estilos helpers ───────────────────────────────────────
    const inputBase = {
        width: '100%', padding: '8px 10px', borderRadius: '6px',
        fontSize: '13px', outline: 'none', transition: 'border-color .15s', boxSizing: 'border-box',
    };
    const inputEditable = (campo) => ({
        ...inputBase,
        border: `1px solid ${errores[campo] ? '#fca5a5' : '#cbd5e1'}`,
        background: '#fff',
    });
    const inputReadonly = {
        ...inputBase, border: '1px solid #e2e8f0',
        background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed',
    };
    const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' };
    const errMsg = (campo) => errores[campo]
        ? <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '3px' }}>⚠ {errores[campo]}</p>
        : null;
    const grupo = { marginBottom: '14px' };
    const SecLabel = ({ t }) => (
        <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', marginTop: '4px' }}>{t}</p>
    );
    const Divider = () => <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '6px 0 16px' }} />;

    return (
        <div>
            {/* ── Cabecera ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#1e293b', fontSize: '20px', fontWeight: '700', margin: 0 }}>Lista de Clientes</h2>
                <button onClick={() => setShowModalCrear(true)} style={{
                    background: '#2563eb', color: 'white', border: 'none',
                    padding: '9px 18px', borderRadius: '7px', cursor: 'pointer',
                    fontWeight: '600', fontSize: '13px'
                }}>+ Nuevo Cliente</button>
            </div>

            {/* ── Controles tabla ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '13px', color: '#475569' }}>
                    Mostrar{' '}
                    <select value={registrosPorPagina} onChange={e => { setRegistrosPorPagina(Number(e.target.value)); setPaginaActual(1); }}
                        style={{ margin: '0 6px', padding: '4px 6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                        {[5, 10, 25, 50].map(n => <option key={n}>{n}</option>)}
                    </select>registros
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                    Buscar:
                    <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
                        placeholder="Nombre, DNI, correo..."
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', width: '200px' }} />
                </div>
            </div>

            {/* ── Tabla ── */}
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            {['ID', 'Nombre Completo', 'Correo', 'Teléfono', 'Nº Documento', 'Estado', 'Acciones'].map(col => (
                                <th key={col} style={{ padding: '11px 14px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Cargando clientes...</td></tr>
                        ) : paginados.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                {busqueda ? 'No se encontraron resultados.' : 'No hay clientes registrados aún.'}
                            </td></tr>
                        ) : paginados.map((c, i) => (
                            <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                <td style={{ padding: '10px 14px', color: '#64748b' }}>{c.id}</td>
                                <td style={{ padding: '10px 14px', fontWeight: '500', color: '#1e293b' }}>
                                    {[c.nombre, c.apellidoPaterno, c.apellidoMaterno].filter(Boolean).join(' ')}
                                </td>
                                <td style={{ padding: '10px 14px', color: '#475569' }}>{c.correo || '—'}</td>
                                <td style={{ padding: '10px 14px', color: '#475569' }}>{c.telefono || '—'}</td>
                                <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#334155' }}>{c.numeroDocumento}</td>
                                <td style={{ padding: '10px 14px' }}>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                                        background: c.estado === 1 ? '#dcfce7' : '#fee2e2',
                                        color: c.estado === 1 ? '#15803d' : '#dc2626',
                                        border: `1px solid ${c.estado === 1 ? '#bbf7d0' : '#fecaca'}`,
                                    }}>
                                        {c.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                    <button title="Ver detalle" onClick={() => { setClienteSeleccionado(c); setShowModalVer(true); }}
                                        style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Paginación ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
                <span>
                    {filtrados.length === 0
                        ? 'Sin registros'
                        : `Mostrando registros del ${inicio + 1} al ${Math.min(inicio + registrosPorPagina, filtrados.length)} de un total de ${filtrados.length} registros`}
                </span>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1}
                        style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: paginaActual === 1 ? 'not-allowed' : 'pointer', background: '#fff', fontSize: '12px', opacity: paginaActual === 1 ? 0.5 : 1 }}>Anterior</button>
                    <span style={{ padding: '5px 12px', background: '#2563eb', color: 'white', borderRadius: '6px', fontWeight: '600', fontSize: '12px' }}>{paginaActual}</span>
                    <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual >= totalPaginas}
                        style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: paginaActual >= totalPaginas ? 'not-allowed' : 'pointer', background: '#fff', fontSize: '12px', opacity: paginaActual >= totalPaginas ? 0.5 : 1 }}>Siguiente</button>
                </div>
            </div>

            {/* ══ MODAL VER DETALLE ══ */}
            {showModalVer && clienteSeleccionado && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
                    <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #f1f5f9' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Detalle del Cliente</h3>
                            <button onClick={() => setShowModalVer(false)} style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}>✕</button>
                        </div>
                        <div style={{ padding: '18px 22px' }}>
                            {[
                                ['Nombre completo', [clienteSeleccionado.nombre, clienteSeleccionado.apellidoPaterno, clienteSeleccionado.apellidoMaterno].filter(Boolean).join(' ')],
                                ['Nº Documento', clienteSeleccionado.numeroDocumento],
                                ['Correo', clienteSeleccionado.correo || '—'],
                                ['Teléfono', clienteSeleccionado.telefono || '—'],
                                ['Dirección', clienteSeleccionado.direccion || '—'],
                                ['Estado', clienteSeleccionado.estado === 1 ? 'Activo' : 'Inactivo'],
                            ].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f8fafc' }}>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{k}</span>
                                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '14px 22px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModalVer(false)} style={{ padding: '9px 22px', borderRadius: '7px', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '600', fontSize: '13px', background: '#f8fafc', color: '#475569' }}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ MODAL CREAR CLIENTE ══ */}
            {showModalCrear && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
                    <div style={{ background: 'white', borderRadius: '12px', width: '680px', maxWidth: '100%', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'white', zIndex: 2, borderRadius: '12px 12px 0 0' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Registrar Cliente</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>Consulta el DNI para autocompletar los datos personales</p>
                            </div>
                            <button onClick={cerrarModalCrear} style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}>✕</button>
                        </div>

                        <div style={{ padding: '20px 22px' }}>

                            {/* ─ Identificación ─ */}
                            <SecLabel t="Identificación" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                <div style={grupo}>
                                    <label style={labelStyle}>Tipo Documento</label>
                                    <select disabled style={{ ...inputReadonly, width: '100%' }}><option>DNI</option></select>
                                </div>
                                <div style={grupo}>
                                    <label style={labelStyle}>Nº Documento *</label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <input
                                            value={dni}
                                            onChange={soloNumeros(setDni, 'dni', 8, true)}
                                            onKeyDown={e => e.key === 'Enter' && consultarDni()}
                                            placeholder="12345678"
                                            inputMode="numeric"
                                            style={{ ...inputEditable('dni'), flex: 1 }}
                                        />
                                        <button onClick={consultarDni} disabled={loadingDni} style={{
                                            background: '#0f172a', color: 'white', border: 'none',
                                            padding: '0 12px', borderRadius: '6px', cursor: loadingDni ? 'not-allowed' : 'pointer',
                                            fontSize: '13px', fontWeight: '600', opacity: loadingDni ? 0.6 : 1, whiteSpace: 'nowrap'
                                        }}>{loadingDni ? '⏳' : '🔍 Buscar'}</button>
                                    </div>
                                    {errMsg('dni')}
                                    {errMsg('dniApi')}
                                </div>
                            </div>

                            {/* Alerta DNI encontrado */}
                            {datosDni && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '9px 14px', marginBottom: '14px', fontSize: '13px', color: '#15803d', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    ✅ DNI encontrado — {nombre} {apePaterno} {apeMaterno}
                                </div>
                            )}

                            {/* Nombre + Apellido Paterno */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div style={grupo}>
                                    <label style={labelStyle}>Nombre</label>
                                    <input value={nombre} readOnly style={inputReadonly} placeholder="Se autocompleta con el DNI" />
                                </div>
                                <div style={grupo}>
                                    <label style={labelStyle}>Apellido Paterno</label>
                                    <input value={apePaterno} readOnly style={inputReadonly} placeholder="Se autocompleta con el DNI" />
                                </div>
                            </div>

                            {/* Apellido Materno */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div style={grupo}>
                                    <label style={labelStyle}>Apellido Materno</label>
                                    <input value={apeMaterno} readOnly style={inputReadonly} placeholder="Se autocompleta con el DNI" />
                                </div>
                                <div />
                            </div>

                            <Divider />

                            {/* ─ Contacto ─ */}
                            <SecLabel t="Contacto" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div style={grupo}>
                                    <label style={labelStyle}>Correo Electrónico</label>
                                    <input
                                        value={correo}
                                        onChange={e => { setCorreo(e.target.value); setErr('correo', validarCorreo(e.target.value)); }}
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        style={inputEditable('correo')}
                                    />
                                    {errMsg('correo')}
                                </div>
                                <div style={grupo}>
                                    <label style={labelStyle}>Teléfono</label>
                                    <input
                                        value={telefono}
                                        onChange={soloNumeros(setTelefono, 'telefono', 9, false)}
                                        placeholder="987654321"
                                        inputMode="numeric"
                                        style={inputEditable('telefono')}
                                    />
                                    {errMsg('telefono')}
                                </div>
                            </div>

                            <div style={grupo}>
                                <label style={labelStyle}>Dirección *</label>
                                <input
                                    value={direccion}
                                    onChange={e => { setDireccion(e.target.value); setErr('direccion', !e.target.value.trim() ? 'La dirección es obligatoria' : ''); }}
                                    placeholder="Av. Ejemplo 123, Piura"
                                    style={inputEditable('direccion')}
                                />
                                {errMsg('direccion')}
                            </div>

                            {/* Error general */}
                            {errores.general && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 14px', color: '#dc2626', fontSize: '13px' }}>
                                    ⚠ {errores.general}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f1f5f9', position: 'sticky', bottom: 0, background: 'white', borderRadius: '0 0 12px 12px' }}>
                            <button onClick={cerrarModalCrear} style={{ padding: '9px 22px', borderRadius: '7px', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '600', fontSize: '13px', background: '#f8fafc', color: '#475569' }}>
                                Cancelar
                            </button>
                            <button onClick={handleGuardar} disabled={guardando} style={{
                                padding: '9px 22px', borderRadius: '7px', border: 'none',
                                background: guardando ? '#93c5fd' : '#2563eb', color: 'white',
                                cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px'
                            }}>
                                {guardando ? 'Guardando...' : 'Guardar Cliente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clientes;