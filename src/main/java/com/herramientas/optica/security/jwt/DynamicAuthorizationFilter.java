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

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

public class DynamicAuthorizationFilter extends OncePerRequestFilter {

    private final EmpleadoRepository empleadoRepository;
    private final OpcionRepository opcionRepository;
    
    // Cache para evitar consultas constantes a la DB
    private Map<String, List<Opcion>> cacheOpcionesPorRuta = new ConcurrentHashMap<>();
    private LocalDateTime ultimaActualizacionCache = LocalDateTime.MIN;
    private static final int CACHE_EXPIRATION_MINUTES = 5;

    public DynamicAuthorizationFilter(EmpleadoRepository empleadoRepository, OpcionRepository opcionRepository) {
        this.empleadoRepository = empleadoRepository;
        this.opcionRepository = opcionRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/") || path.startsWith("/api/v1/public/") || path.startsWith("/api/v1/cliente-portal/")) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            filterChain.doFilter(request, response);
            return;
        }

        String username = authentication.getName();
        Empleado empleado = empleadoRepository.findByUsername(username).orElse(null);

        if (empleado == null || empleado.getPerfil() == null) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Usuario sin perfil asignado o no encontrado");
            return;
        }

        if (path.startsWith("/api/v1/dashboard/") || path.startsWith("/api/v1/empleados/perfil/")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String finalPath = normalizePath(path);
        
        // --- RUTAS DE UTILIDAD COMPARTIDAS ---
        // Se permiten para cualquier usuario autenticado (GET) para soporte de módulos
        if ("GET".equalsIgnoreCase(request.getMethod())) {
            if (finalPath.equals("/opciones") || 
                finalPath.startsWith("/dni") || 
                finalPath.startsWith("/ruc")) {
                filterChain.doFilter(request, response);
                return;
            }
        }
        
        // Refrescamos cache si es necesario
        refreshCacheIfNeeded();

        // 1. Verificar acceso explícito (Directo o por prefijo de ruta gestionada)
        boolean hasExplicitAccess = empleado.getPerfil().getOpciones().stream()
                .anyMatch(opcion -> {
                    String compareRuta = normalizePath(opcion.getRuta());
                    if ("/".equals(compareRuta)) return "/".equals(finalPath);
                    
                    // Caso especial: El módulo de configuración de menú usa la API /opciones
                    if (finalPath.startsWith("/opciones") && compareRuta.equals("/configuracion-menu")) {
                        return true;
                    }
                    
                    return finalPath.equals(compareRuta) || finalPath.startsWith(compareRuta + "/");
                });

        if (hasExplicitAccess) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Lógica de Herencia (Solo para GET)
        if ("GET".equalsIgnoreCase(request.getMethod())) {
            List<Opcion> opcionesEnPath = cacheOpcionesPorRuta.getOrDefault(finalPath, List.of());
            
            for (Opcion op : opcionesEnPath) {
                if (tieneAncestroAutorizado(op, empleado.getPerfil().getOpciones())) {
                    filterChain.doFilter(request, response);
                    return;
                }
            }
        }

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\": \"No tiene permisos para acceder a este módulo (" + finalPath + ")\"}");
    }

    private synchronized void refreshCacheIfNeeded() {
        if (ultimaActualizacionCache.isBefore(LocalDateTime.now().minusMinutes(CACHE_EXPIRATION_MINUTES))) {
            List<Opcion> todas = opcionRepository.findAll();
            Map<String, List<Opcion>> nuevoMapa = new ConcurrentHashMap<>();
            for (Opcion op : todas) {
                String r = normalizePath(op.getRuta());
                nuevoMapa.computeIfAbsent(r, k -> new java.util.ArrayList<>()).add(op);
            }
            this.cacheOpcionesPorRuta = nuevoMapa;
            this.ultimaActualizacionCache = LocalDateTime.now();
        }
    }

    private boolean tieneAncestroAutorizado(Opcion hijo, java.util.Collection<Opcion> autorizadas) {
        Opcion actual = hijo.getPadre();
        while (actual != null) {
            final Long idAncestro = actual.getId();
            if (autorizadas.stream().anyMatch(a -> a.getId().equals(idAncestro))) {
                return true;
            }
            actual = actual.getPadre();
        }
        return false;
    }

    private String normalizePath(String ruta) {
        if (ruta == null || ruta.isEmpty() || "/".equals(ruta)) return "/";
        String normalized = ruta;
        if (normalized.startsWith("/api/v1")) normalized = normalized.substring(7);
        else if (normalized.startsWith("api/v1")) normalized = normalized.substring(6);
        
        if (!normalized.startsWith("/")) normalized = "/" + normalized;
        if (normalized.length() > 1 && normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized.isEmpty() ? "/" : normalized;
    }
}
