package com.herramientas.optica.security.jwt;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Opcion;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.OpcionRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class DynamicAuthorizationFilter extends OncePerRequestFilter {

    private final EmpleadoRepository empleadoRepository;
    private final OpcionRepository opcionRepository;

    public DynamicAuthorizationFilter(EmpleadoRepository empleadoRepository, OpcionRepository opcionRepository) {
        this.empleadoRepository = empleadoRepository;
        this.opcionRepository = opcionRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // a. Permitir peticiones OPTIONS (CORS preflight) sin validación
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // b. Rutas públicas de autenticación se permiten siempre
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

        // Normalizamos la URI
        final String finalPath = normalizePath(path);
        
        // Caso especial: La API de /opciones se permite si el usuario tiene acceso a /configuracion-menu
        boolean accessToConfigMenu = empleado.getPerfil().getOpciones().stream()
                .anyMatch(o -> "/configuracion-menu".equals(normalizePath(o.getRuta())));
        
        if (finalPath.startsWith("/opciones") && accessToConfigMenu) {
            filterChain.doFilter(request, response);
            return;
        }
        
        boolean hasExplicitAccess = empleado.getPerfil().getOpciones().stream()
                .anyMatch(opcion -> {
                    String compareRuta = normalizePath(opcion.getRuta());
                    if (compareRuta.equals("/")) return finalPath.equals("/");
                    
                    // Si la ruta es exactamente igual o si es un prefijo (ej: /clientes permite /clientes/1)
                    return finalPath.equals(compareRuta) || finalPath.startsWith(compareRuta + "/");
                });

        if (hasExplicitAccess) {
            filterChain.doFilter(request, response);
            return;
        }

        // NUEVA LÓGICA: Herencia para GET
        if ("GET".equalsIgnoreCase(request.getMethod())) {
            boolean hasParentAccess = empleado.getPerfil().getOpciones().stream().anyMatch(opcionAutorizada -> 
                esHijoDeOpcionAutorizada(opcionAutorizada, finalPath)
            );
            
            if (hasParentAccess) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // f. Si NO tiene acceso
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\": \"No tiene permisos para acceder a este módulo (" + finalPath + ")\"}");
    }

    private String normalizePath(String ruta) {
        if (ruta == null || ruta.isEmpty()) return "/";
        String normalized = ruta.replace("/api/v1", "");
        if (!normalized.startsWith("/")) normalized = "/" + normalized;
        if (normalized.length() > 1 && normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private boolean esHijoDeOpcionAutorizada(Opcion opcionAutorizada, String pathSolicitado) {
        // Buscamos la opción en la DB que corresponde al path solicitado
        // Como no sabemos si en la DB está como /marcas o marcas, usamos findAll y filtramos
        // En una app real con miles de opciones esto se optimizaría con un Map cacheado
        List<Opcion> opcionesEnEsePath = opcionRepository.findAll().stream()
                .filter(o -> pathSolicitado.equals(normalizePath(o.getRuta())))
                .collect(Collectors.toList());

        for (Opcion op : opcionesEnEsePath) {
            if (esDescendiente(op, opcionAutorizada)) {
                return true;
            }
        }
        return false;
    }

    private boolean esDescendiente(Opcion hijo, Opcion ancestroPosible) {
        Opcion padre = hijo.getPadre();
        while (padre != null) {
            if (padre.getId().equals(ancestroPosible.getId())) {
                return true;
            }
            // Importante: Asegurar que el padre esté cargado si es Lazy, 
            // aunque aquí estamos en la misma transacción/sesión de Spring Security usualmente
            padre = padre.getPadre();
        }
        return false;
    }
}
