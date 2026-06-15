package com.herramientas.optica.modules.clientes.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.clientes.dto.ClienteRegisterDTO;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.security.controller.AuthController;
import com.herramientas.optica.security.dto.AuthRequest;
import com.herramientas.optica.security.dto.AuthResponse;
import com.herramientas.optica.security.service.CustomUserDetailsService;

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

    private TipoDocumento tipoDocumento;

    @BeforeEach
    void setUp() {
        tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("DNI")
                .estado(1)
                .build());
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
        assertThatThrownBy(() -> authController.loginCliente(badReq))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void obtenerYActualizarPerfilCliente() {
        Cliente cliente = clienteRepository.save(Cliente.builder()
                .nombre("Carlos")
                .numeroDocumento("10203040")
                .tipoDocumento(tipoDocumento)
                .direccion("Calle 1")
                .telefono("900000000")
                .correo("carlos@portal.com")
                .contrasena("passwordhashed")
                .estado(1)
                .build());

        // Obtener perfil
        Cliente perfil = clientePortalService.obtenerPerfil("carlos@portal.com");
        assertThat(perfil.getNombre()).isEqualTo("Carlos");

        // Actualizar perfil
        Cliente nuevoPerfil = Cliente.builder()
                .nombre("Carlos Modificado")
                .apellidoPaterno("Torres")
                .telefono("911111111")
                .direccion("Calle Modificada 22")
                .build();

        Cliente actualizado = clientePortalService.actualizarPerfil("carlos@portal.com", nuevoPerfil);
        assertThat(actualizado.getNombre()).isEqualTo("Carlos Modificado");
        assertThat(actualizado.getApellidoPaterno()).isEqualTo("Torres");
        assertThat(actualizado.getTelefono()).isEqualTo("911111111");
        assertThat(actualizado.getDireccion()).isEqualTo("Calle Modificada 22");
    }

    @Test
    void loadUserByUsernameDualCargaCorrectamente() {
        clienteRepository.save(Cliente.builder()
                .nombre("UserDual")
                .numeroDocumento("990011")
                .tipoDocumento(tipoDocumento)
                .direccion("Direccion 1")
                .telefono("999999")
                .correo("dual@test.com")
                .contrasena("hashedpassword")
                .estado(1)
                .build());

        // Carga por correo (Cliente)
        UserDetails details = userDetailsService.loadUserByUsername("dual@test.com");
        assertThat(details.getUsername()).isEqualTo("dual@test.com");
        assertThat(details.getAuthorities().iterator().next().getAuthority()).isEqualTo("CLIENTE");

        // Buscar inexistente debe fallar
        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("inexistente@test.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void vincularClienteExistentePresencial() {
        // 1. Crear un cliente presencial sin contraseña
        Cliente presencial = clienteRepository.save(Cliente.builder()
                .nombre("Jose Presencial")
                .numeroDocumento("88888888")
                .tipoDocumento(tipoDocumento)
                .direccion("Direccion Presencial")
                .telefono("999888777")
                .estado(1)
                .build());

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
        Cliente actualizado = clienteRepository.findByNumeroDocumento("88888888").orElseThrow();
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
}

