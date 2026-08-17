package com.stenico.ventas.config;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.stenico.ventas.model.Cliente;
import com.stenico.ventas.model.Producto;
import com.stenico.ventas.repository.ClienteRepository;
import com.stenico.ventas.repository.ProductoRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;

    @Override
    public void run(String... args) {
        if (productoRepository.count() == 0) {
            productoRepository.save(Producto.builder().codigo("P001").nombre("Teclado mecanico")
                    .descripcion("Teclado gamer con switches rojos").categoria("Perifericos")
                    .precio(new BigDecimal("8500.00")).precioRevendedor(new BigDecimal("7200.00"))
                    .stock(20).build());
            productoRepository.save(Producto.builder().codigo("P002").nombre("Mouse inalambrico")
                    .descripcion("Mouse ergonomico 2.4GHz").categoria("Perifericos")
                    .precio(new BigDecimal("4200.50")).precioRevendedor(new BigDecimal("3600.00"))
                    .stock(35).build());
            productoRepository.save(Producto.builder().codigo("P003").nombre("Monitor 24 pulgadas")
                    .descripcion("Monitor Full HD 75Hz").categoria("Pantallas")
                    .precio(new BigDecimal("185000.00")).precioRevendedor(new BigDecimal("160000.00"))
                    .stock(10).build());
            productoRepository.save(Producto.builder().codigo("P004").nombre("Parlante Bluetooth")
                    .descripcion("Altavoz portatil 20W").categoria("Audio")
                    .precio(new BigDecimal("32000.00")).precioRevendedor(new BigDecimal("27000.00"))
                    .stock(15).build());
            productoRepository.save(Producto.builder().codigo("P005").nombre("Webcam HD")
                    .descripcion("Camara USB 1080p").categoria("Perifericos")
                    .precio(new BigDecimal("21000.00")).precioRevendedor(new BigDecimal("18000.00"))
                    .stock(8).build());
        }

        if (clienteRepository.count() == 0) {
            clienteRepository.save(Cliente.builder().nombre("Juan").apellido("Perez")
                    .email("juan.perez@example.com").telefono("351-555-0100")
                    .direccion("Av. Colon 123").cuit("20-30112233-4").build());
            clienteRepository.save(Cliente.builder().nombre("Maria").apellido("Gonzalez")
                    .email("maria.gonzalez@example.com").telefono("351-555-0200")
                    .direccion("Bv. San Juan 456").cuit("27-28998877-6").build());
            clienteRepository.save(Cliente.builder().nombre("Carlos").apellido("Rodriguez")
                    .email("carlos.rodriguez@example.com").telefono("351-555-0300")
                    .direccion("Ituzaingo 789").cuit("23-25665544-8").build());
        }
    }
}
