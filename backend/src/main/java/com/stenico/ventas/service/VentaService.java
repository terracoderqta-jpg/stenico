package com.stenico.ventas.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stenico.ventas.dto.VentaRequest;
import com.stenico.ventas.exception.BadRequestException;
import com.stenico.ventas.exception.ResourceNotFoundException;
import com.stenico.ventas.model.Cliente;
import com.stenico.ventas.model.Producto;
import com.stenico.ventas.model.TipoVenta;
import com.stenico.ventas.model.Venta;
import com.stenico.ventas.model.VentaDetalle;
import com.stenico.ventas.repository.ClienteRepository;
import com.stenico.ventas.repository.ProductoRepository;
import com.stenico.ventas.repository.VentaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;

    public List<Venta> findAll() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> findById(Long id) {
        return ventaRepository.findById(id);
    }

    @Transactional
    public Venta registrarVenta(VentaRequest request) {
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

        Venta venta = Venta.builder()
                .cliente(cliente)
                .fecha(fecha)
                .metodoPago(request.metodoPago())
                .tipoVenta(request.tipoVenta() != null ? request.tipoVenta() : TipoVenta.MINORISTA)
                .build();

        for (VentaRequest.Item item : request.items()) {
            Producto producto = productoRepository.findById(item.productoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + item.productoId()));

            if (producto.getStock() < item.cantidad()) {
                throw new BadRequestException("Stock insuficiente de '" + producto.getNombre() + "' (disponible: "
                        + producto.getStock() + ")");
            }

            BigDecimal precioUnitario = precioAplicable(producto, venta.getTipoVenta());

            VentaDetalle detalle = VentaDetalle.builder()
                    .producto(producto)
                    .cantidad(item.cantidad())
                    .precioUnitario(precioUnitario)
                    .build();
            detalle.recalcularSubtotal();

            venta.addDetalle(detalle);

            producto.setStock(producto.getStock() - item.cantidad());
            productoRepository.save(producto);
        }

        venta.recalcularTotal();
        venta.setNroFactura(generarNroFactura());
        return ventaRepository.save(venta);
    }

    private String generarNroFactura() {
        return String.format("FAC-%05d", ventaRepository.count() + 1);
    }

    private BigDecimal precioAplicable(Producto producto, TipoVenta tipoVenta) {
        if (tipoVenta == TipoVenta.REVENDEDOR && producto.getPrecioRevendedor() != null) {
            return producto.getPrecioRevendedor();
        }
        return producto.getPrecio();
    }
}
