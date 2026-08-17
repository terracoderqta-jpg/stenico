import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ChequeDialogComponent } from '../../dialogs/cheque-dialog/cheque-dialog';
import { Cheque, ChequeRequest, EstadoCheque } from '../../models/cheque';
import { ChequeService } from '../../services/cheque';

@Component({
  selector: 'app-cheques',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    DatePipe,
    DecimalPipe,
    NgClass,
  ],
  templateUrl: './cheques.html',
  styleUrl: './cheques.css',
})
export class ChequesComponent implements OnInit {
  readonly estados: { valor: EstadoCheque; nombre: string; icono: string }[] = [
    { valor: 'PENDIENTE', nombre: 'Pendiente', icono: 'schedule' },
    { valor: 'COBRADO', nombre: 'Cobrado', icono: 'check_circle' },
    { valor: 'RECHAZADO', nombre: 'Rechazado', icono: 'cancel' },
    { valor: 'CANCELADO', nombre: 'Cancelado', icono: 'block' },
  ];

  cheques: Cheque[] = [];
  loading = true;
  columnas = ['cheque', 'titular', 'emision', 'vencimiento', 'monto', 'estado', 'venta', 'acciones'];

  constructor(
    private readonly chequeService: ChequeService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  get cantidadPendientes(): number {
    return this.cheques.filter((c) => c.estado === 'PENDIENTE').length;
  }

  get montoPendiente(): number {
    return this.cheques
      .filter((c) => c.estado === 'PENDIENTE')
      .reduce((acc, c) => acc + c.monto, 0);
  }

  private cargar(): void {
    this.loading = true;
    this.chequeService.listar().subscribe({
      next: (cheques) => {
        this.cheques = cheques;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notificar('Error al cargar los cheques');
      },
    });
  }

  estadoNombre(estado: EstadoCheque): string {
    return this.estados.find((e) => e.valor === estado)?.nombre ?? estado;
  }

  estadoIcono(estado: EstadoCheque): string {
    return this.estados.find((e) => e.valor === estado)?.icono ?? 'receipt';
  }

  abrirNuevo(): void {
    const ref = this.dialog.open(ChequeDialogComponent, { width: '560px', data: {} });
    ref.afterClosed().subscribe((req?: ChequeRequest) => {
      if (!req) {
        return;
      }
      this.chequeService.crear(req).subscribe({
        next: () => {
          this.notificar('Cheque guardado');
          this.cargar();
        },
        error: (e) => this.notificar(this.mensajeError(e)),
      });
    });
  }

  abrirEditar(cheque: Cheque): void {
    const ref = this.dialog.open(ChequeDialogComponent, {
      width: '560px',
      data: { cheque: { ...cheque } },
    });
    ref.afterClosed().subscribe((req?: ChequeRequest) => {
      if (!req || !cheque.id) {
        return;
      }
      this.chequeService
        .actualizar(cheque.id, { ...req, ventaId: cheque.venta?.id, clienteId: cheque.cliente?.id })
        .subscribe({
          next: () => {
            this.notificar('Cheque actualizado');
            this.cargar();
          },
          error: (e) => this.notificar(this.mensajeError(e)),
        });
    });
  }

  marcarCobrado(cheque: Cheque): void {
    if (!cheque.id) {
      return;
    }
    const req: ChequeRequest = {
      banco: cheque.banco,
      numero: cheque.numero,
      titular: cheque.titular,
      numeroCuenta: cheque.numeroCuenta,
      fechaEmision: cheque.fechaEmision,
      fechaVencimiento: cheque.fechaVencimiento,
      monto: cheque.monto,
      estado: 'COBRADO',
      ventaId: cheque.venta?.id,
      clienteId: cheque.cliente?.id,
    };
    this.chequeService.actualizar(cheque.id, req).subscribe({
      next: () => {
        this.notificar('Cheque marcado como cobrado');
        this.cargar();
      },
      error: (e) => this.notificar(this.mensajeError(e)),
    });
  }

  eliminar(cheque: Cheque): void {
    if (!cheque.id) {
      return;
    }
    if (!confirm(`¿Eliminar el cheque ${cheque.numero} de ${cheque.banco}?`)) {
      return;
    }
    this.chequeService.eliminar(cheque.id).subscribe({
      next: () => {
        this.notificar('Cheque eliminado');
        this.cargar();
      },
      error: (e) => this.notificar(this.mensajeError(e)),
    });
  }

  private mensajeError(err: unknown): string {
    const msg = (err as { error?: { message?: string } })?.error?.message;
    return msg ?? 'Error en la operación';
  }

  private notificar(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
  }
}
