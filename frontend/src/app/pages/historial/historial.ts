import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { FacturaDialogComponent } from '../../dialogs/factura-dialog/factura-dialog';
import { MetodoPago, TipoVenta, Venta } from '../../models/venta';
import { VentaService } from '../../services/venta';

@Component({
  selector: 'app-historial',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    NgClass,
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class HistorialComponent implements OnInit {
  readonly nombresPago: Record<MetodoPago, string> = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    TARJETA: 'Tarjeta',
    CHEQUE: 'Cheque',
  };

  ventas: Venta[] = [];
  loading = true;
  columnas = ['factura', 'fecha', 'tipo', 'cliente', 'pago', 'items', 'total', 'acciones'];

  constructor(
    private readonly ventaService: VentaService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  get totalRecaudado(): number {
    return this.ventas.reduce((acc, v) => acc + v.total, 0);
  }

  private cargar(): void {
    this.loading = true;
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
        this.notificar('Error al cargar las ventas');
      },
    });
  }

  verFactura(venta: Venta): void {
    this.dialog.open(FacturaDialogComponent, { width: '560px', data: venta });
  }

  clienteNombre(venta: Venta): string {
    if (!venta.cliente) {
      return 'Mostrador';
    }
    return `${venta.cliente.nombre} ${venta.cliente.apellido ?? ''}`.trim();
  }

  pagoNombre(metodo: MetodoPago): string {
    return this.nombresPago[metodo] ?? metodo;
  }

  tipoNombre(tipo?: TipoVenta): string {
    return tipo === 'REVENDEDOR' ? 'Revendedor' : 'Minorista';
  }

  iconoPago(metodo: MetodoPago): string {
    switch (metodo) {
      case 'EFECTIVO':
        return 'payments';
      case 'TRANSFERENCIA':
        return 'account_balance';
      case 'TARJETA':
        return 'credit_card';
      case 'CHEQUE':
        return 'receipt';
    }
  }

  private notificar(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
  }
}
