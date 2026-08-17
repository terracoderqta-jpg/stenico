package com.stenico.ventas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.stenico.ventas.model.EstadoCheque;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChequeRequest(
        @NotBlank(message = "El banco es obligatorio") String banco,
        @NotBlank(message = "El numero de cheque es obligatorio") String numero,
        String titular,
        String numeroCuenta,
        LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        @NotNull(message = "El monto es obligatorio") BigDecimal monto,
        Long ventaId,
        Long clienteId,
        EstadoCheque estado) {
}
