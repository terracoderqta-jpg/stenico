package com.stenico.ventas.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stenico.ventas.exception.ResourceNotFoundException;
import com.stenico.ventas.model.Producto;
import com.stenico.ventas.repository.ProductoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    public Optional<Producto> findById(Long id) {
        return productoRepository.findById(id);
    }

    @Transactional
    public Producto create(Producto producto) {
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto update(Long id, Producto datos) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        BigDecimal precioActual = producto.getPrecio();
        BigDecimal precioNuevo = datos.getPrecio();
        boolean precioCambio = precioNuevo != null && precioActual != null
                && precioNuevo.compareTo(precioActual) != 0;
        producto.setCodigo(datos.getCodigo());
        producto.setNombre(datos.getNombre());
        producto.setMarca(datos.getMarca());
        producto.setDescripcion(datos.getDescripcion());
        producto.setCategoria(datos.getCategoria());
        producto.setSubcategoria(datos.getSubcategoria());
        producto.setVoltaje(datos.getVoltaje());
        producto.setLargo(datos.getLargo());
        producto.setAncho(datos.getAncho());
        producto.setPrecio(precioNuevo);
        if (precioCambio && precioNuevo.signum() > 0 && producto.getPrecioRevendedor() != null && precioActual.signum() > 0) {
            BigDecimal ratio = producto.getPrecioRevendedor().divide(precioActual, 10, RoundingMode.HALF_UP);
            producto.setPrecioRevendedor(precioNuevo.multiply(ratio).setScale(2, RoundingMode.HALF_UP));
        } else {
            producto.setPrecioRevendedor(datos.getPrecioRevendedor());
        }
        producto.setStock(datos.getStock());
        return productoRepository.save(producto);
    }

    @Transactional
    public ImportResult importar(List<Producto> productos) {
        int creados = 0;
        int omitidos = 0;
        for (Producto p : productos) {
            if (p.getCodigo() == null || p.getCodigo().isBlank()
                    || p.getNombre() == null || p.getNombre().isBlank()) {
                omitidos++;
                continue;
            }
            p.setCodigo(p.getCodigo().trim());
            p.setNombre(p.getNombre().trim());
            if (productoRepository.existsByCodigo(p.getCodigo())) {
                omitidos++;
                continue;
            }
            if (p.getPrecio() == null) {
                p.setPrecio(java.math.BigDecimal.ZERO);
            }
            if (p.getStock() == null) {
                p.setStock(0);
            }
            productoRepository.save(p);
            creados++;
        }
        return new ImportResult(creados, omitidos);
    }

    public record ImportResult(int creados, int omitidos) {
    }

    public record AjustePreciosRequest(String marca, BigDecimal porcentajeNormal, BigDecimal porcentajeSobrePrecio) {
    }

    public record AjusteResult(int actualizados) {
    }

    @Transactional
    public AjusteResult ajustarPrecios(AjustePreciosRequest request) {
        BigDecimal multNormal = multiplicador(request.porcentajeNormal());
        BigDecimal factorSobre = (request.porcentajeSobrePrecio() != null
                && request.porcentajeSobrePrecio().signum() > 0)
                        ? request.porcentajeSobrePrecio().divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
                        : null;
        List<Producto> productos = (request.marca() == null || request.marca().isBlank())
                ? productoRepository.findAll()
                : productoRepository.findByMarca(request.marca());
        int actualizados = 0;
        for (Producto producto : productos) {
            boolean cambio = false;
            BigDecimal nuevoNormal = null;
            BigDecimal precioActual = producto.getPrecio();
            if (precioActual != null) {
                nuevoNormal = ajustar(precioActual, multNormal);
                if (nuevoNormal.compareTo(precioActual) != 0) {
                    producto.setPrecio(nuevoNormal);
                    cambio = true;
                }
            }
            if (nuevoNormal != null && nuevoNormal.signum() > 0) {
                BigDecimal nuevoRevendedor;
                if (factorSobre != null) {
                    nuevoRevendedor = nuevoNormal.multiply(factorSobre).setScale(2, RoundingMode.HALF_UP);
                } else if (producto.getPrecioRevendedor() != null && precioActual != null && precioActual.signum() > 0) {
                    BigDecimal ratio = producto.getPrecioRevendedor().divide(precioActual, 10, RoundingMode.HALF_UP);
                    nuevoRevendedor = nuevoNormal.multiply(ratio).setScale(2, RoundingMode.HALF_UP);
                } else {
                    continue;
                }
                BigDecimal actualRevendedor = producto.getPrecioRevendedor();
                if (actualRevendedor == null || nuevoRevendedor.compareTo(actualRevendedor) != 0) {
                    producto.setPrecioRevendedor(nuevoRevendedor);
                    cambio = true;
                }
            }
            if (cambio) {
                productoRepository.save(producto);
                actualizados++;
            }
        }
        return new AjusteResult(actualizados);
    }

    private BigDecimal multiplicador(BigDecimal porcentaje) {
        if (porcentaje == null) {
            porcentaje = BigDecimal.ZERO;
        }
        return BigDecimal.ONE.add(porcentaje.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP));
    }

    private BigDecimal ajustar(BigDecimal valor, BigDecimal multiplicador) {
        return valor.multiply(multiplicador).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public void delete(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Producto no encontrado: " + id);
        }
        productoRepository.deleteById(id);
    }
}
