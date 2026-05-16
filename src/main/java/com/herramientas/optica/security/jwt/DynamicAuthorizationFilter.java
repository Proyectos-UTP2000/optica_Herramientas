package com.herramientas.optica.security.jwt;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class DynamicAuthorizationFilter extends OncePerRequestFilter {

    private final EmpleadoRepository empleadoRepository;

    public DynamicAuthorizationFilter(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // a. Si la ruta es pública, deja pasar
        if (path.startsWith("/api/v1/auth/") || path.startsWith("/api/v1/dashboard/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // b. Obtén la autenticación del SecurityContextHolder
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            filterChain.doFilter(request, response);
            return;
        }

        // c. Obtén el nombre de usuario y busca al Empleado
        String username = authentication.getName();
        Empleado empleado = empleadoRepository.findByUsername(username).orElse(null);

        if (empleado == null || empleado.getPerfil() == null) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Usuario sin perfil asignado o no encontrado");
            return;
        }

        // d. Verifica si alguna de las 'Opcion' del perfil tiene una 'ruta' que coincida
        // Normalizamos la URI quitando el prefijo /api/v1 si existe
        String normalizedPath = path.replace("/api/v1", "");
        
        boolean hasAccess = empleado.getPerfil().getOpciones().stream()
                .anyMatch(opcion -> {
                    String ruta = opcion.getRuta();
                    if (ruta == null || ruta.isEmpty()) return false;
                    // Aseguramos que la ruta empiece con /
                    if (!ruta.startsWith("/")) ruta = "/" + ruta;
                    return normalizedPath.startsWith(ruta);
                });

        if (hasAccess) {
            filterChain.doFilter(request, response);
        } else {
            // g. Si NO tiene acceso
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "No tiene permisos para este módulo");
        }
    }
}
