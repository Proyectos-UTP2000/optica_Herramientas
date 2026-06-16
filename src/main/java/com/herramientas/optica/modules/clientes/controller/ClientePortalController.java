package com.herramientas.optica.modules.clientes.controller;

import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.service.ClientePortalService;
import com.herramientas.optica.modules.cotizaciones.dto.CotizacionDTO;
import com.herramientas.optica.modules.shared.dto.CambiarContrasenaRequestDTO;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cliente-portal")
public class ClientePortalController {

    private final ClientePortalService portalService;

    public ClientePortalController(ClientePortalService portalService) {
        this.portalService = portalService;
    }

    private String getLoggedEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/perfil")
    public ResponseEntity<Cliente> obtenerPerfil() {
        return ResponseEntity.ok(portalService.obtenerPerfil(getLoggedEmail()));
    }

    @PutMapping("/perfil")
    public ResponseEntity<Cliente> actualizarPerfil(@RequestBody Cliente body) {
        return ResponseEntity.ok(
            portalService.actualizarPerfil(getLoggedEmail(), body)
        );
    }

    @GetMapping("/cotizaciones")
    public ResponseEntity<List<CotizacionDTO>> listarCotizaciones() {
        return ResponseEntity.ok(
            portalService.listarCotizaciones(getLoggedEmail())
        );
    }

    @PutMapping("/perfil/contrasena")
    public ResponseEntity<?> cambiarContrasena(
        @Valid @RequestBody CambiarContrasenaRequestDTO dto
    ) {
        portalService.cambiarContrasena(getLoggedEmail(), dto);
        return ResponseEntity.ok(
            java.util.Map.of("message", "Contraseña cambiada exitosamente.")
        );
    }
}
