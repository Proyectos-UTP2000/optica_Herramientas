package com.herramientas.optica.modules.receta.dto;

import java.math.BigDecimal;
import java.util.Set;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecetaRequestDTO {
    @NotNull(message = "El cliente es obligatorio")
    private Long clienteId;

    @NotNull(message = "El optometrista/empleado es obligatorio")
    private Long empleadoId;

    private BigDecimal odEsfera;
    private BigDecimal odCilindro;
    private Integer odEje;
    private String odAvLejos;
    private String odAvCerca;

    private BigDecimal oiEsfera;
    private BigDecimal oiCilindro;
    private Integer oiEje;
    private String oiAvLejos;
    private String oiAvCerca;

    private BigDecimal distanciaPupilar;
    private BigDecimal adicion;
    private String tipoLuna;
    private String materialSugerido;
    private Set<String> tratamientos;
    private String observaciones;
}
