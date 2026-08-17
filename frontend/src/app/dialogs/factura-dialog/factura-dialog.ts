import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MetodoPago, Venta } from '../../models/venta';

@Component({
  selector: 'app-factura-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule, DatePipe, DecimalPipe],
  templateUrl: './factura-dialog.html',
  styleUrl: './factura-dialog.css',
})
export class FacturaDialogComponent {
  readonly nombresPago: Record<MetodoPago, string> = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    TARJETA: 'Tarjeta',
    CHEQUE: 'Cheque',
  };

  constructor(
    public readonly dialogRef: MatDialogRef<FacturaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public venta: Venta,
  ) {}

  get clienteNombre(): string {
    if (!this.venta.cliente) {
      return 'Consumidor Final';
    }
    return `${this.venta.cliente.nombre} ${this.venta.cliente.apellido ?? ''}`.trim();
  }

  imprimir(): void {
    window.print();
  }
}
