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
    private final com.herramientas.optica.modules.clientes.repository.ClienteRepository clienteRepository;

    public CustomUserDetailsService(EmpleadoRepository empleadoRepository,
                                    com.herramientas.optica.modules.clientes.repository.ClienteRepository clienteRepository) {
        this.empleadoRepository = empleadoRepository;
        this.clienteRepository = clienteRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username != null && username.contains("@")) {
            com.herramientas.optica.modules.clientes.model.Cliente cliente = clienteRepository.findByCorreo(username)
                    .filter(c -> c.getEstado() != 0)
                    .orElseThrow(() -> new UsernameNotFoundException("Cliente no encontrado o eliminado"));

            if (cliente.getEstado() == 2) {
                throw new IllegalStateException("Su cuenta se encuentra deshabilitada. Contacte al administrador.");
            }
            if (cliente.getContrasena() == null) {
                throw new IllegalStateException("Esta cuenta de cliente no tiene acceso web configurado.");
            }

            return new User(
                    cliente.getCorreo(),
                    cliente.getContrasena(),
                    Collections.singletonList(new SimpleGrantedAuthority("CLIENTE"))
            );
        }

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