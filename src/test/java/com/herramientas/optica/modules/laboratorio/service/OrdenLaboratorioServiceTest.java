package com.herramientas.optica.modules.laboratorio.service;

import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.laboratorio.model.EstadoOrden;
import com.herramientas.optica.modules.laboratorio.dto.ActualizarEstadoOrdenDTO;
import com.herramientas.optica.modules.laboratorio.dto.OrdenLaboratorioResponseDTO;
import com.herramientas.optica.modules.laboratorio.model.OrdenLaboratorio;
import com.herramientas.optica.modules.ventas.model.Venta;
import com.herramientas.optica.modules.ventas.repository.VentaRepository;
import com.herramientas.optica.modules.receta.model.RecetaClinica;
import com.herramientas.optica.modules.receta.repository.RecetaClinicaRepository;
import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OrdenLaboratorioServiceTest {
    @Autowired
    private OrdenLaboratorioService service;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private RecetaClinicaRepository recetaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Test
    void testCrearYActualizarEstadoOrden() {
        // Setup self-contained data:
        Empleado empleado = crearEmpleado("laboratorio_test1");
        Cliente cliente = crearCliente("99000010", "Cliente Lab 1");

        // Create and save a RecetaClinica:
        RecetaClinica receta = RecetaClinica.builder()
                .cliente(cliente)
                .empleado(empleado)
                .fechaEvaluacion(LocalDateTime.now())
                .odEsfera(new BigDecimal("-1.50"))
                .oiEsfera(new BigDecimal("-1.50"))
                .build();
        receta = recetaRepository.save(receta);

        // Create and save a Venta:
        Venta venta = Venta.builder()
                .cliente(cliente)
                .empleado(empleado)
                .total(new BigDecimal("100.00"))
                .subtotal(new BigDecimal("100.00"))
                .descuento(BigDecimal.ZERO)
                .estado(1) // Active / Emitted
                .build();
        venta = ventaRepository.save(venta);

        // WHEN: Creating an order
        OrdenLaboratorio orden = service.crearOrden(venta, receta, "Notas técnicas");

        // THEN: Verify order properties
        assertNotNull(orden.getId());
        assertEquals(EstadoOrden.PENDIENTE, orden.getEstadoOrden());
        assertEquals("Notas técnicas", orden.getNotas());

        // WHEN: Updating state
        ActualizarEstadoOrdenDTO updateDto = ActualizarEstadoOrdenDTO.builder()
                .estadoOrden(EstadoOrden.ENVIADO_LABORATORIO)
                .laboratorioNombre("Laboratorio Central")
                .fechaPromesaEntrega(LocalDate.now().plusDays(5))
                .build();
        OrdenLaboratorioResponseDTO response = service.actualizarEstado(orden.getId(), updateDto);

        // THEN: Verify updated state
        assertEquals(EstadoOrden.ENVIADO_LABORATORIO, response.getEstadoOrden());
        assertEquals("Laboratorio Central", response.getLaboratorioNombre());
        assertEquals(LocalDate.now().plusDays(5), response.getFechaPromesaEntrega());
    }

    @Test
    void testValidacionTransicionEstadoInvalida() {
        // Setup self-contained data:
        Cliente cliente = crearCliente("99000011", "Cliente Lab 2");
        Empleado empleado = crearEmpleado("laboratorio_test2");

        RecetaClinica receta = recetaRepository.save(RecetaClinica.builder()
                .cliente(cliente)
                .empleado(empleado)
                .fechaEvaluacion(LocalDateTime.now())
                .build());

        Venta venta = ventaRepository.save(Venta.builder()
                .cliente(cliente)
                .empleado(empleado)
                .total(new BigDecimal("100.00"))
                .subtotal(new BigDecimal("100.00"))
                .descuento(BigDecimal.ZERO)
                .estado(1)
                .build());

        OrdenLaboratorio orden = service.crearOrden(venta, receta, "Notas");

        // Try to transition directly to ENTREGADO_CLIENTE from PENDIENTE (invalid since it must be RECIBIDO_TIENDA first)
        ActualizarEstadoOrdenDTO updateDto = ActualizarEstadoOrdenDTO.builder()
                .estadoOrden(EstadoOrden.ENTREGADO_CLIENTE)
                .build();

        assertThrows(IllegalArgumentException.class, () -> {
            service.actualizarEstado(orden.getId(), updateDto);
        });
    }

    private Cliente crearCliente(String documento, String nombre) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.save(TipoDocumento.builder()
                .nombre("DNI LAB " + documento)
                .build());
        return clienteRepository.save(Cliente.builder()
                .tipoDocumento(tipoDocumento)
                .numeroDocumento(documento)
                .nombre(nombre)
                .apellidoPaterno("Prueba")
                .apellidoMaterno("Lab")
                .direccion("Direccion cliente")
                .telefono("987654321")
                .correo("cliente" + documento + "@example.test")
                .estado(1)
                .build());
    }

    private Empleado crearEmpleado(String username) {
        Perfil perfil = perfilRepository.save(Perfil.builder()
                .nombre("PERFIL_" + username)
                .descripcion("Perfil de laboratorio")
                .estado(1)
                .build());

        return empleadoRepository.save(Empleado.builder()
                .nombre("Empleado")
                .username(username)
                .apellidoPaterno("Laboratorio")
                .apellidoMaterno("Prueba")
                .correo(username + "@example.test")
                .contrasena("secret")
                .telefono("999888777")
                .direccion("Direccion de prueba")
                .estado(1)
                .numeroDocumento(String.format("%08d", Math.abs((username + "doc").hashCode()) % 100_000_000))
                .perfil(perfil)
                .idTipoDocumento(1L)
                .build());
    }
}
