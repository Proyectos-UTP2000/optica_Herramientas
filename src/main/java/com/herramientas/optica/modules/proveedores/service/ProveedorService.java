package com.herramientas.optica.modules.proveedores.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;

import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.RucResponse;
import com.herramientas.optica.modules.api.service.DNI_RUC_Service;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.proveedores.dto.ProveedorRequestDTO;
import com.herramientas.optica.modules.proveedores.dto.ProveedorResponseDTO;
import com.herramientas.optica.modules.proveedores.model.Proveedor;
import com.herramientas.optica.modules.proveedores.repository.ProveedorRepository;

@Service
public class ProveedorService {

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_DESHABILITADO = 2;
    private static final int ESTADO_BORRADO = 0;
    private static final Long TIPO_DOCUMENTO_RUC = 2L;

    private final ProveedorRepository proveedorRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final DNI_RUC_Service dniRucService;

    /**
     * Crea el servicio con repositorios y cliente externo usados por proveedores.
     */
    public ProveedorService(ProveedorRepository proveedorRepository, TipoDocumentoRepository tipoDocumentoRepository,
            DNI_RUC_Service dniRucService) {
        this.proveedorRepository = proveedorRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
        this.dniRucService = dniRucService;
    }

    /**
     * Lista proveedores activos y deshabilitados, excluyendo los eliminados logicamente.
     */
    @Transactional(readOnly = true)
    public List<ProveedorResponseDTO> listarActivosEInactivos() {
        return proveedorRepository.findByEstadoNot(ESTADO_BORRADO).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    /**
     * Busca un proveedor por ID y bloquea el acceso a registros eliminados.
     */
    @Transactional(readOnly = true)
    public ProveedorResponseDTO buscarPorId(Long id) {
        return mapearAResponse(obtenerProveedorValidado(id, true));
    }

    /**
     * Crea un proveedor validando unicidad de documento y normalizando sus campos.
     */
    @Transactional
    public ProveedorResponseDTO crearProveedor(ProveedorRequestDTO dto) {
        String numeroDocumento = normalizarDocumento(dto.getNumeroDocumento());
        Optional<Proveedor> proveedorExistente = proveedorRepository.findByNumeroDocumento(numeroDocumento);
        if (proveedorExistente.isPresent()) {
            if (proveedorExistente.get().getEstado() == ESTADO_BORRADO) {
                throw new IllegalStateException("El proveedor con documento " + numeroDocumento
                        + " está eliminado. ¿Desea reactivarlo?");
            }
            throw new IllegalArgumentException(
                    "El proveedor con documento " + numeroDocumento + " ya se encuentra registrado.");
        }

        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(dto.getIdTipoDocumento())
                .orElseThrow(() -> new IllegalArgumentException("El tipo de documento seleccionado no existe."));

        DatosProveedorNormalizados datos = normalizarDatos(dto, numeroDocumento, tipoDocumento);

        Proveedor proveedor = Proveedor.builder()
                .tipoDocumento(tipoDocumento)
                .numeroDocumento(numeroDocumento)
                .razonSocial(datos.razonSocial())
                .nombreComercial(datos.nombreComercial())
                .direccion(datos.direccion())
                .telefono(datos.telefono())
                .correo(datos.correo())
                .estado(ESTADO_ACTIVO)
                .build();

        return mapearAResponse(proveedorRepository.save(proveedor));
    }

    /**
     * Actualiza los datos editables de un proveedor no eliminado.
     */
    @Transactional
    public ProveedorResponseDTO actualizarProveedor(Long id, ProveedorRequestDTO dto) {
        Proveedor proveedor = obtenerProveedorValidado(id, true);
        String numeroDocumento = normalizarDocumento(dto.getNumeroDocumento());

        proveedorRepository.findByNumeroDocumento(numeroDocumento)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "El proveedor con documento " + numeroDocumento + " ya se encuentra registrado.");
                });

        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(dto.getIdTipoDocumento())
                .orElseThrow(() -> new IllegalArgumentException("El tipo de documento seleccionado no existe."));

        DatosProveedorNormalizados datos = normalizarDatos(dto, numeroDocumento, tipoDocumento);
        proveedor.setTipoDocumento(tipoDocumento);
        proveedor.setNumeroDocumento(numeroDocumento);
        proveedor.setRazonSocial(datos.razonSocial());
        proveedor.setNombreComercial(datos.nombreComercial());
        proveedor.setDireccion(datos.direccion());
        proveedor.setTelefono(datos.telefono());
        proveedor.setCorreo(datos.correo());

        return mapearAResponse(proveedorRepository.save(proveedor));
    }

    /**
     * Reactiva un proveedor eliminado logicamente por numero de documento.
     */
    @Transactional
    public ProveedorResponseDTO reactivarProveedor(String numeroDocumento) {
        String documentoNormalizado = normalizarDocumento(numeroDocumento);
        Proveedor proveedor = proveedorRepository.findByNumeroDocumento(documentoNormalizado)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontró ningún proveedor con el documento: " + documentoNormalizado));

        if (proveedor.getEstado() != ESTADO_BORRADO) {
            throw new IllegalStateException("El proveedor no se encuentra eliminado, su estado actual es: "
                    + (proveedor.getEstado() == ESTADO_ACTIVO ? "Activo" : "Deshabilitado"));
        }

        proveedor.setEstado(ESTADO_ACTIVO);
        return mapearAResponse(proveedorRepository.save(proveedor));
    }

    /**
     * Alterna el estado entre activo y deshabilitado sin borrar el registro.
     */
    @Transactional
    public ProveedorResponseDTO cambiarEstado(Long id) {
        Proveedor proveedor = obtenerProveedorValidado(id, true);

        if (proveedor.getEstado() == null) {
            throw new IllegalStateException("El estado actual es nulo y no puede ser procesado.");
        }

        switch (proveedor.getEstado()) {
            case ESTADO_ACTIVO -> proveedor.setEstado(ESTADO_DESHABILITADO);
            case ESTADO_DESHABILITADO -> proveedor.setEstado(ESTADO_ACTIVO);
            default -> throw new IllegalStateException("El estado actual no permite ser alternado.");
        }

        return mapearAResponse(proveedorRepository.save(proveedor));
    }

    /**
     * Marca un proveedor como eliminado sin removerlo fisicamente de la base de datos.
     */
    @Transactional
    public void borradoLogico(Long id) {
        Proveedor proveedor = obtenerProveedorValidado(id, true);
        proveedor.setEstado(ESTADO_BORRADO);
        proveedorRepository.save(proveedor);
    }

    private Proveedor obtenerProveedorValidado(Long id, boolean bloquearBorrados) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ningún proveedor con el ID: " + id));

        if (bloquearBorrados && proveedor.getEstado() == ESTADO_BORRADO) {
            throw new IllegalStateException("Acción denegada: El proveedor seleccionado se encuentra eliminado.");
        }
        return proveedor;
    }

    private DatosProveedorNormalizados normalizarDatos(ProveedorRequestDTO dto, String numeroDocumento,
            TipoDocumento tipoDocumento) {
        String razonSocial = normalizarTexto(dto.getRazonSocial());
        String direccion = normalizarTexto(dto.getDireccion());

        if (esRuc(tipoDocumento)
                && (razonSocial == null || direccion == null)) {
            DatosProveedorNormalizados datosSunat = consultarRuc(numeroDocumento);
            if (razonSocial == null) {
                razonSocial = datosSunat.razonSocial();
            }
            if (direccion == null) {
                direccion = datosSunat.direccion();
            }
        }

        if (razonSocial == null) {
            throw new IllegalArgumentException("La razón social o nombre del proveedor es obligatorio.");
        }

        return new DatosProveedorNormalizados(
                razonSocial,
                normalizarTexto(dto.getNombreComercial(), razonSocial),
                normalizarTexto(dto.getDireccion(), direccion != null ? direccion : "NO ESPECIFICADA"),
                normalizarTexto(dto.getTelefono()),
                normalizarCorreo(dto.getCorreo()));
    }

    private DatosProveedorNormalizados consultarRuc(String numeroDocumento) {
        try {
            RucResponse rucResponse = dniRucService.consultarRuc(numeroDocumento);
            if (rucResponse == null || !rucResponse.isSuccess() || rucResponse.getDatos() == null) {
                throw new IllegalStateException("La API no devolvió resultados válidos para el RUC proporcionado.");
            }

            String direccion = rucResponse.getDatos().getDomiciliado() != null
                    ? rucResponse.getDatos().getDomiciliado().getDireccion()
                    : null;
            return new DatosProveedorNormalizados(
                    normalizarTexto(rucResponse.getDatos().getRazonSocial()),
                    null,
                    normalizarTexto(direccion),
                    null,
                    null);
        } catch (RestClientException e) {
            throw new RuntimeException("Error de conexión con SUNAT. Intente nuevamente más tarde.");
        }
    }

    private boolean esRuc(TipoDocumento tipoDocumento) {
        return TIPO_DOCUMENTO_RUC.equals(tipoDocumento.getId())
                || "RUC".equalsIgnoreCase(tipoDocumento.getNombre());
    }

    private String normalizarDocumento(String documento) {
        if (documento == null || documento.trim().isEmpty()) {
            throw new IllegalArgumentException("El número de documento es obligatorio.");
        }
        return documento.trim();
    }

    private String normalizarTexto(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        return valor.trim().replaceAll("\\s+", " ").toUpperCase();
    }

    private String normalizarTexto(String valor, String valorPorDefecto) {
        String normalizado = normalizarTexto(valor);
        return normalizado != null ? normalizado : valorPorDefecto;
    }

    private String normalizarCorreo(String correo) {
        if (correo == null || correo.trim().isEmpty()) {
            return null;
        }
        return correo.trim().toLowerCase();
    }

    private ProveedorResponseDTO mapearAResponse(Proveedor proveedor) {
        return ProveedorResponseDTO.builder()
                .id(proveedor.getId())
                .idTipoDocumento(proveedor.getTipoDocumento().getId())
                .tipoDocumentoNombre(proveedor.getTipoDocumento().getNombre())
                .numeroDocumento(proveedor.getNumeroDocumento())
                .razonSocial(proveedor.getRazonSocial())
                .nombreComercial(proveedor.getNombreComercial())
                .direccion(proveedor.getDireccion())
                .telefono(proveedor.getTelefono())
                .correo(proveedor.getCorreo())
                .estado(proveedor.getEstado())
                .build();
    }

    private record DatosProveedorNormalizados(
            String razonSocial,
            String nombreComercial,
            String direccion,
            String telefono,
            String correo) {
    }
}
