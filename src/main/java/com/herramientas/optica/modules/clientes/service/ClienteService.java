package com.herramientas.optica.modules.clientes.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;

import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.DniResponse;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.RucResponse;
import com.herramientas.optica.modules.api.service.DNI_RUC_Service;
import com.herramientas.optica.modules.clientes.dto.ClienteRequestDTO;
import com.herramientas.optica.modules.clientes.dto.ClienteResponseDTO;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final DNI_RUC_Service dniRucService;

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_DESHABILITADO = 2;
    private static final int ESTADO_BORRADO = 0;

    public ClienteService(ClienteRepository clienteRepository, TipoDocumentoRepository tipoDocumentoRepository,
            DNI_RUC_Service dniRucService) {
        this.clienteRepository = clienteRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
        this.dniRucService = dniRucService;
    }

    public List<ClienteResponseDTO> listarActivosEInactivos() {
        return clienteRepository.findByEstadoNot(ESTADO_BORRADO).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    public ClienteResponseDTO buscarPorId(Long id) {
        return mapearAResponse(obtenerClienteValidado(id, false));
    }

    @Transactional
    public ClienteResponseDTO crearCliente(ClienteRequestDTO dto) {

        String numeroDocumento = normalizarNumeroDocumento(dto.getNumeroDocumento());
        Optional<Cliente> clienteExistente = clienteRepository.findByNumeroDocumento(numeroDocumento);
        if (clienteExistente.isPresent()) {
            if (clienteExistente.get().getEstado() == ESTADO_BORRADO) {
                throw new IllegalStateException("El cliente con documento " + numeroDocumento
                        + " está eliminado. ¿Desea reactivarlo?");
            }
            throw new IllegalArgumentException(
                    "El cliente con documento " + numeroDocumento + " ya se encuentra registrado.");
        }

        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(dto.getIdTipoDocumento())
                .orElseThrow(() -> new IllegalArgumentException("El tipo de documento seleccionado no existe."));

        validarLongitudDocumento(numeroDocumento, tipoDoc);

        Cliente.ClienteBuilder clienteBuilder = Cliente.builder()
                .numeroDocumento(numeroDocumento)
                .correo(validarYNormalizarCorreo(dto.getCorreo(), null))
                .telefono(validarYNormalizarTelefono(dto.getTelefono(), null))
                .tipoDocumento(tipoDoc)
                .estado(ESTADO_ACTIVO);
        String direccionFinal = dto.getDireccion();

        try {
            if (esDni(tipoDoc)) {
                DniResponse dniResponse = dniRucService.consultarDni(numeroDocumento);
                if (dniResponse == null || !dniResponse.isSuccess() || dniResponse.getDatos() == null) {
                    throw new IllegalStateException("La API no devolvió resultados válidos para el DNI proporcionado.");
                }
                clienteBuilder
                        .nombre(dniResponse.getDatos().getNombres())
                        .apellidoPaterno(dniResponse.getDatos().getApePaterno())
                        .apellidoMaterno(dniResponse.getDatos().getApeMaterno());

                if (direccionFinal == null || direccionFinal.trim().isEmpty()) {
                    direccionFinal = (dniResponse.getDatos().getDomiciliado() != null
                            && dniResponse.getDatos().getDomiciliado().getDireccion() != null)
                                    ? dniResponse.getDatos().getDomiciliado().getDireccion()
                                    : "NO ESPECIFICADA";
                }

            } else if (esRuc(tipoDoc)) {
                RucResponse rucResponse = dniRucService.consultarRuc(numeroDocumento);
                if (rucResponse == null || !rucResponse.isSuccess() || rucResponse.getDatos() == null) {
                    throw new IllegalStateException("La API no devolvió resultados válidos para el RUC proporcionado.");
                }

                String dirEmpresa = rucResponse.getDatos().getDomiciliado() != null
                        ? rucResponse.getDatos().getDomiciliado().getDireccion()
                        : "NO ESPECIFICADA";

                clienteBuilder
                        .nombreEmpresa(rucResponse.getDatos().getRazonSocial())
                        .direccionEmpresa(dirEmpresa);
                if (direccionFinal == null || direccionFinal.trim().isEmpty()) {
                    direccionFinal = dirEmpresa;
                }
            } else {
                throw new IllegalArgumentException("Tipo de documento no soportado para consultas automáticas.");
            }
        } catch (RestClientException e) {
            throw new RuntimeException("Error de conexión con RENIEC/SUNAT. Intente nuevamente más tarde.");
        }

        clienteBuilder.direccion(normalizarDireccion(direccionFinal));

        Cliente nuevoCliente = clienteBuilder.build();
        clienteRepository.save(nuevoCliente);

        return mapearAResponse(nuevoCliente);
    }

    @Transactional
    public ClienteResponseDTO reactivarCliente(String numeroDocumento) {
        Cliente cliente = clienteRepository.findByNumeroDocumento(numeroDocumento)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontró ningún cliente con el documento: " + numeroDocumento));

        if (cliente.getEstado() != ESTADO_BORRADO) {
            throw new IllegalStateException("El cliente no se encuentra en la eliminado, su estado actual es: "
                    + (cliente.getEstado() == 1 ? "Activo" : "Deshabilitado"));
        }
        cliente.setEstado(ESTADO_ACTIVO);
        clienteRepository.save(cliente);

        return mapearAResponse(cliente);
    }

    @Transactional
    public ClienteResponseDTO actualizarCliente(Long id, ClienteRequestDTO dto) {
        Cliente cliente = obtenerClienteValidado(id, true);

        // dto.getCorreo() != null && !dto.getCorreo().isEmpty() &&
        // clienteRepository.existsByCorreo(dto.getCorreo())
        cliente.setCorreo(validarYNormalizarCorreo(dto.getCorreo(), cliente.getCorreo()));
        cliente.setTelefono(validarYNormalizarTelefono(dto.getTelefono(), cliente.getTelefono()));
        if (cliente.getTipoDocumento().getId() == 1L) {
            String direccionLimpia = normalizarDireccion(dto.getDireccion());
            if (direccionLimpia != null) {
                cliente.setDireccion(direccionLimpia);
            }
        }

        clienteRepository.save(cliente);
        return mapearAResponse(cliente);
    }

    @Transactional
    public ClienteResponseDTO cambiarEstado(Long id) {
        Cliente cliente = obtenerClienteValidado(id, true);

        if (cliente.getId() == 1L) {
            throw new IllegalStateException("No puede deshabilitar el cliente 'Clientes Varios'.");
        }

        if (cliente.getEstado() == null) {
            throw new IllegalStateException("El estado actual es nulo y no puede ser procesado.");
        }

        switch (cliente.getEstado()) {
            case ESTADO_ACTIVO -> cliente.setEstado(ESTADO_DESHABILITADO);
            case ESTADO_DESHABILITADO -> cliente.setEstado(ESTADO_ACTIVO);
            case ESTADO_BORRADO -> cliente.setEstado(ESTADO_ACTIVO);
            default -> throw new IllegalStateException("El estado actual no permite ser alternado.");
        }

        clienteRepository.save(cliente);
        return mapearAResponse(cliente);
    }

    @Transactional
    public void borradoLogico(Long id) {
        Cliente cliente = obtenerClienteValidado(id, true);
        if (cliente.getId() == 1L) {
            throw new IllegalStateException("No puede deshabilitar el cliente 'Clientes Varios'.");
        }
        cliente.setEstado(ESTADO_BORRADO);
        clienteRepository.save(cliente);
    }

    // Métodos privados
    private Cliente obtenerClienteValidado(Long id, boolean bloquearBorrados) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ningún cliente con el ID: " + id));

        if (bloquearBorrados && cliente.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("Acción denegada: El cliente seleccionado se encuentra eliminado.");
        }
        return cliente;
    }

    private String normalizarNumeroDocumento(String numeroDocumento) {
        return numeroDocumento == null ? "" : numeroDocumento.trim();
    }

    private void validarLongitudDocumento(String numeroDocumento, TipoDocumento tipoDocumento) {
        if (esDni(tipoDocumento) && !numeroDocumento.matches("\\d{8}")) {
            throw new IllegalArgumentException("El DNI debe tener 8 dígitos.");
        }
        if (esRuc(tipoDocumento) && !numeroDocumento.matches("\\d{11}")) {
            throw new IllegalArgumentException("El RUC debe tener 11 dígitos.");
        }
    }

    private boolean esDni(TipoDocumento tipoDocumento) {
        return tipoDocumento.getId() == 1L || "DNI".equalsIgnoreCase(tipoDocumento.getNombre());
    }

    private boolean esRuc(TipoDocumento tipoDocumento) {
        return tipoDocumento.getId() == 2L || "RUC".equalsIgnoreCase(tipoDocumento.getNombre());
    }

    private String validarYNormalizarCorreo(String correoIngresado, String correoActual) {
        if (correoIngresado == null || correoIngresado.trim().isEmpty()) {
            return correoActual;
        }
        String correoNormalizado = correoIngresado.trim().toLowerCase();

        if (!correoNormalizado.equals(correoActual)) {
            if (clienteRepository.existsByCorreo(correoNormalizado)) {
                throw new IllegalArgumentException(
                        "El correo '" + correoNormalizado + "' ya está registrado en otro cliente.");
            }
        }
        return correoNormalizado;
    }

    private String validarYNormalizarTelefono(String telefonoIngresado, String telefonoActual) {
        if (telefonoIngresado == null || telefonoIngresado.trim().isEmpty()) {
            return telefonoActual;
        }
        String telNormalizado = telefonoIngresado.trim();

        if (!telNormalizado.equals(telefonoActual)) {
            if (clienteRepository.existsByTelefono(telNormalizado)) {
                throw new IllegalArgumentException(
                        "El teléfono '" + telNormalizado + "' ya está registrado en otro cliente.");
            }
        }
        return telNormalizado;
    }

    private String normalizarDireccion(String direccion) {
        if (direccion == null || direccion.trim().isEmpty()) {
            return null;
        }
        return direccion.trim().replaceAll("\\s+", " ").toUpperCase();
    }

    private ClienteResponseDTO mapearAResponse(Cliente c) {
        String fullName = "";
        String apeCompletos = "";

        if (c.getTipoDocumento().getId() == 1L) {
            apeCompletos = (c.getApellidoPaterno() != null ? c.getApellidoPaterno() : "") + " " +
                    (c.getApellidoMaterno() != null ? c.getApellidoMaterno() : "");
            fullName = c.getNombre() + " " + apeCompletos;
        } else if (c.getTipoDocumento().getId() == 2L) {
            fullName = c.getNombreEmpresa();
        }

        return ClienteResponseDTO.builder()
                .id(c.getId())
                .numeroDocumento(c.getNumeroDocumento())
                .idTipoDocumento(c.getTipoDocumento().getId())
                .tipoDocumentoNombre(c.getTipoDocumento().getNombre())
                .nombreCompleto(fullName.trim())
                .nombres(c.getNombre())
                .apellidos(apeCompletos.trim())
                .nombreEmpresa(c.getNombreEmpresa())
                .correo(c.getCorreo())
                .telefono(c.getTelefono())
                .direccion(c.getDireccion())
                .direccionEmpresa(c.getDireccionEmpresa())
                .estado(c.getEstado())
                .build();
    }
}