package com.herramientas.optica.security.service;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmpleadoRepository empleadoRepository;

    public CustomUserDetailsService(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // se buca al empleado, si llega a estar eliminado o no existe, se lanza
        // excepcion
        Empleado empleado = empleadoRepository.findByUsername(username)
                .filter(emp -> emp.getEstado() != 0)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado o eliminado"));

        // si el empleado esta deshabilitado se lanza una excepcion
        if (empleado.getEstado() == 2) {
            throw new IllegalStateException("Su cuenta se encuentra deshabilitada. Contacte al administrador.");
        }

        // lo convertimos en un UserDetails para springboot
        return new User(
                empleado.getUsername(),
                empleado.getContrasena(),
                Collections.singletonList(
                        new SimpleGrantedAuthority(empleado.getPerfil().getNombre().toUpperCase())));
    }
}