package com.stenico.ventas.dto;

import java.math.BigDecimal;
import java.util.List;

import com.stenico.ventas.model.TipoVenta;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record PresupuestoRequest(
        Long clienteId,
        String fecha,
        TipoVenta tipoVenta,
        String observaciones,
        Integer diasVigencia,
        String clienteNombre,
        String clienteCuit,
        String clienteTelefono,
        String clienteDireccion,
        String clienteEmail,
        @NotEmpty List<@NotNull Item> items) {

    public record Item(
            @NotNull Long productoId,
            @NotNull @Min(1) Integer cantidad,
            BigDecimal precioUnitario) {
    }
}
