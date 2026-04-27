import Swal from 'sweetalert2';

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
        title: titulo,
        text: texto,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#ef4444',
        confirmButtonText: txtConfirmar,
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });
};

export const mostrarAlerta = (titulo, texto, icono = 'success') => {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonColor: '#3b82f6'
    });
};