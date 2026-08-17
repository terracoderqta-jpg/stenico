import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Presupuesto } from '../../models/presupuesto';
import { PresupuestoService } from '../../services/presupuesto';

@Component({
  selector: 'app-presupuesto-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, DatePipe, DecimalPipe],
  templateUrl: './presupuesto-dialog.html',
  styleUrl: './presupuesto-dialog.css',
})
export class PresupuestoDialogComponent {
  constructor(
    public readonly dialogRef: MatDialogRef<PresupuestoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public presupuesto: Presupuesto,
    private readonly presupuestoService: PresupuestoService,
  ) {}

  get clienteNombre(): string {
    if (this.presupuesto.nombreCliente) {
      return this.presupuesto.nombreCliente;
    }
    if (!this.presupuesto.cliente) {
      return 'Consumidor Final';
    }
    return `${this.presupuesto.cliente.nombre} ${this.presupuesto.cliente.apellido ?? ''}`.trim();
  }

  get clienteCuit(): string {
    return this.presupuesto.cuitCliente ?? this.presupuesto.cliente?.cuit ?? '';
  }

  get clienteTelefono(): string {
    return this.presupuesto.telefonoCliente ?? this.presupuesto.cliente?.telefono ?? '';
  }

  get clienteDireccion(): string {
    return this.presupuesto.direccionCliente ?? this.presupuesto.cliente?.direccion ?? '';
  }

  get clienteEmail(): string {
    return this.presupuesto.emailCliente ?? this.presupuesto.cliente?.email ?? '';
  }

  imprimir(): void {
    window.print();
  }

  guardarPdf(): void {
    const id = this.presupuesto.id;
    if (!id) {
      return;
    }
    this.presupuestoService.presupuestoPdf(id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.presupuesto.nroPresupuesto ?? 'presupuesto'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}
