package com.stenico.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stenico.ventas.model.Cheque;

public interface ChequeRepository extends JpaRepository<Cheque, Long> {
}
