package com.herramientas.optica.modules.cotizaciones.service;

import com.herramientas.optica.modules.cotizaciones.dto.CotizacionDTO;
import com.herramientas.optica.modules.cotizaciones.dto.CotizacionDetalleDTO;
import com.herramientas.optica.modules.cotizaciones.model.Cotizacion;
import com.herramientas.optica.modules.cotizaciones.model.CotizacionDetalle;
import com.herramientas.optica.modules.cotizaciones.repository.CotizacionDetalleRepository;
import com.herramientas.optica.modules.cotizaciones.repository.CotizacionRepository;
import com.herramientas.optica.modules.productos.model.Producto;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CotizacionService {

    private final CotizacionRepository cotizacionRepository;
    private final CotizacionDetalleRepository cotizacionDetalleRepository;
    private final ProductoRepository productoRepository;
    private final com.herramientas.optica.modules.clientes.repository.ClienteRepository clienteRepository;
    private final com.herramientas.optica.modules.clientes.service.ClienteService clienteService;
    private final com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository tipoDocumentoRepository;

    public CotizacionService(CotizacionRepository cotizacionRepository,
                             CotizacionDetalleRepository cotizacionDetalleRepository,
                             ProductoRepository productoRepository,
                             com.herramientas.optica.modules.clientes.repository.ClienteRepository clienteRepository,
                             com.herramientas.optica.modules.clientes.service.ClienteService clienteService,
                             com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository tipoDocumentoRepository) {
        this.cotizacionRepository = cotizacionRepository;
        this.cotizacionDetalleRepository = cotizacionDetalleRepository;
        this.productoRepository = productoRepository;
        this.clienteRepository = clienteRepository;
        this.clienteService = clienteService;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
    }

    @Transactional(readOnly = true)
    public List<CotizacionDTO> listarTodas() {
        return cotizacionRepository.findAllByOrderByFechaCreacionDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CotizacionDTO obtenerPorId(Long id) {
        Cotizacion cotizacion = cotizacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cotización no encontrada"));
        return mapToDTO(cotizacion);
    }

    @Transactional
    public CotizacionDTO crearCotizacion(CotizacionDTO dto) {
        com.herramientas.optica.modules.clientes.model.Cliente clienteUsuario = null;

        if (dto.getClienteDocumento() != null && !dto.getClienteDocumento().trim().isEmpty()) {
            String doc = dto.getClienteDocumento().trim();
            var optCliente = clienteRepository.findByNumeroDocumento(doc);
            if (optCliente.isPresent()) {
                clienteUsuario = optCliente.get();
            } else {
                try {
                    com.herramientas.optica.modules.clientes.dto.ClienteRequestDTO req = new com.herramientas.optica.modules.clientes.dto.ClienteRequestDTO();
                    req.setNumeroDocumento(doc);
                    req.setIdTipoDocumento(doc.length() == 11 ? 2L : 1L);
                    req.setCorreo(dto.getClienteCorreo());
                    req.setTelefono(dto.getClienteTelefono());
                    req.setDireccion(dto.getDireccion() != null && !dto.getDireccion().trim().isEmpty() ? dto.getDireccion() : "NO ESPECIFICADA");

                    var resp = clienteService.crearCliente(req);
                    clienteUsuario = clienteRepository.findById(resp.getId()).orElse(null);
                } catch (Exception e) {
                    try {
                        com.herramientas.optica.modules.clientes.model.TipoDocumento tipoDoc = tipoDocumentoRepository.findById(doc.length() == 11 ? 2L : 1L)
                                .orElseThrow(() -> new IllegalArgumentException("Tipo de documento no encontrado"));

                        com.herramientas.optica.modules.clientes.model.Cliente.ClienteBuilder builder = com.herramientas.optica.modules.clientes.model.Cliente.builder()
                                .numeroDocumento(doc)
                                .correo(dto.getClienteCorreo())
                                .telefono(dto.getClienteTelefono())
                                .direccion(dto.getDireccion() != null && !dto.getDireccion().trim().isEmpty() ? dto.getDireccion().toUpperCase() : "NO ESPECIFICADA")
                                .tipoDocumento(tipoDoc)
                                .estado(1);

                        if (tipoDoc.getId() == 2L) {
                            builder.nombreEmpresa(dto.getClienteNombre() != null ? dto.getClienteNombre().toUpperCase() : "EMPRESA NUEVA");
                            builder.direccionEmpresa(dto.getDireccion() != null && !dto.getDireccion().trim().isEmpty() ? dto.getDireccion().toUpperCase() : "NO ESPECIFICADA");
                        } else {
                            String fullName = dto.getClienteNombre();
                            if (fullName != null && !fullName.trim().isEmpty()) {
                                String[] parts = fullName.trim().split("\\s+");
                                if (parts.length >= 3) {
                                    builder.nombre(parts[0].toUpperCase());
                                    builder.apellidoPaterno(parts[1].toUpperCase());
                                    StringBuilder mat = new StringBuilder();
                                    for (int i = 2; i < parts.length; i++) {
                                        if (i > 2) mat.append(" ");
                                        mat.append(parts[i]);
                                    }
                                    builder.apellidoMaterno(mat.toString().toUpperCase());
                                } else if (parts.length == 2) {
                                    builder.nombre(parts[0].toUpperCase());
                                    builder.apellidoPaterno(parts[1].toUpperCase());
                                    builder.apellidoMaterno("");
                                } else {
                                    builder.nombre(fullName.toUpperCase());
                                    builder.apellidoPaterno("");
                                    builder.apellidoMaterno("");
                                }
                            } else {
                                builder.nombre("CLIENTE");
                                builder.apellidoPaterno("NUEVO");
                                builder.apellidoMaterno("");
                            }
                        }
                        clienteUsuario = clienteRepository.save(builder.build());
                    } catch (Exception ex) {
                        System.err.println("Error en fallback manual de cliente: " + ex.getMessage());
                    }
                }
            }
        } else {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                if (username != null && username.contains("@")) {
                    clienteUsuario = clienteRepository.findByCorreo(username).orElse(null);
                }
            }
        }

        Cotizacion cotizacion = Cotizacion.builder()
                .clienteNombre(dto.getClienteNombre())
                .clienteDocumento(dto.getClienteDocumento())
                .clienteTelefono(dto.getClienteTelefono())
                .clienteCorreo(dto.getClienteCorreo())
                .observaciones(dto.getObservaciones())
                .totalEstimado(BigDecimal.ZERO)
                .estado("PENDIENTE")
                .clienteUsuario(clienteUsuario)
                .direccion(dto.getDireccion())
                .build();

        // Guardamos primero la cotización para generar el ID
        cotizacion = cotizacionRepository.save(cotizacion);

        BigDecimal total = BigDecimal.ZERO;
        List<CotizacionDetalle> detalles = new ArrayList<>();

        for (CotizacionDetalleDTO detDto : dto.getDetalles()) {
            Producto producto = productoRepository.findById(detDto.getProductoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + detDto.getProductoId()));

            if (producto.getEstado() != 1 ||
                !Boolean.TRUE.equals(producto.getVisibleWeb()) ||
                producto.getStock() == null ||
                producto.getStock() <= 0) {
                throw new IllegalArgumentException("El producto '" + producto.getNombre() + "' no está disponible o no tiene stock.");
            }

            BigDecimal precio = producto.getPrecio() != null ? producto.getPrecio() : BigDecimal.ZERO;
            BigDecimal subtotal = precio.multiply(BigDecimal.valueOf(detDto.getCantidad()));

            CotizacionDetalle detalle = CotizacionDetalle.builder()
                    .cotizacion(cotizacion)
                    .producto(producto)
                    .cantidad(detDto.getCantidad())
                    .precioLista(precio)
                    .subtotal(subtotal)
                    .build();

            detalles.add(detalle);
            total = total.add(subtotal);
        }

        // Guardamos los detalles
        cotizacionDetalleRepository.saveAll(detalles);

        // Actualizamos la cotización con la lista de detalles y el total estimado definitivo
        cotizacion.setDetalles(detalles);
        cotizacion.setTotalEstimado(total);
        Cotizacion saved = cotizacionRepository.save(cotizacion);

        return mapToDTO(saved);
    }

    @Transactional
    public CotizacionDTO actualizarEstado(Long id, String nuevoEstado) {
        Cotizacion cotizacion = cotizacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cotización no encontrada"));

        cotizacion.setEstado(nuevoEstado);
        Cotizacion saved = cotizacionRepository.save(cotizacion);
        return mapToDTO(saved);
    }

    private CotizacionDTO mapToDTO(Cotizacion c) {
        List<CotizacionDetalleDTO> dets = c.getDetalles().stream()
                .map(d -> CotizacionDetalleDTO.builder()
                        .id(d.getId())
                        .productoId(d.getProducto().getId())
                        .productoNombre(d.getProducto().getNombre())
                        .productoCodigo(d.getProducto().getCodigo())
                        .cantidad(d.getCantidad())
                        .precioLista(d.getPrecioLista())
                        .subtotal(d.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return CotizacionDTO.builder()
                .id(c.getId())
                .clienteNombre(c.getClienteNombre())
                .clienteDocumento(c.getClienteDocumento())
                .clienteTelefono(c.getClienteTelefono())
                .clienteCorreo(c.getClienteCorreo())
                .totalEstimado(c.getTotalEstimado())
                .estado(c.getEstado())
                .fechaCreacion(c.getFechaCreacion())
                .observaciones(c.getObservaciones())
                .detalles(dets)
                .clienteUsuarioId(c.getClienteUsuario() != null ? c.getClienteUsuario().getId() : null)
                .direccion(c.getDireccion())
                .build();
    }
}
