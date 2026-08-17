import { DecimalPipe } from '@angular/common';
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
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ClienteDialogComponent } from '../../dialogs/cliente-dialog/cliente-dialog';
import { ChequeDialogComponent } from '../../dialogs/cheque-dialog/cheque-dialog';
import { FacturaDialogComponent } from '../../dialogs/factura-dialog/factura-dialog';
import { ChequeRequest } from '../../models/cheque';
import { Cliente } from '../../models/cliente';
import { Producto } from '../../models/producto';
import { MetodoPago, TipoVenta, Venta, VentaRequest } from '../../models/venta';
import { ChequeService } from '../../services/cheque';
import { ClienteService } from '../../services/cliente';
import { ProductoService } from '../../services/producto';
import { VentaService } from '../../services/venta';

interface LineaCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-ventas',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class VentasComponent implements OnInit {
  readonly metodosPago: { valor: MetodoPago; nombre: string; icono: string }[] = [
    { valor: 'EFECTIVO', nombre: 'Efectivo', icono: 'payments' },
    { valor: 'TRANSFERENCIA', nombre: 'Transferencia', icono: 'account_balance' },
    { valor: 'TARJETA', nombre: 'Tarjeta', icono: 'credit_card' },
    { valor: 'CHEQUE', nombre: 'Cheque', icono: 'receipt' },
  ];

  clientes: Cliente[] = [];
  productos: Producto[] = [];
  cargando = true;

  carrito: LineaCarrito[] = [];

  cliente: Cliente | null = null;
  clienteCtrl = new FormControl<string | Cliente>('');

  busquedaCtrl = new FormControl('');
  fechaCtrl = new FormControl<Date>(new Date());
  pagoCtrl = new FormControl<MetodoPago | null>(null);
  tipoVentaCtrl = new FormControl<TipoVenta>('MINORISTA');
  enviando = false;

  constructor(
    private readonly clienteService: ClienteService,
    private readonly productoService: ProductoService,
    private readonly ventaService: VentaService,
    private readonly chequeService: ChequeService,
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
  }

  get total(): number {
    return this.carrito.reduce((acc, l) => acc + l.subtotal, 0);
  }

  get cantidadItems(): number {
    return this.carrito.reduce((acc, l) => acc + l.cantidad, 0);
  }

  pagoNombre(): string {
    return this.metodosPago.find((m) => m.valor === this.pagoCtrl.value)?.nombre ?? '';
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
    for (const l of this.carrito) {
      l.subtotal = this.precioActivo(l.producto) * l.cantidad;
    }
    if (this.esRevendedor) {
      const sinPrecio = this.carrito.filter((l) => !l.producto.precioRevendedor).length;
      if (sinPrecio > 0) {
        this.notificar(`${sinPrecio} producto(s) sin precio revendedor: se usa el precio normal`);
      }
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
  }

  limpiarCliente(): void {
    this.cliente = null;
    this.clienteCtrl.setValue('');
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
    const linea = this.carrito.find((l) => l.producto.id === p.id);
    const disponible = p.stock ?? 0;
    if (linea) {
      if (linea.cantidad < disponible) {
        linea.cantidad += 1;
        linea.subtotal = this.precioActivo(linea.producto) * linea.cantidad;
      } else {
        this.notificar(`Stock máximo disponible: ${disponible}`);
      }
    } else {
      if (disponible <= 0) {
        this.notificar('Producto sin stock');
        return;
      }
      this.carrito.push({ producto: p, cantidad: 1, subtotal: this.precioActivo(p) });
    }
    this.busquedaCtrl.setValue('');
  }

  actualizarLinea(l: LineaCarrito, cantidad: number): void {
    const disponible = l.producto.stock ?? 0;
    const nueva = Math.max(1, Math.min(cantidad || 1, disponible));
    l.cantidad = nueva;
    l.subtotal = this.precioActivo(l.producto) * nueva;
  }

  quitarProducto(l: LineaCarrito): void {
    const idx = this.carrito.indexOf(l);
    if (idx >= 0) {
      this.carrito.splice(idx, 1);
    }
  }

  crearCliente(): void {
    const ref = this.dialog.open(ClienteDialogComponent, { width: '520px', data: null });
    ref.afterClosed().subscribe((cliente: Cliente | undefined) => {
      if (!cliente) {
        return;
      }
      this.clienteService.crear(cliente).subscribe({
        next: (nuevo) => {
          this.clientes.push(nuevo);
          this.cliente = nuevo;
          this.clienteCtrl.setValue(nuevo);
          this.cdr.markForCheck();
          this.notificar('Cliente creado');
        },
        error: (e) => this.notificar(e?.error?.message ?? 'Error al crear el cliente'),
      });
    });
  }

  puedeCobrar(): boolean {
    return this.carrito.length > 0 && this.pagoCtrl.value !== null && !this.enviando;
  }

  cobrar(): void {
    if (!this.puedeCobrar()) {
      return;
    }
    const request = this.construirRequest();
    if (this.pagoCtrl.value === 'CHEQUE') {
      const ref = this.dialog.open(ChequeDialogComponent, {
        width: '560px',
        data: {
          monto: this.total,
          titular: this.cliente ? this.mostrarCliente(this.cliente) : '',
        },
      });
      ref.afterClosed().subscribe((datos?: ChequeRequest) => {
        if (datos) {
          this.registrarVenta(request, datos);
        }
      });
      return;
    }
    this.registrarVenta(request);
  }

  private construirRequest(): VentaRequest {
    const request: VentaRequest = {
      clienteId: this.cliente?.id,
      metodoPago: this.pagoCtrl.value!,
      tipoVenta: this.tipoVentaCtrl.value ?? undefined,
      items: this.carrito.map((l) => ({
        productoId: l.producto.id!,
        cantidad: l.cantidad,
      })),
    };
    if (this.fechaCtrl.value) {
      const d = new Date(this.fechaCtrl.value);
      const ahora = new Date();
      d.setHours(ahora.getHours(), ahora.getMinutes());
      request.fecha = this.formatearFecha(d);
    }
    return request;
  }

  private registrarVenta(request: VentaRequest, chequeDatos?: ChequeRequest): void {
    this.enviando = true;
    this.ventaService.registrar(request).subscribe({
      next: (venta) => {
        if (chequeDatos) {
          this.chequeService
            .crear({ ...chequeDatos, ventaId: venta.id, clienteId: venta.cliente?.id })
            .subscribe({
              next: () => this.trasVenta(venta),
              error: () => {
                this.trasVenta(venta);
                this.notificar('Venta registrada, pero no se pudo guardar el cheque');
              },
            });
        } else {
          this.trasVenta(venta);
        }
      },
      error: (e) => {
        this.enviando = false;
        this.notificar(this.mensajeError(e));
      },
    });
  }

  private trasVenta(venta: Venta): void {
    this.enviando = false;
    this.reiniciar();
    this.verFactura(venta);
  }

  private reiniciar(): void {
    this.carrito = [];
    this.pagoCtrl.setValue(null);
    this.fechaCtrl.setValue(new Date());
    this.busquedaCtrl.setValue('');
    this.productoService.listar().subscribe((p) => {
      this.productos = p;
      this.cdr.markForCheck();
    });
  }

  verFactura(venta: Venta): void {
    this.dialog.open(FacturaDialogComponent, { width: '560px', data: venta });
  }

  private formatearFecha(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private mensajeError(err: unknown): string {
    const msg = (err as { error?: { message?: string } })?.error?.message;
    return msg ?? 'Error al registrar la venta';
  }

  private notificar(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 2500 });
  }
}
