import { useEffect, useState } from 'react';
import axios from 'axios';

const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [perfiles, setPerfiles] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [paginaActual, setPaginaActual] = useState(1);
    const [loading, setLoading] = useState(true);

    // Modales
    const [showModalCrear, setShowModalCrear] = useState(false);
    const [showModalEditar, setShowModalEditar] = useState(false);
    const [showModalVer, setShowModalVer] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

    // Campos crear
    const [dni, setDni] = useState('');
    const [datosDni, setDatosDni] = useState(null);
    const [loadingDni, setLoadingDni] = useState(false);
    const [nombre, setNombre] = useState('');
    const [apePaterno, setApePaterno] = useState('');
    const [apeMaterno, setApeMaterno] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [idPerfil, setIdPerfil] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    // Campos editar
    const [editCorreo, setEditCorreo] = useState('');
    const [editTelefono, setEditTelefono] = useState('');
    const [editDireccion, setEditDireccion] = useState('');
    const [editIdPerfil, setEditIdPerfil] = useState('');
    const [editErrores, setEditErrores] = useState({});
    const [editGuardando, setEditGuardando] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const cargarEmpleados = () => {
        setLoading(true);
        axios.get('/api/v1/empleados', { headers })
            .then(res => setEmpleados(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargarEmpleados();
        axios.get('/api/v1/perfiles', { headers })
            .then(res => setPerfiles(res.data.filter(p => p.estado === 1)))
            .catch(err => console.error(err));
    }, []);

    // ── Validaciones ─────────────────────────────────────────
    const validarDni = v => {
        if (!v) return 'El DNI es obligatorio';
        if (!/^\d+$/.test(v)) return 'Solo se permiten números';
        if (v.length !== 8) return 'El DNI debe tener exactamente 8 dígitos';
        return '';
    };
    const validarTelefono = v => {
        if (!v) return '';
        if (!/^\d+$/.test(v)) return 'Solo se permiten números';
        if (v.length !== 9) return 'El teléfono debe tener 9 dígitos';
        return '';
    };
    const validarCorreo = v => {
        if (!v) return 'El correo es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Correo inválido';
        return '';
    };

    const validarCampo = (campo, value, setErr) => {
        let err = '';
        if (campo === 'dni') err = validarDni(value);
        if (campo === 'telefono') err = validarTelefono(value);
        if (campo === 'correo') err = validarCorreo(value);
        if (campo === 'idPerfil' && !value) err = 'Selecciona un perfil';
        if (campo === 'direccion' && !value) err = 'La dirección es obligatoria';
        setErr(prev => ({ ...prev, [campo]: err }));
    };

    const soloNumeros = (setter, campo, maxLen, setErr, resetDni = false) => (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, maxLen);
        setter(val);
        validarCampo(campo, val, setErr);
        if (resetDni) { setDatosDni(null); setNombre(''); setApePaterno(''); setApeMaterno(''); setDireccion(''); }
    };

    // ── Consulta DNI ─────────────────────────────────────────
    const consultarDni = async () => {
        const errDni = validarDni(dni);
        if (errDni) { setErrores(prev => ({ ...prev, dni: errDni })); return; }
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
                setErrores(prev => ({ ...prev, dniApi: 'No se encontró el DNI' }));
                setDatosDni(null);
            }
        } catch {
            setErrores(prev => ({ ...prev, dniApi: 'Error al consultar el DNI' }));
            setDatosDni(null);
        } finally {
            setLoadingDni(false);
        }
    };

    // ── CRUD ─────────────────────────────────────────────────
    const handleGuardar = async () => {
        const nuevosErrores = {
            dni: validarDni(dni),
            correo: validarCorreo(correo),
            telefono: validarTelefono(telefono),
            idPerfil: !idPerfil ? 'Selecciona un perfil' : '',
            direccion: !direccion ? 'La dirección es obligatoria' : '',
        };
        setErrores(nuevosErrores);
        if (Object.values(nuevosErrores).some(e => e)) return;
        if (!datosDni) { setErrores(prev => ({ ...prev, dniApi: 'Primero consulta el DNI' })); return; }
        setGuardando(true);
        try {
            await axios.post('/api/v1/empleados', {
                dni, correo, telefono, direccion, idPerfil: Number(idPerfil)
            }, { headers });
            cerrarModalCrear();
            cargarEmpleados();
        } catch (e) {
            setErrores(prev => ({ ...prev, general: e.response?.data?.message || 'Error al registrar empleado' }));
        } finally {
            setGuardando(false);
        }
    };

    const abrirEditar = (emp) => {
        setEmpleadoSeleccionado(emp);
        setEditCorreo(emp.correo || '');
        setEditTelefono(emp.telefono || '');
        setEditDireccion(emp.direccion || '');
        // Buscar idPerfil por nombre
        const perfil = perfiles.find(p => p.nombre === emp.perfilNombre);
        setEditIdPerfil(perfil ? String(perfil.id) : '');
        setEditErrores({});
        setShowModalEditar(true);
    };

    const handleActualizar = async () => {
        const nuevosErrores = {
            correo: validarCorreo(editCorreo),
            telefono: validarTelefono(editTelefono),
            idPerfil: !editIdPerfil ? 'Selecciona un perfil' : '',
            direccion: !editDireccion ? 'La dirección es obligatoria' : '',
        };
        setEditErrores(nuevosErrores);
        if (Object.values(nuevosErrores).some(e => e)) return;
        setEditGuardando(true);
        try {
            await axios.put(`/api/v1/empleados/${empleadoSeleccionado.id}`, {
                dni: empleadoSeleccionado.dni,
                correo: editCorreo,
                telefono: editTelefono,
                direccion: editDireccion,
                idPerfil: Number(editIdPerfil)
            }, { headers });
            setShowModalEditar(false);
            cargarEmpleados();
        } catch (e) {
            setEditErrores(prev => ({ ...prev, general: e.response?.data?.message || 'Error al actualizar empleado' }));
        } finally {
            setEditGuardando(false);
        }
    };

    const abrirVer = (emp) => { setEmpleadoSeleccionado(emp); setShowModalVer(true); };

    const cambiarEstado = async (id) => {
        await axios.patch(`/api/v1/empleados/${id}/estado`, {}, { headers });
        cargarEmpleados();
    };

    const eliminar = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.')) return;
        await axios.delete(`/api/v1/empleados/${id}`, { headers });
        cargarEmpleados();
    };

    const cerrarModalCrear = () => {
        setShowModalCrear(false);
        setDni(''); setDatosDni(null); setNombre(''); setApePaterno('');
        setApeMaterno(''); setCorreo(''); setTelefono('');
        setDireccion(''); setIdPerfil(''); setErrores({});
    };

    // ── Paginación y filtrado ─────────────────────────────────
    const filtrados = empleados.filter(e =>
        e.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.username?.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.dni?.includes(busqueda)
    );
    const totalPaginas = Math.ceil(filtrados.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const paginados = filtrados.slice(inicio, inicio + registrosPorPagina);

    // ── Estilos ───────────────────────────────────────────────
    const inputBase = { width: '100%', padding: '8px 10px', borderRadius: '6px', fontSize: '13px', outline: 'none', transition: 'border-color .15s' };
    const inputEditable = (campo, errMap = errores) => ({ ...inputBase, border: `1px solid ${errMap[campo] ? '#fca5a5' : '#cbd5e1'}`, background: '#fff' });
    const inputReadonly = { ...inputBase, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' };
    const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '3px', display: 'block' };
    const errorMsg = { fontSize: '11px', color: '#dc2626', marginTop: '3px' };
    const grupo = { marginBottom: '12px' };

    const ModalShell = ({ titulo, onClose, children, footer }) => (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', width: '680px', maxWidth: '96vw', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: 'white', zIndex: 1, borderRadius: '12px 12px 0 0' }}>
                    <h3 style={{ color: '#1e293b', margin: 0, fontSize: '16px', fontWeight: '700' }}>{titulo}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>✕</button>
                </div>
                <div style={{ padding: '20px 24px' }}>{children}</div>
                {footer && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '14px 24px', borderTop: '1px solid #e2e8f0', position: 'sticky', bottom: 0, background: 'white', borderRadius: '0 0 12px 12px' }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    const SeccionLabel = ({ text }) => (
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{text}</p>
    );
    const Divider = () => <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '8px 0 14px' }} />;

    const BtnPrimary = ({ onClick, disabled, children }) => (
        <button onClick={onClick} disabled={disabled} style={{ padding: '9px 22px', borderRadius: '7px', border: 'none', background: disabled ? '#93c5fd' : '#3b82f6', color: 'white', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>{children}</button>
    );
    const BtnSecondary = ({ onClick, children }) => (
        <button onClick={onClick} style={{ padding: '9px 22px', borderRadius: '7px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: '600', fontSize: '14px', background: '#f8fafc', color: '#475569' }}>{children}</button>
    );

    return (
        <div>
            {/* ── Cabecera ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#1e293b' }}>Lista de Empleados</h2>
                <button onClick={() => setShowModalCrear(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                    + Nuevo Empleado
                </button>
            </div>

            {/* ── Controles tabla ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', color: '#475569' }}>
                    Mostrar{' '}
                    <select value={registrosPorPagina} onChange={e => { setRegistrosPorPagina(Number(e.target.value)); setPaginaActual(1); }}
                        style={{ margin: '0 5px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        {[5, 10, 25, 50].map(n => <option key={n}>{n}</option>)}
                    </select>{' '}registros
                </div>
                <div style={{ fontSize: '14px', color: '#475569' }}>
                    Buscar:{' '}
                    <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} />
                </div>
            </div>

            {/* ── Tabla ── */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                            {['ID', 'Nombre', 'Usuario', 'Perfil', 'Correo', 'Tipo Doc.', 'Nº Documento', 'Estado', 'Acciones'].map(col => (
                                <th key={col} style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap' }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Cargando...</td></tr>
                        ) : paginados.length === 0 ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No se encontraron empleados.</td></tr>
                        ) : paginados.map(e => (
                            <tr key={e.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '10px 12px' }}>{e.id}</td>
                                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{e.nombres} {e.apellidos}</td>
                                <td style={{ padding: '10px 12px' }}>{e.username}</td>
                                <td style={{ padding: '10px 12px' }}>{e.perfilNombre}</td>
                                <td style={{ padding: '10px 12px' }}>{e.correo}</td>
                                <td style={{ padding: '10px 12px' }}>DNI</td>
                                <td style={{ padding: '10px 12px' }}>{e.dni}</td>
                                <td style={{ padding: '10px 12px' }}>
                                    <span onClick={() => cambiarEstado(e.id)} title="Click para cambiar estado" style={{
                                        padding: '3px 10px', borderRadius: '12px', fontSize: '12px',
                                        fontWeight: 'bold', cursor: 'pointer',
                                        background: e.estado === 1 ? '#dcfce7' : '#fee2e2',
                                        color: e.estado === 1 ? '#166534' : '#991b1b'
                                    }}>
                                        {e.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {/* Ver */}
                                        <button title="Ver detalle" onClick={() => abrirVer(e)} style={{
                                            background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb',
                                            padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px'
                                        }}>👁️</button>
                                        {/* Editar */}
                                        <button title="Editar" onClick={() => abrirEditar(e)} style={{
                                            background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
                                            padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px'
                                        }}>✏️</button>
                                        {/* Eliminar */}
                                        <button title="Eliminar" onClick={() => eliminar(e.id)} style={{
                                            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                                            padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px'
                                        }}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Paginación ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', fontSize: '13px', color: '#64748b' }}>
                <span>Mostrando del {filtrados.length === 0 ? 0 : inicio + 1} al {Math.min(inicio + registrosPorPagina, filtrados.length)} de {filtrados.length} registros</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1}
                        style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', background: paginaActual === 1 ? '#f1f5f9' : '#fff' }}>Anterior</button>
                    <span style={{ padding: '5px 12px', background: '#3b82f6', color: 'white', borderRadius: '6px' }}>{paginaActual}</span>
                    <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas || totalPaginas === 0}
                        style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', background: paginaActual === totalPaginas ? '#f1f5f9' : '#fff' }}>Siguiente</button>
                </div>
            </div>

            {/* ══════════ MODAL CREAR ══════════ */}
            {showModalCrear && (
                <ModalShell titulo="Registrar Empleado" onClose={cerrarModalCrear}
                    footer={<><BtnSecondary onClick={cerrarModalCrear}>Cancelar</BtnSecondary><BtnPrimary onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar Usuario'}</BtnPrimary></>}>

                    <SeccionLabel text="Identificación" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div style={grupo}>
                            <label style={labelStyle}>Tipo Documento</label>
                            <select style={{ ...inputBase, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }} disabled><option>DNI</option></select>
                        </div>
                        <div style={grupo}>
                            <label style={labelStyle}>Nº Documento *</label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <input value={dni} onChange={soloNumeros(setDni, 'dni', 8, setErrores, true)} placeholder="12345678" inputMode="numeric" style={{ ...inputEditable('dni'), flex: 1 }} />
                                <button onClick={consultarDni} disabled={loadingDni} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', opacity: loadingDni ? 0.6 : 1 }}>
                                    {loadingDni ? '⏳' : '🔍'}
                                </button>
                            </div>
                            {errores.dni && <p style={errorMsg}>⚠ {errores.dni}</p>}
                            {errores.dniApi && <p style={errorMsg}>⚠ {errores.dniApi}</p>}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}><label style={labelStyle}>Nombre</label><input value={nombre} readOnly style={inputReadonly} placeholder="Se autocompleta" /></div>
                        <div style={grupo}><label style={labelStyle}>Apellido Paterno</label><input value={apePaterno} readOnly style={inputReadonly} placeholder="Se autocompleta" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}><label style={labelStyle}>Apellido Materno</label><input value={apeMaterno} readOnly style={inputReadonly} placeholder="Se autocompleta" /></div>
                        <div />
                    </div>

                    <Divider />
                    <SeccionLabel text="Contacto" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}>
                            <label style={labelStyle}>Correo Electrónico *</label>
                            <input value={correo} onChange={e => { setCorreo(e.target.value); validarCampo('correo', e.target.value, setErrores); }} type="email" placeholder="ejemplo@correo.com" style={inputEditable('correo')} />
                            {errores.correo && <p style={errorMsg}>⚠ {errores.correo}</p>}
                        </div>
                        <div style={grupo}>
                            <label style={labelStyle}>Teléfono</label>
                            <input value={telefono} onChange={soloNumeros(setTelefono, 'telefono', 9, setErrores)} placeholder="987654321" inputMode="numeric" style={inputEditable('telefono')} />
                            {errores.telefono && <p style={errorMsg}>⚠ {errores.telefono}</p>}
                        </div>
                    </div>
                    <div style={grupo}>
                        <label style={labelStyle}>Dirección *</label>
                        <input value={direccion} onChange={e => { setDireccion(e.target.value); validarCampo('direccion', e.target.value, setErrores); }} placeholder="Dirección del empleado" style={inputEditable('direccion')} />
                        {errores.direccion && <p style={errorMsg}>⚠ {errores.direccion}</p>}
                    </div>

                    <Divider />
                    <SeccionLabel text="Rol de acceso" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}>
                            <label style={labelStyle}>Perfil *</label>
                            <select value={idPerfil} onChange={e => { setIdPerfil(e.target.value); validarCampo('idPerfil', e.target.value, setErrores); }} style={inputEditable('idPerfil')}>
                                <option value="">-- Selecciona --</option>
                                {perfiles.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                            {errores.idPerfil && <p style={errorMsg}>⚠ {errores.idPerfil}</p>}
                        </div>
                        <div />
                    </div>
                    {errores.general && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px', color: '#dc2626', fontSize: '13px' }}>⚠ {errores.general}</div>}
                </ModalShell>
            )}

            {/* ══════════ MODAL EDITAR ══════════ */}
            {showModalEditar && empleadoSeleccionado && (
                <ModalShell titulo="Editar Empleado" onClose={() => setShowModalEditar(false)}
                    footer={<><BtnSecondary onClick={() => setShowModalEditar(false)}>Cancelar</BtnSecondary><BtnPrimary onClick={handleActualizar} disabled={editGuardando}>{editGuardando ? 'Guardando...' : 'Guardar Cambios'}</BtnPrimary></>}>

                    <SeccionLabel text="Identificación (solo lectura)" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}><label style={labelStyle}>Tipo Documento</label><input value="DNI" readOnly style={inputReadonly} /></div>
                        <div style={grupo}><label style={labelStyle}>Nº Documento</label><input value={empleadoSeleccionado.dni} readOnly style={inputReadonly} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}><label style={labelStyle}>Nombre</label><input value={empleadoSeleccionado.nombres} readOnly style={inputReadonly} /></div>
                        <div style={grupo}><label style={labelStyle}>Apellidos</label><input value={empleadoSeleccionado.apellidos} readOnly style={inputReadonly} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}><label style={labelStyle}>Usuario</label><input value={empleadoSeleccionado.username} readOnly style={inputReadonly} /></div>
                        <div />
                    </div>

                    <Divider />
                    <SeccionLabel text="Contacto (editable)" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}>
                            <label style={labelStyle}>Correo Electrónico *</label>
                            <input value={editCorreo} onChange={e => { setEditCorreo(e.target.value); validarCampo('correo', e.target.value, setEditErrores); }} type="email" placeholder="ejemplo@correo.com" style={inputEditable('correo', editErrores)} />
                            {editErrores.correo && <p style={errorMsg}>⚠ {editErrores.correo}</p>}
                        </div>
                        <div style={grupo}>
                            <label style={labelStyle}>Teléfono</label>
                            <input value={editTelefono} onChange={soloNumeros(setEditTelefono, 'telefono', 9, setEditErrores)} placeholder="987654321" inputMode="numeric" style={inputEditable('telefono', editErrores)} />
                            {editErrores.telefono && <p style={errorMsg}>⚠ {editErrores.telefono}</p>}
                        </div>
                    </div>
                    <div style={grupo}>
                        <label style={labelStyle}>Dirección *</label>
                        <input value={editDireccion} onChange={e => { setEditDireccion(e.target.value); validarCampo('direccion', e.target.value, setEditErrores); }} placeholder="Dirección" style={inputEditable('direccion', editErrores)} />
                        {editErrores.direccion && <p style={errorMsg}>⚠ {editErrores.direccion}</p>}
                    </div>

                    <Divider />
                    <SeccionLabel text="Rol de acceso" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}>
                            <label style={labelStyle}>Perfil *</label>
                            <select value={editIdPerfil} onChange={e => { setEditIdPerfil(e.target.value); validarCampo('idPerfil', e.target.value, setEditErrores); }} style={inputEditable('idPerfil', editErrores)}>
                                <option value="">-- Selecciona --</option>
                                {perfiles.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                            {editErrores.idPerfil && <p style={errorMsg}>⚠ {editErrores.idPerfil}</p>}
                        </div>
                        <div />
                    </div>
                    {editErrores.general && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px', color: '#dc2626', fontSize: '13px' }}>⚠ {editErrores.general}</div>}
                </ModalShell>
            )}

            {/* ══════════ MODAL VER ══════════ */}
            {showModalVer && empleadoSeleccionado && (
                <ModalShell titulo="Detalle del Empleado" onClose={() => setShowModalVer(false)}
                    footer={<BtnSecondary onClick={() => setShowModalVer(false)}>Cerrar</BtnSecondary>}>

                    <SeccionLabel text="Identificación" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}><label style={labelStyle}>Tipo Documento</label><input value="DNI" readOnly style={inputReadonly} /></div>
                        <div style={grupo}><label style={labelStyle}>Nº Documento</label><input value={empleadoSeleccionado.dni} readOnly style={inputReadonly} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}><label style={labelStyle}>Nombre</label><input value={empleadoSeleccionado.nombres} readOnly style={inputReadonly} /></div>
                        <div style={grupo}><label style={labelStyle}>Apellidos</label><input value={empleadoSeleccionado.apellidos} readOnly style={inputReadonly} /></div>
                    </div>

                    <Divider />
                    <SeccionLabel text="Contacto" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}><label style={labelStyle}>Correo</label><input value={empleadoSeleccionado.correo || '—'} readOnly style={inputReadonly} /></div>
                        <div style={grupo}><label style={labelStyle}>Teléfono</label><input value={empleadoSeleccionado.telefono || '—'} readOnly style={inputReadonly} /></div>
                    </div>
                    <div style={grupo}><label style={labelStyle}>Dirección</label><input value={empleadoSeleccionado.direccion || '—'} readOnly style={inputReadonly} /></div>

                    <Divider />
                    <SeccionLabel text="Acceso" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={grupo}><label style={labelStyle}>Usuario</label><input value={empleadoSeleccionado.username || '—'} readOnly style={inputReadonly} /></div>
                        <div style={grupo}><label style={labelStyle}>Perfil</label><input value={empleadoSeleccionado.perfilNombre || '—'} readOnly style={inputReadonly} /></div>
                    </div>
                    <div style={grupo}>
                        <label style={labelStyle}>Estado</label>
                        <span style={{
                            display: 'inline-block', padding: '4px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                            background: empleadoSeleccionado.estado === 1 ? '#dcfce7' : '#fee2e2',
                            color: empleadoSeleccionado.estado === 1 ? '#166534' : '#991b1b'
                        }}>
                            {empleadoSeleccionado.estado === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </ModalShell>
            )}
        </div>
    );
};

export default Empleados;