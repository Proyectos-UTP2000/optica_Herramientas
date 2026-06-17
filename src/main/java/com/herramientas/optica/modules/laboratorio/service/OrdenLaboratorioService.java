package com.herramientas.optica.modules.laboratorio.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.herramientas.optica.modules.laboratorio.model.OrdenLaboratorio;
import com.herramientas.optica.modules.laboratorio.model.EstadoOrden;
import com.herramientas.optica.modules.laboratorio.repository.OrdenLaboratorioRepository;
import com.herramientas.optica.modules.laboratorio.dto.ActualizarEstadoOrdenDTO;
import com.herramientas.optica.modules.laboratorio.dto.OrdenLaboratorioResponseDTO;
import com.herramientas.optica.modules.ventas.model.Venta;
import com.herramientas.optica.modules.receta.model.RecetaClinica;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.empleados.model.Empleado;

@Service
public class OrdenLaboratorioService {
    private final OrdenLaboratorioRepository repository;

    public OrdenLaboratorioService(OrdenLaboratorioRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<OrdenLaboratorioResponseDTO> listarTodas(EstadoOrden estado) {
        List<OrdenLaboratorio> ordenes = estado != null ?
                repository.findByEstadoOrdenOrderByCreatedAtDesc(estado) : repository.findAll();
        return ordenes.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrdenLaboratorioResponseDTO> listarPorCliente(Long clienteId) {
        return repository.findByVentaClienteIdOrderByCreatedAtDesc(clienteId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrdenLaboratorioResponseDTO buscarPorId(Long id) {
        OrdenLaboratorio orden = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada con ID: " + id));
        return mapToDTO(orden);
    }

    @Transactional
    public OrdenLaboratorio crearOrden(Venta venta, RecetaClinica receta, String notas) {
        OrdenLaboratorio orden = OrdenLaboratorio.builder()
                .venta(venta)
                .recetaClinica(receta)
                .estadoOrden(EstadoOrden.PENDIENTE)
                .notas(notas)
                .build();
        return repository.save(orden);
    }

    @Transactional
    public OrdenLaboratorioResponseDTO actualizarEstado(Long id, ActualizarEstadoOrdenDTO dto) {
        OrdenLaboratorio orden = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada con ID: " + id));

        validarTransicionEstado(orden.getEstadoOrden(), dto.getEstadoOrden());

        orden.setEstadoOrden(dto.getEstadoOrden());
        if (dto.getLaboratorioNombre() != null) {
            orden.setLaboratorioNombre(dto.getLaboratorioNombre());
        }
        if (dto.getFechaPromesaEntrega() != null) {
            orden.setFechaPromesaEntrega(dto.getFechaPromesaEntrega());
        }

        return mapToDTO(repository.save(orden));
    }

    private void validarTransicionEstado(EstadoOrden actual, EstadoOrden nuevo) {
        if (actual == EstadoOrden.ANULADO) {
            throw new IllegalArgumentException("No se puede modificar una orden anulada");
        }
        if (nuevo == EstadoOrden.ENTREGADO_CLIENTE && actual != EstadoOrden.RECIBIDO_TIENDA) {
            throw new IllegalArgumentException("Los lentes deben estar recibidos en tienda antes de entregarse al cliente.");
        }
    }

    private OrdenLaboratorioResponseDTO mapToDTO(OrdenLaboratorio orden) {
        return OrdenLaboratorioResponseDTO.builder()
                .id(orden.getId())
                .ventaId(orden.getVenta().getId())
                .clienteNombre(formatNombreCliente(orden.getVenta().getCliente()))
                .recetaId(orden.getRecetaClinica().getId())
                .optometristaNombre(formatNombreEmpleado(orden.getRecetaClinica().getEmpleado()))
                .estadoOrden(orden.getEstadoOrden())
                .fechaPromesaEntrega(orden.getFechaPromesaEntrega())
                .laboratorioNombre(orden.getLaboratorioNombre())
                .notas(orden.getNotas())
                .createdAt(orden.getCreatedAt())
                .build();
    }

    private String formatNombreCliente(Cliente cliente) {
        if (cliente.getNombreEmpresa() != null && !cliente.getNombreEmpresa().isBlank()) {
            return cliente.getNombreEmpresa().trim();
        }
        return String.join(" ",
                cliente.getNombre() != null ? cliente.getNombre() : "",
                cliente.getApellidoPaterno() != null ? cliente.getApellidoPaterno() : "",
                cliente.getApellidoMaterno() != null ? cliente.getApellidoMaterno() : "").trim();
    }

    private String formatNombreEmpleado(Empleado empleado) {
        return String.join(" ",
                empleado.getNombre() != null ? empleado.getNombre() : "",
                empleado.getApellidoPaterno() != null ? empleado.getApellidoPaterno() : "",
                empleado.getApellidoMaterno() != null ? empleado.getApellidoMaterno() : "").trim();
    }
}
