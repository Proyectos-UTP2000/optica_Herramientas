package com.herramientas.optica.modules.laboratorio.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;
import com.herramientas.optica.modules.laboratorio.model.EstadoOrden;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenLaboratorioResponseDTO {
    private Long id;
    private Long ventaId;
    private String clienteNombre;
    private Long recetaId;
    private String optometristaNombre;
    private EstadoOrden estadoOrden;
    private LocalDate fechaPromesaEntrega;
    private String laboratorioNombre;
    private String notas;
    private LocalDateTime createdAt;
}
