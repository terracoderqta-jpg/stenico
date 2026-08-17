import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { Cliente } from '../../models/cliente';
import { Producto } from '../../models/producto';
import { Venta } from '../../models/venta';
import { ClienteService } from '../../services/cliente';
import { ProductoService } from '../../services/producto';
import { VentaService } from '../../services/venta';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatIconModule, MatTableModule, DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  productos: Producto[] = [];
  clientes: Cliente[] = [];
  ventas: Venta[] = [];

  loading = true;

  columnasVentas = ['fecha', 'cliente', 'items', 'total'];

  constructor(
    private readonly productoService: ProductoService,
    private readonly clienteService: ClienteService,
    private readonly ventaService: VentaService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.productoService.listar().subscribe((p) => {
      this.productos = p;
      this.cdr.markForCheck();
    });
    this.clienteService.listar().subscribe((c) => {
      this.clientes = c;
      this.cdr.markForCheck();
    });
    this.ventaService.listar().subscribe({
      next: (ventas) => {
        this.ventas = [...ventas].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  get totalVendido(): number {
    return this.ventas.reduce((acc, v) => acc + v.total, 0);
  }

  get stockBajo(): Producto[] {
    return this.productos.filter((p) => p.stock <= 5);
  }

  clienteNombre(venta: Venta): string {
    if (!venta.cliente) {
      return 'Mostrador';
    }
    return `${venta.cliente.nombre} ${venta.cliente.apellido ?? ''}`.trim();
  }
}
