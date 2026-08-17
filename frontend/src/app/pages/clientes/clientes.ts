import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClienteDialogComponent } from '../../dialogs/cliente-dialog/cliente-dialog';
import { Cliente } from '../../models/cliente';
import { ClienteService } from '../../services/cliente';

@Component({
  selector: 'app-clientes',
  imports: [MatTableModule, MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = true;
  columnas = ['nombre', 'email', 'telefono', 'cuit', 'direccion', 'acciones'];

  constructor(
    private readonly clienteService: ClienteService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.loading = true;
    this.clienteService.listar().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notificar('Error al cargar los clientes');
      },
    });
  }

  abrirNuevo(): void {
    const ref = this.dialog.open(ClienteDialogComponent, { width: '520px', data: null });
    ref.afterClosed().subscribe((cliente: Cliente | undefined) => {
      if (!cliente) {
        return;
      }
      this.clienteService.crear(cliente).subscribe({
        next: () => {
          this.notificar('Cliente creado');
          this.cargar();
        },
        error: (e) => this.notificar(this.mensajeError(e)),
      });
    });
  }

  abrirEditar(cliente: Cliente): void {
    const ref = this.dialog.open(ClienteDialogComponent, {
      width: '520px',
      data: { ...cliente },
    });
    ref.afterClosed().subscribe((datos: Cliente | undefined) => {
      if (!datos || !cliente.id) {
        return;
      }
      this.clienteService.actualizar(cliente.id, datos).subscribe({
        next: () => {
          this.notificar('Cliente actualizado');
          this.cargar();
        },
        error: (e) => this.notificar(this.mensajeError(e)),
      });
    });
  }

  eliminar(cliente: Cliente): void {
    if (!cliente.id) {
      return;
    }
    const nombre = `${cliente.nombre} ${cliente.apellido ?? ''}`.trim();
    if (!confirm(`¿Eliminar al cliente "${nombre}"?`)) {
      return;
    }
    this.clienteService.eliminar(cliente.id).subscribe({
      next: () => {
        this.notificar('Cliente eliminado');
        this.cargar();
      },
      error: (e) => this.notificar(this.mensajeError(e)),
    });
  }

  nombreCompleto(cliente: Cliente): string {
    return `${cliente.nombre} ${cliente.apellido ?? ''}`.trim();
  }

  private mensajeError(err: unknown): string {
    const msg = (err as { error?: { message?: string } })?.error?.message;
    return msg ?? 'Error en la operación';
  }

  private notificar(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
  }
}
