import Swal from 'sweetalert2';

const iconConfig = {
    warning: { emoji: '⚠️', label: 'Advertencia', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    error: { emoji: '⛔', label: 'Error', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    success: { emoji: '✅', label: 'Correcto', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    info: { emoji: 'ℹ️', label: 'Información', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
};

const escapeHtml = (value = '') =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

const buildAlertHtml = (titulo, texto, icono = 'warning') => {
    const config = iconConfig[icono] || iconConfig.info;
    return `
        <div class="swal-pro-content">
            <div class="swal-pro-icon" style="background:${config.bg};border-color:${config.border};color:${config.color}">
                ${config.emoji}
            </div>
            <div class="swal-pro-kicker" style="color:${config.color}">${config.label}</div>
            <h2 class="swal-pro-title">${escapeHtml(titulo)}</h2>
            <p class="swal-pro-text">${escapeHtml(texto)}</p>
        </div>
    `;
};

export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const confirmarAccion = async (titulo, texto, txtConfirmar = 'Sí, continuar', icon = 'warning') => {
    return await Swal.fire({
        html: buildAlertHtml(titulo, texto, icon),
        icon: undefined,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
            popup: 'swal-pro-card',
            actions: 'swal-pro-actions',
            confirmButton: icon === 'error' || icon === 'warning' ? 'swal-pro-confirm swal-pro-confirm--danger' : 'swal-pro-confirm',
            cancelButton: 'swal-pro-cancel'
        },
        confirmButtonText: txtConfirmar,
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: icon === 'warning' || icon === 'error',
    });
};

export const mostrarAlerta = (titulo, texto, icono = 'success') => {
    Swal.fire({
        html: buildAlertHtml(titulo, texto, icono),
        icon: undefined,
        buttonsStyling: false,
        customClass: {
            popup: 'swal-pro-card',
            actions: 'swal-pro-actions',
            confirmButton: 'swal-pro-confirm'
        },
        confirmButtonText: 'Entendido',
    });
};
