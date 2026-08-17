package com.stenico.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stenico.ventas.model.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    java.util.Optional<Cliente> findByCuit(String cuit);
}
