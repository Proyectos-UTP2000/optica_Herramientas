package com.herramientas.optica.security.service;

import com.herramientas.optica.security.dto.DashboardAnalyticsDTO;
import com.herramientas.optica.modules.ventas.repository.VentaRepository;
import com.herramientas.optica.modules.productos.repository.ProductoRepository;
import com.herramientas.optica.modules.caja.repository.MovimientoCajaRepository;
import com.herramientas.optica.modules.ventas.model.Venta;
import com.herramientas.optica.modules.caja.model.MovimientoCaja;
import com.herramientas.optica.modules.caja.model.TipoMovimientoCaja;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final MovimientoCajaRepository movimientoCajaRepository;

    public DashboardService(VentaRepository ventaRepository,
                            ProductoRepository productoRepository,
                            MovimientoCajaRepository movimientoCajaRepository) {
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.movimientoCajaRepository = movimientoCajaRepository;
    }

    @Transactional(readOnly = true)
    public DashboardAnalyticsDTO obtenerAnaliticas() {
        return DashboardAnalyticsDTO.builder()
                .ventasMensuales(calcularVentasMensuales())
                .productosMasVendidos(calcularProductosMasVendidos())
                .rentabilidadMarca(calcularRentabilidadMarca())
                .rentabilidadCategoria(calcularRentabilidadCategoria())
                .valorizacionInventario(calcularValorizacionInventario())
                .flujoCajaDiario(calcularFlujoCajaDiario())
                .build();
    }

    private List<DashboardAnalyticsDTO.VentaMensualDTO> calcularVentasMensuales() {
        LocalDateTime desde = LocalDateTime.now().minusMonths(5).withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime hasta = LocalDateTime.now();

        List<Venta> ventas = ventaRepository.findByFechaBetweenAndEstadoOrderByFechaAsc(desde, hasta, 1);
        
        // Formato para agrupar: YYYY-MM
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, BigDecimal> agrupado = ventas.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getFecha().format(formatter),
                        Collectors.reducing(BigDecimal.ZERO, Venta::getTotal, BigDecimal::add)
                ));

        List<DashboardAnalyticsDTO.VentaMensualDTO> result = new ArrayList<>();
        LocalDate iterador = desde.toLocalDate();
        LocalDate fin = hasta.toLocalDate();
        while (!iterador.isAfter(fin)) {
            String key = iterador.format(formatter);
            result.add(DashboardAnalyticsDTO.VentaMensualDTO.builder()
                    .mes(key)
                    .total(agrupado.getOrDefault(key, BigDecimal.ZERO))
                    .build());
            iterador = iterador.plusMonths(1);
        }
        return result;
    }

    private List<DashboardAnalyticsDTO.ProductoMasVendidoDTO> calcularProductosMasVendidos() {
        List<Object[]> raw = ventaRepository.findTopSellingProducts(PageRequest.of(0, 5));
        return raw.stream()
                .map(obj -> DashboardAnalyticsDTO.ProductoMasVendidoDTO.builder()
                        .productoNombre((String) obj[0])
                        .cantidad(((Number) obj[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<DashboardAnalyticsDTO.RentabilidadMarcaDTO> calcularRentabilidadMarca() {
        List<Object[]> raw = ventaRepository.findRentabilidadPorMarca();
        return raw.stream()
                .map(obj -> {
                    String marca = obj[0] != null ? (String) obj[0] : "SIN MARCA";
                    BigDecimal ingresos = obj[1] != null ? (BigDecimal) obj[1] : BigDecimal.ZERO;
                    BigDecimal costos = obj[2] != null ? (BigDecimal) obj[2] : BigDecimal.ZERO;
                    return DashboardAnalyticsDTO.RentabilidadMarcaDTO.builder()
                            .marca(marca)
                            .ingresos(ingresos)
                            .costos(costos)
                            .rentabilidad(ingresos.subtract(costos))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<DashboardAnalyticsDTO.RentabilidadCategoriaDTO> calcularRentabilidadCategoria() {
        List<Object[]> raw = ventaRepository.findRentabilidadPorCategoria();
        return raw.stream()
                .map(obj -> {
                    String categoria = obj[0] != null ? (String) obj[0] : "SIN CATEGORIA";
                    BigDecimal ingresos = obj[1] != null ? (BigDecimal) obj[1] : BigDecimal.ZERO;
                    BigDecimal costos = obj[2] != null ? (BigDecimal) obj[2] : BigDecimal.ZERO;
                    return DashboardAnalyticsDTO.RentabilidadCategoriaDTO.builder()
                            .categoria(categoria)
                            .ingresos(ingresos)
                            .costos(costos)
                            .rentabilidad(ingresos.subtract(costos))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private DashboardAnalyticsDTO.ValorizacionInventarioDTO calcularValorizacionInventario() {
        List<Object[]> raw = productoRepository.getValoresInventario();
        BigDecimal costo = BigDecimal.ZERO;
        BigDecimal venta = BigDecimal.ZERO;
        if (raw != null && !raw.isEmpty() && raw.get(0) != null) {
            costo = raw.get(0)[0] != null ? (BigDecimal) raw.get(0)[0] : BigDecimal.ZERO;
            venta = raw.get(0)[1] != null ? (BigDecimal) raw.get(0)[1] : BigDecimal.ZERO;
        }
        return DashboardAnalyticsDTO.ValorizacionInventarioDTO.builder()
                .valorCosto(costo)
                .valorVenta(venta)
                .build();
    }

    private List<DashboardAnalyticsDTO.FlujoCajaDiarioDTO> calcularFlujoCajaDiario() {
        LocalDateTime desde = LocalDateTime.now().minusDays(14).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<MovimientoCaja> movimientos = movimientoCajaRepository.findByAnuladoFalseAndFechaAfterOrderByFechaAsc(desde);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        // Agrupamos por fecha
        Map<String, List<MovimientoCaja>> agrupado = movimientos.stream()
                .collect(Collectors.groupingBy(m -> m.getFecha().format(formatter)));

        List<DashboardAnalyticsDTO.FlujoCajaDiarioDTO> result = new ArrayList<>();
        LocalDate iterador = desde.toLocalDate();
        LocalDate fin = LocalDate.now();

        while (!iterador.isAfter(fin)) {
            String key = iterador.format(formatter);
            List<MovimientoCaja> movsDia = agrupado.getOrDefault(key, Collections.emptyList());

            BigDecimal ingresos = BigDecimal.ZERO;
            BigDecimal egresos = BigDecimal.ZERO;

            for (MovimientoCaja m : movsDia) {
                if (m.getTipo() == TipoMovimientoCaja.INGRESO) {
                    ingresos = ingresos.add(m.getMonto());
                } else if (m.getTipo() == TipoMovimientoCaja.EGRESO) {
                    egresos = egresos.add(m.getMonto());
                }
            }

            result.add(DashboardAnalyticsDTO.FlujoCajaDiarioDTO.builder()
                    .fecha(key)
                    .ingresos(ingresos)
                    .egresos(egresos)
                    .neto(ingresos.subtract(egresos))
                    .build());

            iterador = iterador.plusDays(1);
        }

        return result;
    }
}
