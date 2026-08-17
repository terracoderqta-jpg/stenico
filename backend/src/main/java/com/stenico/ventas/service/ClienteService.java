package com.stenico.ventas.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stenico.ventas.exception.ResourceNotFoundException;
import com.stenico.ventas.model.Cliente;
import com.stenico.ventas.repository.ClienteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public List<Cliente> findAll() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> findById(Long id) {
        return clienteRepository.findById(id);
    }

    @Transactional
    public Cliente create(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente update(Long id, Cliente datos) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + id));
        cliente.setNombre(datos.getNombre());
        cliente.setApellido(datos.getApellido());
        cliente.setEmail(datos.getEmail());
        cliente.setTelefono(datos.getTelefono());
        cliente.setDireccion(datos.getDireccion());
        cliente.setCuit(datos.getCuit());
        return clienteRepository.save(cliente);
    }

    @Transactional
    public void delete(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cliente no encontrado: " + id);
        }
        clienteRepository.deleteById(id);
    }
}
