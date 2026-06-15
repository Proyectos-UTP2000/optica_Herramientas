package com.herramientas.optica.modules.clientes.service;

import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;
import com.herramientas.optica.modules.cotizaciones.dto.CotizacionDTO;
import com.herramientas.optica.modules.cotizaciones.repository.CotizacionRepository;
import com.herramientas.optica.modules.cotizaciones.service.CotizacionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClientePortalService {

    private final ClienteRepository clienteRepository;
    private final CotizacionRepository cotizacionRepository;
    private final CotizacionService cotizacionService;

    public ClientePortalService(ClienteRepository clienteRepository,
                                CotizacionRepository cotizacionRepository,
                                CotizacionService cotizacionService) {
        this.clienteRepository = clienteRepository;
        this.cotizacionRepository = cotizacionRepository;
        this.cotizacionService = cotizacionService;
    }

    @Transactional(readOnly = true)
    public Cliente obtenerPerfil(String correo) {
        return clienteRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @Transactional
    public Cliente actualizarPerfil(String correo, Cliente nuevoPerfil) {
        Cliente cli = clienteRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        cli.setNombre(nuevoPerfil.getNombre());
        cli.setApellidoPaterno(nuevoPerfil.getApellidoPaterno());
        cli.setApellidoMaterno(nuevoPerfil.getApellidoMaterno());
        cli.setTelefono(nuevoPerfil.getTelefono());
        cli.setDireccion(nuevoPerfil.getDireccion());
        return clienteRepository.save(cli);
    }

    @Transactional(readOnly = true)
    public List<CotizacionDTO> listarCotizaciones(String correo) {
        Cliente cli = clienteRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        return cotizacionRepository.findAll().stream()
                .filter(c -> c.getClienteUsuario() != null && c.getClienteUsuario().getId().equals(cli.getId()))
                .map(c -> cotizacionService.obtenerPorId(c.getId()))
                .collect(Collectors.toList());
    }
}
