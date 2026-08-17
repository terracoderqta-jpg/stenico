package com.stenico.ventas.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stenico.ventas.dto.PresupuestoRequest;
import com.stenico.ventas.exception.BadRequestException;
import com.stenico.ventas.exception.ResourceNotFoundException;
import com.stenico.ventas.model.Cliente;
import com.stenico.ventas.model.Presupuesto;
import com.stenico.ventas.model.PresupuestoDetalle;
import com.stenico.ventas.model.Producto;
import com.stenico.ventas.model.TipoVenta;
import com.stenico.ventas.repository.ClienteRepository;
import com.stenico.ventas.repository.PresupuestoRepository;
import com.stenico.ventas.repository.ProductoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PresupuestoService {

    private final PresupuestoRepository presupuestoRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;

    public List<Presupuesto> findAll() {
        return presupuestoRepository.findAll();
    }

    public Optional<Presupuesto> findById(Long id) {
        return presupuestoRepository.findById(id);
    }

    @Transactional
    public Presupuesto crearPresupuesto(PresupuestoRequest request) {
        Cliente cliente = null;
        if (request.clienteId() != null) {
            cliente = clienteRepository.findById(request.clienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + request.clienteId()));
        }

        LocalDateTime fecha = LocalDateTime.now();
        if (request.fecha() != null && !request.fecha().isBlank()) {
            try {
                fecha = LocalDateTime.parse(request.fecha());
            } catch (DateTimeParseException e) {
                throw new BadRequestException("Formato de fecha invalido: " + request.fecha());
            }
        }

        int diasVigencia = request.diasVigencia() != null && request.diasVigencia() > 0
                ? request.diasVigencia()
                : 30;

        Presupuesto presupuesto = Presupuesto.builder()
                .cliente(cliente)
                .fecha(fecha)
                .tipoVenta(request.tipoVenta() != null ? request.tipoVenta() : TipoVenta.MINORISTA)
                .observaciones(request.observaciones())
                .diasVigencia(diasVigencia)
                .build();

        if (cliente != null) {
            presupuesto.setNombreCliente((cliente.getNombre()
                    + (cliente.getApellido() != null ? " " + cliente.getApellido() : "")).trim());
            presupuesto.setCuitCliente(cliente.getCuit());
            presupuesto.setTelefonoCliente(cliente.getTelefono());
            presupuesto.setDireccionCliente(cliente.getDireccion());
            presupuesto.setEmailCliente(cliente.getEmail());
        } else {
            presupuesto.setNombreCliente(blankToNull(request.clienteNombre()));
            presupuesto.setCuitCliente(blankToNull(request.clienteCuit()));
            presupuesto.setTelefonoCliente(blankToNull(request.clienteTelefono()));
            presupuesto.setDireccionCliente(blankToNull(request.clienteDireccion()));
            presupuesto.setEmailCliente(blankToNull(request.clienteEmail()));
        }

        for (PresupuestoRequest.Item item : request.items()) {
            Producto producto = productoRepository.findById(item.productoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + item.productoId()));

            BigDecimal precioUnitario = item.precioUnitario() != null
                    ? item.precioUnitario()
                    : precioAplicable(producto, presupuesto.getTipoVenta());

            PresupuestoDetalle detalle = PresupuestoDetalle.builder()
                    .producto(producto)
                    .cantidad(item.cantidad())
                    .precioUnitario(precioUnitario)
                    .build();
            detalle.recalcularSubtotal();

            presupuesto.addDetalle(detalle);
        }

        presupuesto.recalcularTotal();
        presupuesto.setNroPresupuesto(generarNroPresupuesto());
        return presupuestoRepository.save(presupuesto);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!presupuestoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Presupuesto no encontrado: " + id);
        }
        presupuestoRepository.deleteById(id);
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private String generarNroPresupuesto() {
        return String.format("PRES-%05d", presupuestoRepository.count() + 1);
    }

    private BigDecimal precioAplicable(Producto producto, TipoVenta tipoVenta) {
        if (tipoVenta == TipoVenta.REVENDEDOR && producto.getPrecioRevendedor() != null) {
            return producto.getPrecioRevendedor();
        }
        return producto.getPrecio();
    }
}
