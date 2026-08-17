import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PresupuestoDialogComponent } from '../../dialogs/presupuesto-dialog/presupuesto-dialog';
import { Cliente } from '../../models/cliente';
import { Presupuesto, PresupuestoRequest } from '../../models/presupuesto';
import { Producto } from '../../models/producto';
import { TipoVenta } from '../../models/venta';
import { ClienteService } from '../../services/cliente';
import { PresupuestoService } from '../../services/presupuesto';
import { ProductoService } from '../../services/producto';

interface Linea {
  producto: Producto;
  cantidad: number;
  precio: number;
  subtotal: number;
}

@Component({
  selector: 'app-presupuestos',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
    NgClass,
  ],
  templateUrl: './presupuestos.html',
  styleUrl: './presupuestos.css',
})
export class PresupuestosComponent implements OnInit {
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  presupuestos: Presupuesto[] = [];
  cargando = true;
  loadingList = true;

  cliente: Cliente | null = null;
  clienteCtrl = new FormControl<string | Cliente>('');
  clienteNombreCtrl = new FormControl('');
  clienteCuitCtrl = new FormControl('');
  clienteTelefonoCtrl = new FormControl('');
  clienteDireccionCtrl = new FormControl('');
  clienteEmailCtrl = new FormControl('');
  tipoVentaCtrl = new FormControl<TipoVenta>('MINORISTA');
  fechaCtrl = new FormControl<Date>(new Date());
  observacionesCtrl = new FormControl('');
  diasVigenciaCtrl = new FormControl<number>(30);
  busquedaCtrl = new FormControl('');

  lineas: Linea[] = [];
  enviando = false;
  columnas = ['nro', 'fecha', 'cliente', 'tipo', 'items', 'total', 'acciones'];

  constructor(
    private readonly clienteService: ClienteService,
    private readonly productoService: ProductoService,
    private readonly presupuestoService: PresupuestoService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.clienteService.listar().subscribe((c) => {
      this.clientes = c;
      this.cdr.markForCheck();
    });
    this.productoService.listar().subscribe({
      next: (p) => {
        this.productos = p;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
        this.notificar('Error al cargar los productos');
      },
    });
    this.cargarPresupuestos();
  }

  get total(): number {
    return this.lineas.reduce((acc, l) => acc + l.subtotal, 0);
  }

  get cantidadItems(): number {
    return this.lineas.reduce((acc, l) => acc + l.cantidad, 0);
  }

  get esRevendedor(): boolean {
    return this.tipoVentaCtrl.value === 'REVENDEDOR';
  }

  precioActivo(p: Producto): number {
    if (this.esRevendedor && p.precioRevendedor) {
      return p.precioRevendedor;
    }
    return p.precio;
  }

  cambiarTipoVenta(): void {
    for (const l of this.lineas) {
      l.precio = this.precioActivo(l.producto);
      l.subtotal = l.precio * l.cantidad;
    }
  }

