package com.herramientas.optica.modules.clientes.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.herramientas.optica.modules.clientes.model.Cliente;
import com.herramientas.optica.modules.clientes.repository.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Cliente guardar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }
}