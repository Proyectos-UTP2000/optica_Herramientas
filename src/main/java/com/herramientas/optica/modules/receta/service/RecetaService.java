package com.herramientas.optica.modules.receta.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.herramientas.optica.modules.receta.model.RecetaClinica;
import com.herramientas.optica.modules.receta.repository.RecetaClinicaRepository;
import com.herramientas.optica.modules.receta.dto.RecetaRequestDTO;
import com.herramientas.optica.modules.receta.dto.RecetaResponseDTO;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.empleados.model.Empleado;

@Service
public class RecetaService {
    private final RecetaClinicaRepository recetaClinicaRepository;
    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;

    public RecetaService(RecetaClinicaRepository recetaClinicaRepository,
                         ClienteRepository clienteRepository,
                         EmpleadoRepository empleadoRepository) {
        this.recetaClinicaRepository = recetaClinicaRepository;
        this.clienteRepository = clienteRepository;
        this.empleadoRepository = empleadoRepository;
    }

    @Transactional(readOnly = true)
    public List<RecetaResponseDTO> listarPorCliente(Long clienteId) {
        return recetaClinicaRepository.findByClienteIdOrderByFechaEvaluacionDesc(clienteId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecetaResponseDTO buscarPorId(Long id) {
        RecetaClinica receta = recetaClinicaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receta no encontrada con ID: " + id));
        return mapToDTO(receta);
    }

    @Transactional
    public RecetaResponseDTO registrar(RecetaRequestDTO dto) {
        var cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + dto.getClienteId()));
        var empleado = empleadoRepository.findById(dto.getEmpleadoId())
                .orElseThrow(() -> new IllegalArgumentException("Empleado no encontrado con ID: " + dto.getEmpleadoId()));

        RecetaClinica receta = RecetaClinica.builder()
                .cliente(cliente)
                .empleado(empleado)
                .fechaEvaluacion(LocalDateTime.now())
                .odEsfera(dto.getOdEsfera())
                .odCilindro(dto.getOdCilindro())
                .odEje(dto.getOdEje())
                .odAvLejos(dto.getOdAvLejos())
                .odAvCerca(dto.getOdAvCerca())
                .oiEsfera(dto.getOiEsfera())
                .oiCilindro(dto.getOiCilindro())
                .oiEje(dto.getOiEje())
                .oiAvLejos(dto.getOiAvLejos())
                .oiAvCerca(dto.getOiAvCerca())
                .distanciaPupilar(dto.getDistanciaPupilar())
                .adicion(dto.getAdicion())
                .tipoLuna(dto.getTipoLuna())
                .materialSugerido(dto.getMaterialSugerido())
                .tratamientos(dto.getTratamientos())
                .observaciones(dto.getObservaciones())
                .build();

        return mapToDTO(recetaClinicaRepository.save(receta));
    }

    private RecetaResponseDTO mapToDTO(RecetaClinica receta) {
        return RecetaResponseDTO.builder()
                .id(receta.getId())
                .clienteId(receta.getCliente().getId())
                .clienteNombre(formatNombreCliente(receta.getCliente()))
                .empleadoId(receta.getEmpleado().getId())
                .empleadoNombre(formatNombreEmpleado(receta.getEmpleado()))
                .fechaEvaluacion(receta.getFechaEvaluacion())
                .odEsfera(receta.getOdEsfera())
                .odCilindro(receta.getOdCilindro())
                .odEje(receta.getOdEje())
                .odAvLejos(receta.getOdAvLejos())
                .odAvCerca(receta.getOdAvCerca())
                .oiEsfera(receta.getOiEsfera())
                .oiCilindro(receta.getOiCilindro())
                .oiEje(receta.getOiEje())
                .oiAvLejos(receta.getOiAvLejos())
                .oiAvCerca(receta.getOiAvCerca())
                .distanciaPupilar(receta.getDistanciaPupilar())
                .adicion(receta.getAdicion())
                .tipoLuna(receta.getTipoLuna())
                .materialSugerido(receta.getMaterialSugerido())
                .tratamientos(receta.getTratamientos())
                .observaciones(receta.getObservaciones())
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
