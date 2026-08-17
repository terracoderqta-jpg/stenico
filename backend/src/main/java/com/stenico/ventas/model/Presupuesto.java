package com.stenico.ventas.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "presupuestos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Presupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(length = 200)
    private String nombreCliente;

    @Column(length = 50)
    private String cuitCliente;

    @Column(length = 50)
    private String telefonoCliente;

    @Column(length = 200)
    private String direccionCliente;

    @Column(length = 100)
    private String emailCliente;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TipoVenta tipoVenta;

    @Column(unique = true, length = 20)
    private String nroPresupuesto;

    @Column(length = 500)
    private String observaciones;

    @Builder.Default
    @Column(nullable = false)
    private Integer diasVigencia = 30;

    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    @OneToMany(mappedBy = "presupuesto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    @JsonManagedReference
    private List<PresupuestoDetalle> detalles = new ArrayList<>();

    public void addDetalle(PresupuestoDetalle detalle) {
        detalles.add(detalle);
        detalle.setPresupuesto(this);
        recalcularTotal();
    }

    public void recalcularTotal() {
        total = detalles.stream()
                .map(PresupuestoDetalle::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
