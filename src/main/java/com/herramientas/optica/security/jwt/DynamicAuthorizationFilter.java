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

        // a. Rutas públicas de autenticación se permiten siempre
        if (path.startsWith("/api/v1/auth/")) {
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

        // d. El Dashboard básico (stats) es accesible para todos los autenticados
        if (path.equals("/api/v1/dashboard/stats")) {
            filterChain.doFilter(request, response);
            return;
        }

        // e. Verifica si alguna de las 'Opcion' del perfil tiene una 'ruta' que coincida
        // Normalizamos la URI quitando el prefijo /api/v1 si existe
        String normalizedPath = path.replace("/api/v1", "");
        
        boolean hasAccess = empleado.getPerfil().getOpciones().stream()
                .anyMatch(opcion -> {
                    String ruta = opcion.getRuta();
                    if (ruta == null || ruta.isEmpty()) return false;
                    
                    // Normalizar ruta de la DB: asegurar que empiece con /
                    String cleanRuta = ruta.startsWith("/") ? ruta : "/" + ruta;
                    
                    // Si la ruta es exactamente igual o si es un prefijo (ej: /clientes permite /clientes/1)
                    return normalizedPath.equals(cleanRuta) || normalizedPath.startsWith(cleanRuta + "/");
                });

        if (hasAccess) {
            filterChain.doFilter(request, response);
        } else {
            // f. Si NO tiene acceso
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"No tiene permisos para acceder a este módulo (" + normalizedPath + ")\"}");
        }
    }
}
