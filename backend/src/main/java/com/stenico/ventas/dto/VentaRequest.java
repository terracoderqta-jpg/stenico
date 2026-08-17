package com.stenico.ventas.dto;

import java.util.List;

import com.stenico.ventas.model.MetodoPago;
import com.stenico.ventas.model.TipoVenta;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record VentaRequest(
        Long clienteId,
        String fecha,
        @NotNull MetodoPago metodoPago,
        TipoVenta tipoVenta,
        @NotEmpty List<@NotNull Item> items) {

    public record Item(
            @NotNull Long productoId,
            @NotNull @Min(1) Integer cantidad) {
    }
}
