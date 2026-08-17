package com.stenico.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stenico.ventas.model.Presupuesto;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {
}
