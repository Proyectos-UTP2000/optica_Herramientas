package com.herramientas.optica.modules.clientes.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.herramientas.optica.modules.clientes.dto.ClienteRegisterDTO;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;
import com.herramientas.optica.modules.shared.dto.CambiarContrasenaRequestDTO;
import com.herramientas.optica.security.controller.AuthController;
import com.herramientas.optica.security.dto.AuthRequest;
import com.herramientas.optica.security.dto.AuthResponse;
import com.herramientas.optica.security.dto.RecuperarContrasenaRequest;
import com.herramientas.optica.security.dto.RestablecerContrasenaClienteRequest;
import com.herramientas.optica.security.dto.RestablecerContrasenaRequest;
import com.herramientas.optica.security.service.CustomUserDetailsService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ClientePortalServiceTest {

    @Autowired
    private ClientePortalService clientePortalService;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private AuthController authController;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private Validator validator;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private com.herramientas.optica.modules.shared.email.EmailService emailService;

    private TipoDocumento tipoDocumento;

    @BeforeEach
    void setUp() {
        tipoDocumento = tipoDocumentoRepository.save(
            TipoDocumento.builder().nombre("DNI").estado(1).build()
        );
    }

    @Test
    void registrarClienteExitosamenteYLogin() {
        ClienteRegisterDTO regDto = ClienteRegisterDTO.builder()
            .nombre("Maria B2C")
            .apellidoPaterno("Gomez")
            .apellidoMaterno("Diaz")
            .numeroDocumento("77778888")
            .idTipoDocumento(tipoDocumento.getId())
            .direccion("Av. Publica 999")
            .telefono("987654321")
            .correo("maria@b2c.com")
            .contrasena("secure123")
            .build();

        // 1. Registro
        var regResponse = authController.registrarCliente(regDto);
        assertThat(regResponse.getStatusCode().value()).isEqualTo(200);

        // 2. Intentar registrar duplicado debe fallar
        var dupResponse = authController.registrarCliente(regDto);
        assertThat(dupResponse.getStatusCode().value()).isEqualTo(400);

        // 3. Login
        AuthRequest loginReq = new AuthRequest();
        loginReq.setUsername("maria@b2c.com");
        loginReq.setPassword("secure123");

        var loginRes = authController.loginCliente(loginReq);
        assertThat(loginRes.getStatusCode().value()).isEqualTo(200);
        AuthResponse authDetails = loginRes.getBody();
        assertThat(authDetails).isNotNull();
        assertThat(authDetails.getToken()).isNotEmpty();
        assertThat(authDetails.getRol()).isEqualTo("CLIENTE");

        // 4. Intentar login con clave incorrecta debe lanzar BadCredentialsException
        AuthRequest badReq = new AuthRequest();
        badReq.setUsername("maria@b2c.com");
        badReq.setPassword("wrongpassword");
        assertThatThrownBy(() ->
            authController.loginCliente(badReq)
        ).isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void obtenerYActualizarPerfilCliente() {
        Cliente cliente = clienteRepository.save(
            Cliente.builder()
                .nombre("Carlos")
                .numeroDocumento("10203040")
                .tipoDocumento(tipoDocumento)
                .direccion("Calle 1")
                .telefono("900000000")
                .correo("carlos@portal.com")
                .contrasena("passwordhashed")
                .estado(1)
                .build()
        );

        // Obtener perfil
        Cliente perfil = clientePortalService.obtenerPerfil(
            "carlos@portal.com"
        );
        assertThat(perfil.getNombre()).isEqualTo("Carlos");

        // Actualizar perfil
        Cliente nuevoPerfil = Cliente.builder()
            .nombre("Carlos Modificado")
            .apellidoPaterno("Torres")
            .telefono("911111111")
            .direccion("Calle Modificada 22")
            .build();

        Cliente actualizado = clientePortalService.actualizarPerfil(
            "carlos@portal.com",
            nuevoPerfil
        );
        assertThat(actualizado.getNombre()).isEqualTo("Carlos Modificado");
        assertThat(actualizado.getApellidoPaterno()).isEqualTo("Torres");
        assertThat(actualizado.getTelefono()).isEqualTo("911111111");
        assertThat(actualizado.getDireccion()).isEqualTo("Calle Modificada 22");
    }

    @Test
    void loadUserByUsernameDualCargaCorrectamente() {
        clienteRepository.save(
            Cliente.builder()
                .nombre("UserDual")
                .numeroDocumento("990011")
                .tipoDocumento(tipoDocumento)
                .direccion("Direccion 1")
                .telefono("999999")
                .correo("dual@test.com")
                .contrasena("hashedpassword")
                .estado(1)
                .build()
        );

        // Carga por correo (Cliente)
        UserDetails details = userDetailsService.loadUserByUsername(
            "dual@test.com"
        );
        assertThat(details.getUsername()).isEqualTo("dual@test.com");
        assertThat(
            details.getAuthorities().iterator().next().getAuthority()
        ).isEqualTo("CLIENTE");

        // Buscar inexistente debe fallar
        assertThatThrownBy(() ->
            userDetailsService.loadUserByUsername("inexistente@test.com")
        ).isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void vincularClienteExistentePresencial() {
        // 1. Crear un cliente presencial sin contraseña
        Cliente presencial = clienteRepository.save(
            Cliente.builder()
                .nombre("Jose Presencial")
                .numeroDocumento("88888888")
                .tipoDocumento(tipoDocumento)
                .direccion("Direccion Presencial")
                .telefono("999888777")
                .estado(1)
                .build()
        );

        // 2. Intentar registrarse vía web con el mismo DNI
        ClienteRegisterDTO regDto = ClienteRegisterDTO.builder()
            .nombre("Jose Modificado")
            .apellidoPaterno("Castro")
            .apellidoMaterno("Luna")
            .numeroDocumento("88888888")
            .idTipoDocumento(tipoDocumento.getId())
            .direccion("Av. Web 123")
            .telefono("999111222")
            .correo("jose@web.com")
            .contrasena("newsecure123")
            .build();

        var regResponse = authController.registrarCliente(regDto);
        assertThat(regResponse.getStatusCode().value()).isEqualTo(200);
        assertThat(regResponse.getBody()).contains("vinculado");

        // 3. Verificar que se actualizó el cliente existente en vez de crear uno nuevo
        Cliente actualizado = clienteRepository
            .findByNumeroDocumento("88888888")
            .orElseThrow();
        assertThat(actualizado.getId()).isEqualTo(presencial.getId());
        assertThat(actualizado.getNombre()).isEqualTo("Jose Modificado");
        assertThat(actualizado.getCorreo()).isEqualTo("jose@web.com");
        assertThat(actualizado.getContrasena()).isNotEmpty();
        assertThat(actualizado.getTelefono()).isEqualTo("999111222");

        // 4. Intentar registrarse de nuevo con el mismo DNI ya activado debe fallar
        var dupResponse = authController.registrarCliente(regDto);
        assertThat(dupResponse.getStatusCode().value()).isEqualTo(400);

        // 5. Intentar registrar a otro usuario con el mismo correo debe fallar
        ClienteRegisterDTO otroDto = ClienteRegisterDTO.builder()
            .nombre("Otro Cliente")
            .numeroDocumento("11223344")
            .idTipoDocumento(tipoDocumento.getId())
            .direccion("Calle Otra 12")
            .telefono("999444333")
            .correo("jose@web.com") // Mismo correo
            .contrasena("otherpass123")
            .build();
        var mailDupResponse = authController.registrarCliente(otroDto);
        assertThat(mailDupResponse.getStatusCode().value()).isEqualTo(400);
    }

    @Test
    void cambiarContrasenaClienteExitosamente() {
        Cliente cliente = clienteRepository.save(
            Cliente.builder()
                .nombre("Juan")
                .numeroDocumento("20304050")
                .tipoDocumento(tipoDocumento)
                .direccion("Calle Falsa 123")
                .telefono("987654320")
                .correo("juan@contrasena.com")
                .contrasena(passwordEncoder.encode("ContrasenaOriginal123!"))
                .estado(1)
                .build()
        );

        CambiarContrasenaRequestDTO request =
            CambiarContrasenaRequestDTO.builder()
                .passwordActual("ContrasenaOriginal123!")
                .passwordNueva("NuevaContrasena99#")
                .build();

        Set<ConstraintViolation<CambiarContrasenaRequestDTO>> violations =
            validator.validate(request);
        assertThat(violations).isEmpty();

        clientePortalService.cambiarContrasena("juan@contrasena.com", request);

        Cliente actualizado = clienteRepository
            .findByCorreo("juan@contrasena.com")
            .orElseThrow();
        assertThat(
            passwordEncoder.matches(
                "NuevaContrasena99#",
                actualizado.getContrasena()
            )
        ).isTrue();
    }

    @Test
    void cambiarContrasenaCliente_FallaClaveActualIncorrecta() {
        Cliente cliente = clienteRepository.save(
            Cliente.builder()
                .nombre("Juan2")
                .numeroDocumento("20304051")
                .tipoDocumento(tipoDocumento)
                .direccion("Calle Falsa 123")
                .telefono("987654322")
                .correo("juan2@contrasena.com")
                .contrasena(passwordEncoder.encode("ContrasenaOriginal123!"))
                .estado(1)
                .build()
        );

        CambiarContrasenaRequestDTO request =
            CambiarContrasenaRequestDTO.builder()
                .passwordActual("ContrasenaIncorrecta!")
                .passwordNueva("NuevaContrasena99#")
                .build();

        assertThatThrownBy(() ->
            clientePortalService.cambiarContrasena(
                "juan2@contrasena.com",
                request
            )
        )
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("La contraseña actual es incorrecta");
    }

    @Test
    void cambiarContrasenaCliente_FallaNuevaClaveInvalida() {
        List<String> contrasenasInvalidas = List.of(
            "abc", // Too short
            "abcdefgh", // No uppercase, no special char
            "ABCDEFGH", // No lowercase, no special char
            "Abcdefgh", // No special char
            "Abcdef!", // Too short (7 characters)
            "12345678", // No letters, no special char
            "Abcdefgh1234" // No special char
        );

        for (String invalidPass : contrasenasInvalidas) {
            CambiarContrasenaRequestDTO request =
                CambiarContrasenaRequestDTO.builder()
                    .passwordActual("ContrasenaOriginal123!")
                    .passwordNueva(invalidPass)
                    .build();

            Set<ConstraintViolation<CambiarContrasenaRequestDTO>> violations =
                validator.validate(request);
            assertThat(violations)
                .withFailMessage(
                    "Password '" +
                        invalidPass +
                        "' should have failed validation but didn't"
                )
                .isNotEmpty();
        }
    }

    @Test
    void cambiarContrasenaCliente_ValidaNuevaClaveExitosa() {
        List<String> contrasenasValidas = List.of(
            "ContrasenaOriginal123!",
            "NuevaContrasena99#",
            "Abcd123_45",
            "Passw0rd*",
            "ValidP@ss"
        );

        for (String validPass : contrasenasValidas) {
            CambiarContrasenaRequestDTO request =
                CambiarContrasenaRequestDTO.builder()
                    .passwordActual("ContrasenaOriginal123!")
                    .passwordNueva(validPass)
                    .build();

            Set<ConstraintViolation<CambiarContrasenaRequestDTO>> violations =
                validator.validate(request);
            assertThat(violations)
                .withFailMessage(
                    "Password '" +
                        validPass +
                        "' should have passed validation but failed"
                )
                .isEmpty();
        }
    }

    @Test
    void recuperarYRestablecerContrasenaClienteExitosamente() {
        Cliente cliente = clienteRepository.save(
            Cliente.builder()
                .nombre("Pedro")
                .numeroDocumento("30405060")
                .tipoDocumento(tipoDocumento)
                .direccion("Calle Luna 123")
                .telefono("987654323")
                .correo("pedro@recuperar.com")
                .contrasena(passwordEncoder.encode("ContrasenaOriginal123!"))
                .estado(1)
                .build()
        );

        // 1. Solicitar código de recuperación
        RecuperarContrasenaRequest recReq = RecuperarContrasenaRequest.builder()
            .correo("pedro@recuperar.com")
            .build();

        var recRes = authController.recuperarContrasenaCliente(recReq);
        assertThat(recRes.getStatusCode().value()).isEqualTo(200);

        // Obtener el código guardado en la BD
        Cliente clienteGuardado = clienteRepository
            .findByCorreo("pedro@recuperar.com")
            .orElseThrow();
        String resetCodigo = clienteGuardado.getResetCodigo();
        assertThat(resetCodigo).isNotNull().hasSize(6);
        assertThat(clienteGuardado.getResetExpiracion()).isNotNull();

        // 2. Restablecer la contraseña
        RestablecerContrasenaClienteRequest restReq =
            RestablecerContrasenaClienteRequest.builder()
                .correo("pedro@recuperar.com")
                .codigo(resetCodigo)
                .nuevaContrasena("NuevaClaveSegura123#")
                .build();

        var restRes = authController.restablecerContrasenaCliente(restReq);
        assertThat(restRes.getStatusCode().value()).isEqualTo(200);

        // Verificar cambio en la BD y limpieza de campos de recuperación
        Cliente clienteActualizado = clienteRepository
            .findByCorreo("pedro@recuperar.com")
            .orElseThrow();
        assertThat(
            passwordEncoder.matches(
                "NuevaClaveSegura123#",
                clienteActualizado.getContrasena()
            )
        ).isTrue();
        assertThat(clienteActualizado.getResetCodigo()).isNull();
        assertThat(clienteActualizado.getResetExpiracion()).isNull();
    }

    @Test
    void recuperarContrasenaCliente_FallaSiNoExiste() {
        RecuperarContrasenaRequest recReq = RecuperarContrasenaRequest.builder()
            .correo("noexiste@recuperar.com")
            .build();

        var recRes = authController.recuperarContrasenaCliente(recReq);
        assertThat(recRes.getStatusCode().value()).isEqualTo(400);
        assertThat(recRes.getBody()).contains("Cliente no encontrado");
    }

    @Test
    void restablecerContrasenaCliente_FallasVarias() {
        Cliente cliente = clienteRepository.save(
            Cliente.builder()
                .nombre("Pedro Fallas")
                .numeroDocumento("30405061")
                .tipoDocumento(tipoDocumento)
                .direccion("Calle Sol 123")
                .telefono("987654324")
                .correo("pedro.fallas@recuperar.com")
                .contrasena(passwordEncoder.encode("ContrasenaOriginal123!"))
                .estado(1)
                .build()
        );

        // Solicitar código
        RecuperarContrasenaRequest recReq = RecuperarContrasenaRequest.builder()
            .correo("pedro.fallas@recuperar.com")
            .build();
        authController.recuperarContrasenaCliente(recReq);

        Cliente clienteGuardado = clienteRepository
            .findByCorreo("pedro.fallas@recuperar.com")
            .orElseThrow();
        String resetCodigo = clienteGuardado.getResetCodigo();

        // 1. Falla con código incorrecto
        RestablecerContrasenaClienteRequest restReqMalaClave =
            RestablecerContrasenaClienteRequest.builder()
                .correo("pedro.fallas@recuperar.com")
                .codigo("000000") // Código inválido
                .nuevaContrasena("NuevaClaveSegura123#")
                .build();

        var restResMalaClave = authController.restablecerContrasenaCliente(
            restReqMalaClave
        );
        assertThat(restResMalaClave.getStatusCode().value()).isEqualTo(400);
        assertThat(restResMalaClave.getBody()).contains(
            "Código de recuperación inválido"
        );

        // 2. Falla si está expirado
        clienteGuardado.setResetExpiracion(
            java.time.LocalDateTime.now().minusMinutes(1)
        ); // Expirado en el pasado
        clienteRepository.save(clienteGuardado);

        RestablecerContrasenaClienteRequest restReqExpirado =
            RestablecerContrasenaClienteRequest.builder()
                .correo("pedro.fallas@recuperar.com")
                .codigo(resetCodigo)
                .nuevaContrasena("NuevaClaveSegura123#")
                .build();

        var restResExpirado = authController.restablecerContrasenaCliente(
            restReqExpirado
        );
        assertThat(restResExpirado.getStatusCode().value()).isEqualTo(400);
        assertThat(restResExpirado.getBody()).contains(
            "El código de recuperación ha expirado"
        );

        // 3. Validación de complejidad de contraseña
        RestablecerContrasenaClienteRequest restReqDebil =
            RestablecerContrasenaClienteRequest.builder()
                .correo("pedro.fallas@recuperar.com")
                .codigo(resetCodigo)
                .nuevaContrasena("debil") // Demasiado corta y sin mayúsculas/especiales
                .build();

        Set<
            ConstraintViolation<RestablecerContrasenaClienteRequest>
        > violations = validator.validate(restReqDebil);
        assertThat(violations).isNotEmpty();
    }

    @Test
    void recuperarYRestablecerContrasenaEmpleadoExitosamente() {
        Perfil perfil = perfilRepository.save(
            Perfil.builder()
                .nombre("PERFIL_RECUPERA")
                .descripcion("Perfil de prueba recupera")
                .estado(1)
                .build()
        );

        Empleado empleado = empleadoRepository.save(
            Empleado.builder()
                .nombre("PedroEmp")
                .username("pedroemp")
                .apellidoPaterno("Prueba")
                .apellidoMaterno("Recupera")
                .correo("pedroemp@recuperar.com")
                .contrasena(passwordEncoder.encode("ContrasenaOriginal123!"))
                .telefono("999123456")
                .direccion("Direccion de prueba")
                .estado(1)
                .numeroDocumento("88887777")
                .perfil(perfil)
                .idTipoDocumento(1L)
                .build()
        );

        // 1. Solicitar código de recuperación
        RecuperarContrasenaRequest recReq = RecuperarContrasenaRequest.builder()
            .correo("pedroemp@recuperar.com")
            .build();

        var recRes = authController.recuperarContrasena(recReq);
        assertThat(recRes.getStatusCode().value()).isEqualTo(200);

        // Obtener el código guardado en la BD
        Empleado empGuardado = empleadoRepository
            .findByCorreo("pedroemp@recuperar.com")
            .orElseThrow();
        String resetCodigo = empGuardado.getResetCodigo();
        assertThat(resetCodigo).isNotNull().hasSize(6);
        assertThat(empGuardado.getResetExpiracion()).isNotNull();

        // 2. Restablecer la contraseña
        RestablecerContrasenaRequest restReq =
            RestablecerContrasenaRequest.builder()
                .emailOrUsername("pedroemp")
                .codigo(resetCodigo)
                .nuevaContrasena("NuevaClaveSegura123#")
                .build();

        var restRes = authController.restablecerContrasena(restReq);
        assertThat(restRes.getStatusCode().value()).isEqualTo(200);

        // Verificar cambio en la BD y limpieza de campos de recuperación
        Empleado empActualizado = empleadoRepository
            .findByCorreo("pedroemp@recuperar.com")
            .orElseThrow();
        assertThat(
            passwordEncoder.matches(
                "NuevaClaveSegura123#",
                empActualizado.getContrasena()
            )
        ).isTrue();
        assertThat(empActualizado.getResetCodigo()).isNull();
        assertThat(empActualizado.getResetExpiracion()).isNull();
    }
}
