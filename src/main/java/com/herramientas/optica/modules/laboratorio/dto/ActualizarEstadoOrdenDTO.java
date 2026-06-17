package com.herramientas.optica.modules.laboratorio.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import com.herramientas.optica.modules.laboratorio.model.EstadoOrden;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarEstadoOrdenDTO {
    @NotNull(message = "El estado es obligatorio")
    private EstadoOrden estadoOrden;
    private String laboratorioNombre;
    private LocalDate fechaPromesaEntrega;
}