  clientesFiltrados(): Cliente[] {
    const valor = this.clienteCtrl.value;
    const q = typeof valor === 'string' ? valor.toLowerCase().trim() : '';
    if (!q) {
      return this.clientes;
    }
    return this.clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.apellido ?? '').toLowerCase().includes(q) ||
        (c.cuit ?? '').toLowerCase().includes(q),
    );
  }

  mostrarCliente(c: Cliente | string | null): string {
    if (!c) {
      return '';
    }
    if (typeof c === 'string') {
      return c;
    }
    return `${c.nombre} ${c.apellido ?? ''}`.trim();
  }

  seleccionarCliente(event: { option: { value: Cliente } }): void {
    this.cliente = event.option.value;
    const c = this.cliente;
    this.clienteNombreCtrl.setValue(`${c.nombre} ${c.apellido ?? ''}`.trim());
    this.clienteCuitCtrl.setValue(c.cuit ?? '');
    this.clienteTelefonoCtrl.setValue(c.telefono ?? '');
    this.clienteDireccionCtrl.setValue(c.direccion ?? '');
    this.clienteEmailCtrl.setValue(c.email ?? '');
    this.setClienteManualDeshabilitado(true);
    this.cdr.markForCheck();
  }

  limpiarCliente(): void {
    this.cliente = null;
    this.clienteCtrl.setValue('');
    this.clienteNombreCtrl.setValue('');
    this.clienteCuitCtrl.setValue('');
    this.clienteTelefonoCtrl.setValue('');
    this.clienteDireccionCtrl.setValue('');
    this.clienteEmailCtrl.setValue('');
    this.setClienteManualDeshabilitado(false);
    this.cdr.markForCheck();
  }

  private setClienteManualDeshabilitado(deshabilitar: boolean): void {
    const controles = [
      this.clienteNombreCtrl,
      this.clienteCuitCtrl,
      this.clienteTelefonoCtrl,
      this.clienteDireccionCtrl,
      this.clienteEmailCtrl,
    ];
    if (deshabilitar) {
      controles.forEach((c) => c.disable());
    } else {
      controles.forEach((c) => c.enable());
    }
  }

  productosVisibles(): Producto[] {
    const q = (this.busquedaCtrl.value ?? '').toLowerCase().trim();
    if (!q) {
      return [];
    }
    return this.productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.codigo ?? '').toLowerCase().includes(q) ||
        (p.categoria ?? '').toLowerCase().includes(q) ||
        (p.marca ?? '').toLowerCase().includes(q) ||
        (p.subcategoria ?? '').toLowerCase().includes(q),
    );
  }

  agregarProducto(p: Producto): void {
    const linea = this.lineas.find((l) => l.producto.id === p.id);
    if (linea) {
      linea.cantidad += 1;
      linea.subtotal = linea.precio * linea.cantidad;
    } else {
      this.lineas.push({ producto: p, cantidad: 1, precio: this.precioActivo(p), subtotal: this.precioActivo(p) });
    }
    this.busquedaCtrl.setValue('');
  }

  actualizarCantidad(l: Linea, cantidad: number): void {
    const nueva = Math.max(1, cantidad || 1);
    l.cantidad = nueva;
    l.subtotal = l.precio * nueva;
  }

  actualizarPrecio(l: Linea, precio: number): void {
    const nuevo = Math.max(0, precio || 0);
    l.precio = nuevo;
    l.subtotal = nuevo * l.cantidad;
  }

  quitarProducto(l: Linea): void {
    const idx = this.lineas.indexOf(l);
    if (idx >= 0) {
      this.lineas.splice(idx, 1);
    }
  }

  puedeGuardar(): boolean {
    return this.lineas.length > 0 && !this.enviando;
  }

  guardar(): void {
    if (!this.puedeGuardar()) {
      return;
    }
    const request: PresupuestoRequest = {
      clienteId: this.cliente?.id,
      clienteNombre: this.cliente ? undefined : this.clienteNombreCtrl.value?.trim() || undefined,
      clienteCuit: this.cliente ? undefined : this.clienteCuitCtrl.value?.trim() || undefined,
      clienteTelefono: this.cliente ? undefined : this.clienteTelefonoCtrl.value?.trim() || undefined,
      clienteDireccion: this.cliente ? undefined : this.clienteDireccionCtrl.value?.trim() || undefined,
      clienteEmail: this.cliente ? undefined : this.clienteEmailCtrl.value?.trim() || undefined,
      tipoVenta: this.tipoVentaCtrl.value ?? 'MINORISTA',
      observaciones: this.observacionesCtrl.value || undefined,
      diasVigencia: this.diasVigenciaCtrl.value || 30,
      items: this.lineas.map((l) => ({
        productoId: l.producto.id!,
        cantidad: l.cantidad,
        precioUnitario: l.precio,
      })),
    };
    if (this.fechaCtrl.value) {
      const d = new Date(this.fechaCtrl.value);
      const ahora = new Date();
      d.setHours(ahora.getHours(), ahora.getMinutes());
      request.fecha = this.formatearFecha(d);
    }

    this.enviando = true;
    this.presupuestoService.crear(request).subscribe({
      next: (presupuesto) => {
        this.enviando = false;
        this.reiniciar();
        this.notificar(`Presupuesto ${presupuesto.nroPresupuesto} guardado`);
      },
      error: (e) => {
        this.enviando = false;
        this.cdr.markForCheck();
        this.notificar(e?.error?.message ?? 'Error al guardar el presupuesto');
      },
    });
  }

  ver(presupuesto: Presupuesto): void {
    this.dialog.open(PresupuestoDialogComponent, { width: '560px', data: presupuesto });
  }

  eliminar(presupuesto: Presupuesto): void {
    const nombre = `${presupuesto.nroPresupuesto} - ${this.clienteNombre(presupuesto)}`;
    if (!window.confirm(`¿Eliminar el presupuesto ${nombre}?`)) {
      return;
    }
    this.presupuestoService.eliminar(presupuesto.id!).subscribe({
      next: () => {
        this.presupuestos = this.presupuestos.filter((p) => p.id !== presupuesto.id);
        this.cdr.markForCheck();
        this.notificar('Presupuesto eliminado');
      },
      error: () => this.notificar('Error al eliminar el presupuesto'),
    });
  }

  clienteNombre(p: Presupuesto): string {
    if (p.nombreCliente) {
      return p.nombreCliente;
    }
    if (!p.cliente) {
      return 'Mostrador';
    }
    return `${p.cliente.nombre} ${p.cliente.apellido ?? ''}`.trim();
  }

  tipoNombre(tipo?: TipoVenta): string {
    return tipo === 'REVENDEDOR' ? 'Revendedor' : 'Minorista';
  }

  private cargarPresupuestos(): void {
    this.loadingList = true;
    this.presupuestoService.listar().subscribe({
      next: (presupuestos) => {
        this.presupuestos = [...presupuestos].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
        this.loadingList = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingList = false;
        this.cdr.markForCheck();
        this.notificar('Error al cargar los presupuestos');
      },
    });
  }

  private reiniciar(): void {
    this.lineas = [];
    this.cliente = null;
    this.clienteCtrl.setValue('');
    this.clienteNombreCtrl.setValue('');
    this.clienteCuitCtrl.setValue('');
    this.clienteTelefonoCtrl.setValue('');
    this.clienteDireccionCtrl.setValue('');
    this.clienteEmailCtrl.setValue('');
    this.setClienteManualDeshabilitado(false);
    this.observacionesCtrl.setValue('');
    this.fechaCtrl.setValue(new Date());
    this.diasVigenciaCtrl.setValue(30);
    this.busquedaCtrl.setValue('');
    this.cargarPresupuestos();
  }

  private formatearFecha(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private notificar(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
  }
}
