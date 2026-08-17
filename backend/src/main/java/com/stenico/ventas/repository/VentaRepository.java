package com.stenico.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stenico.ventas.model.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long> {
}
