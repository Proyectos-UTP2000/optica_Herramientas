package com.herramientas.optica.modules.reportes.dto;

import java.util.List;

import com.herramientas.optica.modules.caja.dto.CajaResponseDTO;
import com.herramientas.optica.modules.caja.dto.GastoResponseDTO;
import com.herramientas.optica.modules.caja.dto.MovimientoCajaResponseDTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteCajaDetalleResponseDTO {

    private CajaResponseDTO caja;
    private List<MovimientoCajaResponseDTO> movimientos;
    private List<GastoResponseDTO> gastos;
    private List<ReporteVentaItemDTO> ventas;
}
