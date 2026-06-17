package com.herramientas.optica.modules.receta.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecetaResponseDTO {
    private Long id;
    private Long clienteId;
    private String clienteNombre;
    private Long empleadoId;
    private String empleadoNombre;
    private LocalDateTime fechaEvaluacion;
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
