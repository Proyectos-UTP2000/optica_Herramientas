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
import com.herramientas.optica.security.dto.RecuperarContrasenaRequest;
import com.herramientas.optica.security.dto.RestablecerContrasenaRequest;
import com.herramientas.optica.security.dto.RestablecerContrasenaClienteRequest;
import com.herramientas.optica.modules.shared.email.EmailService;
import com.herramientas.optica.security.jwt.JwtService;
import com.herramientas.optica.security.service.CustomUserDetailsService;
import org.springframework.transaction.annotation.Transactional;

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
    private final com.herramientas.optica.modules.clientes.repository.ClienteRepository clienteRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository tipoDocumentoRepository;
    private final EmailService emailService;

    public AuthController(AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            JwtService jwtService,
            EmpleadoRepository empleadoRepository,
            com.herramientas.optica.modules.clientes.repository.ClienteRepository clienteRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository tipoDocumentoRepository,
            EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.empleadoRepository = empleadoRepository;
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
        this.emailService = emailService;
    }

    @PostMapping("/cliente/register")
    public ResponseEntity<String> registrarCliente(@Valid @RequestBody com.herramientas.optica.modules.clientes.dto.ClienteRegisterDTO dto) {
        var optClienteByDoc = clienteRepository.findByNumeroDocumento(dto.getNumeroDocumento());
        if (optClienteByDoc.isPresent()) {
            var existingCliente = optClienteByDoc.get();
            if (existingCliente.getContrasena() != null && !existingCliente.getContrasena().isBlank()) {
                return ResponseEntity.badRequest().body("El número de documento ya está registrado.");
            }
            
            // Validar que el correo no esté registrado por OTRO cliente
            var optClienteByCorreo = clienteRepository.findByCorreo(dto.getCorreo());
            if (optClienteByCorreo.isPresent() && !optClienteByCorreo.get().getId().equals(existingCliente.getId())) {
                return ResponseEntity.badRequest().body("El correo ya está registrado.");
            }
            
            var tipoDoc = tipoDocumentoRepository.findById(dto.getIdTipoDocumento())
                    .orElseThrow(() -> new RuntimeException("Tipo de documento no válido"));
            
            // Vincular cuenta presencial existente
            existingCliente.setNombre(dto.getNombre());
            existingCliente.setApellidoPaterno(dto.getApellidoPaterno());
            existingCliente.setApellidoMaterno(dto.getApellidoMaterno());
            existingCliente.setCorreo(dto.getCorreo());
            existingCliente.setTelefono(dto.getTelefono());
            existingCliente.setDireccion(dto.getDireccion());
            existingCliente.setContrasena(passwordEncoder.encode(dto.getContrasena()));
            existingCliente.setTipoDocumento(tipoDoc);
            existingCliente.setEstado(1);
            
            clienteRepository.save(existingCliente);
            return ResponseEntity.ok("Cliente registrado y vinculado exitosamente.");
        }

        if (clienteRepository.existsByCorreo(dto.getCorreo())) {
            return ResponseEntity.badRequest().body("El correo ya está registrado.");
        }
        var tipoDoc = tipoDocumentoRepository.findById(dto.getIdTipoDocumento())
                .orElseThrow(() -> new RuntimeException("Tipo de documento no válido"));
        
        var cliente = com.herramientas.optica.modules.clientes.model.Cliente.builder()
                .nombre(dto.getNombre())
                .apellidoPaterno(dto.getApellidoPaterno())
                .apellidoMaterno(dto.getApellidoMaterno())
                .numeroDocumento(dto.getNumeroDocumento())
                .tipoDocumento(tipoDoc)
                .direccion(dto.getDireccion())
                .telefono(dto.getTelefono())
                .correo(dto.getCorreo())
                .contrasena(passwordEncoder.encode(dto.getContrasena()))
                .estado(1)
                .build();
        
        clienteRepository.save(cliente);
        return ResponseEntity.ok("Cliente registrado exitosamente.");
    }

    @PostMapping("/cliente/login")
    public ResponseEntity<AuthResponse> loginCliente(@Valid @RequestBody AuthRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtService.generateToken(userDetails);
        var cliente = clienteRepository.findByCorreo(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .username(userDetails.getUsername())
                .rol("CLIENTE")
                .empleadoId(cliente.getId())
                .build());
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

    @PostMapping("/recuperar-contrasena")
    @Transactional
    public ResponseEntity<String> recuperarContrasena(@Valid @RequestBody RecuperarContrasenaRequest request) {
        var optEmpleado = empleadoRepository.findByCorreoOrUsername(request.getCorreo(), request.getCorreo());
        if (optEmpleado.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }
        Empleado empleado = optEmpleado.get();
        String code = String.format("%06d", 100000 + new java.util.Random().nextInt(900000));
        empleado.setResetCodigo(code);
        empleado.setResetExpiracion(java.time.LocalDateTime.now().plusMinutes(15));
        empleadoRepository.save(empleado);

        emailService.enviarCodigoRecuperacion(empleado.getCorreo(), empleado.getNombre(), code);
        return ResponseEntity.ok("Código de recuperación enviado exitosamente.");
    }

    @PostMapping("/restablecer-contrasena")
    @Transactional
    public ResponseEntity<String> restablecerContrasena(@Valid @RequestBody RestablecerContrasenaRequest request) {
        var optEmpleado = empleadoRepository.findByCorreoOrUsername(request.getEmailOrUsername(), request.getEmailOrUsername());
        if (optEmpleado.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }
        Empleado empleado = optEmpleado.get();
        if (empleado.getResetCodigo() == null || !empleado.getResetCodigo().equals(request.getCodigo())) {
            return ResponseEntity.badRequest().body("Código de recuperación inválido");
        }
        if (empleado.getResetExpiracion() == null || empleado.getResetExpiracion().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("El código de recuperación ha expirado");
        }

        empleado.setContrasena(passwordEncoder.encode(request.getNuevaContrasena()));
        empleado.setResetCodigo(null);
        empleado.setResetExpiracion(null);
        empleadoRepository.save(empleado);

        return ResponseEntity.ok("Contraseña restablecida exitosamente.");
    }

    @PostMapping("/cliente/recuperar-contrasena")
    @Transactional
    public ResponseEntity<String> recuperarContrasenaCliente(@Valid @RequestBody RecuperarContrasenaRequest request) {
        var optCliente = clienteRepository.findByCorreo(request.getCorreo());
        if (optCliente.isEmpty()) {
            return ResponseEntity.badRequest().body("Cliente no encontrado");
        }
        var cliente = optCliente.get();
        String code = String.format("%06d", 100000 + new java.util.Random().nextInt(900000));
        cliente.setResetCodigo(code);
        cliente.setResetExpiracion(java.time.LocalDateTime.now().plusMinutes(15));
        clienteRepository.save(cliente);

        emailService.enviarCodigoRecuperacion(cliente.getCorreo(), cliente.getNombre(), code);
        return ResponseEntity.ok("Código de recuperación enviado exitosamente.");
    }

    @PostMapping("/cliente/restablecer-contrasena")
    @Transactional
    public ResponseEntity<String> restablecerContrasenaCliente(@Valid @RequestBody RestablecerContrasenaClienteRequest request) {
        var optCliente = clienteRepository.findByCorreo(request.getCorreo());
        if (optCliente.isEmpty()) {
            return ResponseEntity.badRequest().body("Cliente no encontrado");
        }
        var cliente = optCliente.get();
        if (cliente.getResetCodigo() == null || !cliente.getResetCodigo().equals(request.getCodigo())) {
            return ResponseEntity.badRequest().body("Código de recuperación inválido");
        }
        if (cliente.getResetExpiracion() == null || cliente.getResetExpiracion().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("El código de recuperación ha expirado");
        }

        cliente.setContrasena(passwordEncoder.encode(request.getNuevaContrasena()));
        cliente.setResetCodigo(null);
        cliente.setResetExpiracion(null);
        clienteRepository.save(cliente);

        return ResponseEntity.ok("Contraseña restablecida exitosamente.");
    }
}
