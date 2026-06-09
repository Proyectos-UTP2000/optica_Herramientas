package com.herramientas.optica.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.empleados.dto.OpcionResponseDTO;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.security.dto.AuthRequest;
import com.herramientas.optica.security.dto.AuthResponse;
import com.herramientas.optica.security.jwt.JwtService;
import com.herramientas.optica.security.service.CustomUserDetailsService;

import jakarta.validation.Valid;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final EmpleadoRepository empleadoRepository;

    public AuthController(AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            JwtService jwtService,
            EmpleadoRepository empleadoRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.empleadoRepository = empleadoRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        // Veri si el usuario existe y si la contraseña es correcta
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        // Si todo va bien, los datos cargan
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // Se crea el token
        String token = jwtService.generateToken(userDetails);

        // Devolvemos el token y los datos basicos del usuario
        String rol = userDetails.getAuthorities().iterator().next().getAuthority();

        Empleado empleado = empleadoRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .username(userDetails.getUsername())
                .rol(rol)
                .empleadoId(empleado.getId())
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Sesión cerrada exitosamente en el servidor.");
    }

    @GetMapping("/mis-opciones")
    public ResponseEntity<List<OpcionResponseDTO>> getMisOpciones() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Empleado empleado = empleadoRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        List<OpcionResponseDTO> opciones = empleado.getPerfil().getOpciones().stream()
                .sorted(Comparator.comparing(op -> op.getOrden() != null ? op.getOrden() : 0))
                .map(opcion -> OpcionResponseDTO.builder()
                        .id(opcion.getId())
                        .nombre(opcion.getNombre())
                        .ruta(opcion.getRuta())
                        .icono(opcion.getIcono())
                        .idPadre(opcion.getPadre() != null ? opcion.getPadre().getId() : null)
                        .orden(opcion.getOrden())
                        .visibleEnMenu(Boolean.TRUE.equals(opcion.getVisibleEnMenu()))
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(opciones);
    }
}
