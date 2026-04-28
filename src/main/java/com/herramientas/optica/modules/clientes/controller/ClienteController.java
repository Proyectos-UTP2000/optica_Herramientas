package com.herramientas.optica.modules.clientes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.clientes.dto.ClienteRequestDTO;
import com.herramientas.optica.modules.clientes.dto.ClienteResponseDTO;
import com.herramientas.optica.modules.clientes.service.ClienteService;

@RestController
@RequestMapping("/api/v1/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> listarClientes() {
        return ResponseEntity.ok(clienteService.listarActivosEInactivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> buscarCliente(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> crearCliente(@RequestBody ClienteRequestDTO dto) {
        ClienteResponseDTO nuevoCliente = clienteService.crearCliente(dto);
        return new ResponseEntity<>(nuevoCliente, HttpStatus.CREATED);
    }

    @PatchMapping("/reactivar/{numeroDocumento}")
    public ResponseEntity<ClienteResponseDTO> reactivarCliente(@PathVariable String numeroDocumento) {
        ClienteResponseDTO clienteReactivado = clienteService.reactivarCliente(numeroDocumento);
        return ResponseEntity.ok(clienteReactivado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> actualizarCliente(
            @PathVariable Long id,
            @RequestBody ClienteRequestDTO dto) {

        ClienteResponseDTO clienteActualizado = clienteService.actualizarCliente(id, dto);
        return ResponseEntity.ok(clienteActualizado);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ClienteResponseDTO> cambiarEstado(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.cambiarEstado(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable Long id) {
        clienteService.borradoLogico(id);
        return ResponseEntity.noContent().build();
    }
}