package com.stenico.ventas.service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stenico.ventas.dto.ChequeRequest;
import com.stenico.ventas.exception.ResourceNotFoundException;
import com.stenico.ventas.model.Cheque;
import com.stenico.ventas.model.Cliente;
import com.stenico.ventas.model.EstadoCheque;
import com.stenico.ventas.model.Venta;
import com.stenico.ventas.repository.ChequeRepository;
import com.stenico.ventas.repository.ClienteRepository;
import com.stenico.ventas.repository.VentaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChequeService {

    private final ChequeRepository chequeRepository;
    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;

    public List<Cheque> findAll() {
        return chequeRepository.findAll().stream()
                .sorted(Comparator.comparing(Cheque::getFechaVencimiento,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    public Optional<Cheque> findById(Long id) {
        return chequeRepository.findById(id);
    }

    @Transactional
    public Cheque create(ChequeRequest request) {
        return chequeRepository.save(mapear(new Cheque(), request));
    }

    @Transactional
    public Cheque update(Long id, ChequeRequest request) {
        Cheque cheque = chequeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cheque no encontrado: " + id));
        return chequeRepository.save(mapear(cheque, request));
    }

    @Transactional
    public void delete(Long id) {
        if (!chequeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cheque no encontrado: " + id);
        }
        chequeRepository.deleteById(id);
    }

    private Cheque mapear(Cheque cheque, ChequeRequest request) {
        cheque.setBanco(request.banco());
        cheque.setNumero(request.numero());
        cheque.setTitular(request.titular());
        cheque.setNumeroCuenta(request.numeroCuenta());
        cheque.setFechaEmision(request.fechaEmision());
        cheque.setFechaVencimiento(request.fechaVencimiento());
        cheque.setMonto(request.monto());
        cheque.setEstado(request.estado() != null ? request.estado() : EstadoCheque.PENDIENTE);

        if (request.ventaId() != null) {
            Venta venta = ventaRepository.findById(request.ventaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada: " + request.ventaId()));
            cheque.setVenta(venta);
        }
        if (request.clienteId() != null) {
            Cliente cliente = clienteRepository.findById(request.clienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + request.clienteId()));
            cheque.setCliente(cliente);
        }
        return cheque;
    }
}
