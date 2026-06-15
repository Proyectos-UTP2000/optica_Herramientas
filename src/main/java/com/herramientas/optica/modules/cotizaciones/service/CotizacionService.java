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

    public CotizacionService(CotizacionRepository cotizacionRepository,
                             CotizacionDetalleRepository cotizacionDetalleRepository,
                             ProductoRepository productoRepository,
                             com.herramientas.optica.modules.clientes.repository.ClienteRepository clienteRepository) {
        this.cotizacionRepository = cotizacionRepository;
        this.cotizacionDetalleRepository = cotizacionDetalleRepository;
        this.productoRepository = productoRepository;
        this.clienteRepository = clienteRepository;
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
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            if (username != null && username.contains("@")) {
                clienteUsuario = clienteRepository.findByCorreo(username).orElse(null);
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
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detDto.getProductoId()));

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
