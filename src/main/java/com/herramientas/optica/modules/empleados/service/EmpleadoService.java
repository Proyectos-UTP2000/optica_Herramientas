package com.herramientas.optica.modules.empleados.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;

import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.DniResponse;
import com.herramientas.optica.modules.api.service.DNI_RUC_Service;
import com.herramientas.optica.modules.empleados.dto.EmpleadoRequestDTO;
import com.herramientas.optica.modules.empleados.dto.EmpleadoResponseDTO;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;

@Service
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final PerfilRepository perfilRepository;
    private final DNI_RUC_Service dniRucService;
    private final PasswordEncoder passwordEncoder;

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_DESHABILITADO = 2;
    private static final int ESTADO_BORRADO = 0;

    public EmpleadoService(EmpleadoRepository empleadoRepository, PerfilRepository perfilRepository,
            DNI_RUC_Service dniRucService, PasswordEncoder passwordEncoder) {
        this.empleadoRepository = empleadoRepository;
        this.perfilRepository = perfilRepository;
        this.dniRucService = dniRucService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public EmpleadoResponseDTO crearEmpleado(EmpleadoRequestDTO dto) {

        Optional<Empleado> empleadoExistente = empleadoRepository.findByNumeroDocumento(dto.getDni());
        if (empleadoExistente.isPresent()) {
            Empleado emp = empleadoExistente.get();
            if (emp.getEstado() == ESTADO_BORRADO) {
                throw new IllegalStateException("El DNI " + dto.getDni()
                        + " pertenece a un empleado eliminado del sistema. ¿Desea reactivarlo?");
            } else {
                String estadoActual = (emp.getEstado() == ESTADO_ACTIVO) ? "Activo" : "Deshabilitado";
                throw new IllegalArgumentException(
                        "El empleado con DNI " + dto.getDni() + " ya existe y se encuentra " + estadoActual + ".");
            }
        }
        if (empleadoRepository.existsByCorreo(dto.getCorreo())) {
            throw new IllegalArgumentException("El correo ingresado ya está en uso por otro empleado.");
        }
        if (empleadoRepository.existsByTelefono(dto.getTelefono())) {
            throw new IllegalArgumentException("El teléfono ingresado ya está en uso por otro empleado.");
        }

        Perfil perfil = perfilRepository.findById(dto.getIdPerfil())
                .orElseThrow(() -> new IllegalArgumentException("El perfil de acceso seleccionado no existe."));
        DniResponse apiResponse;
        try {
            apiResponse = dniRucService.consultarDni(dto.getDni());
            if (apiResponse == null || !apiResponse.isSuccess() || apiResponse.getDatos() == null) {
                throw new IllegalStateException(
                        "La API de RENIEC no devolvió resultados válidos para el DNI proporcionado.");
            }
        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Error de red al consultar el DNI. Intente nuevamente más tarde. Detalle: " + e.getMessage());
        }
        String nombres = apiResponse.getDatos().getNombres();
        String apePaterno = apiResponse.getDatos().getApePaterno();
        String apeMaterno = apiResponse.getDatos().getApeMaterno();
        String direccionFinal = "NO ESPECIFICADA";
        if (apiResponse.getDatos().getDomiciliado() != null &&
                apiResponse.getDatos().getDomiciliado().getDireccion() != null &&
                !apiResponse.getDatos().getDomiciliado().getDireccion().trim().isEmpty()) {
            direccionFinal = apiResponse.getDatos().getDomiciliado().getDireccion();
        } else if (dto.getDireccion() != null && !dto.getDireccion().trim().isEmpty()) {
            direccionFinal = dto.getDireccion();
        }

        String baseUsername = (nombres.charAt(0) + apePaterno).toLowerCase().replaceAll("\\s+", "");
        String usernameGenerado = generarUsernameUnico(baseUsername);
        String rawPassword = UUID.randomUUID().toString().substring(0, 8);
        String encodedPassword = passwordEncoder.encode(rawPassword);

        Empleado nuevoEmpleado = Empleado.builder()
                .numeroDocumento(dto.getDni())
                .nombre(nombres)
                .apellidoPaterno(apePaterno)
                .apellidoMaterno(apeMaterno)
                .correo(dto.getCorreo())
                .telefono(dto.getTelefono())
                .direccion(direccionFinal)
                .username(usernameGenerado)
                .contrasena(encodedPassword)
                .perfil(perfil)
                .idTipoDocumento(1L)
                .idEmpresa(1L)
                .estado(ESTADO_ACTIVO)
                .build();

        empleadoRepository.save(nuevoEmpleado);
        return mapearAResponse(nuevoEmpleado);
    }

    public EmpleadoResponseDTO buscarPorId(Long id) {
        Empleado empleado = obtenerEmpleadoValidado(id, false);
        return mapearAResponse(empleado);
    }

    public List<EmpleadoResponseDTO> listarActivosEInactivos() {
        return empleadoRepository.findByEstadoNot(ESTADO_BORRADO).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmpleadoResponseDTO cambiarEstado(Long id) {
        Empleado empleado = obtenerEmpleadoValidado(id, true);

        if (empleado.getEstado() == null) {
            throw new IllegalStateException("El estado actual del empleado es nulo y no puede ser procesado.");
        }

        switch (empleado.getEstado()) {
            case ESTADO_ACTIVO -> empleado.setEstado(ESTADO_DESHABILITADO);
            case ESTADO_DESHABILITADO -> empleado.setEstado(ESTADO_ACTIVO);
            default -> throw new IllegalStateException("El estado actual del empleado no permite ser alternado.");
        }

        empleadoRepository.save(empleado);
        return mapearAResponse(empleado);
    }

    @Transactional
    public void borradoLogico(Long id) {
        Empleado empleado = obtenerEmpleadoValidado(id, true);
        empleado.setEstado(ESTADO_BORRADO);
        empleadoRepository.save(empleado);
    }

    // Metodos privados
    private Empleado obtenerEmpleadoValidado(Long id, boolean bloquearBorrados) {
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ningún empleado con el ID: " + id));

        if (bloquearBorrados && empleado.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException(
                    "Acción denegada: El empleado seleccionado se encuentra eliminado del sistema.");
        }
        return empleado;
    }

    private String generarUsernameUnico(String baseUsername) {
        String username = baseUsername;
        int contador = 1;
        while (empleadoRepository.existsByUsername(username)) {
            username = baseUsername + contador;
            contador++;
        }
        return username;
    }

    private EmpleadoResponseDTO mapearAResponse(Empleado e) {
        return EmpleadoResponseDTO.builder()
                .id(e.getId())
                .dni(e.getNumeroDocumento())
                .nombres(e.getNombre())
                .apellidos(e.getApellidoPaterno() + " " + e.getApellidoMaterno())
                .username(e.getUsername())
                .correo(e.getCorreo())
                .telefono(e.getTelefono())
                .direccion(e.getDireccion())
                .estado(e.getEstado())
                .perfilNombre(e.getPerfil().getNombre())
                .build();
    }
}