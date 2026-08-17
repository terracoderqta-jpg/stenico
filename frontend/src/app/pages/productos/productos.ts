import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProductoDialogComponent } from '../../dialogs/producto-dialog/producto-dialog';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto';

@Component({
  selector: 'app-productos',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    DecimalPipe,
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;
  error = false;
  busquedaCtrl = new FormControl('');
  columnas = ['codigo', 'nombre', 'marca', 'categoria', 'precio', 'revendedor', 'stock', 'acciones'];

  get totalResultados(): number {
    return this.productosFiltrados.length;
  }

  get hayBusqueda(): boolean {
    return !!(this.busquedaCtrl.value ?? '').trim();
  }

  get productosFiltrados(): Producto[] {
    const q = (this.busquedaCtrl.value ?? '').toLowerCase().trim();
    if (!q) {
      return this.productos;
    }
    return this.productos.filter(
      (p) =>
        (p.codigo ?? '').toLowerCase().includes(q) ||
        (p.nombre ?? '').toLowerCase().includes(q) ||
        (p.marca ?? '').toLowerCase().includes(q) ||
        (p.categoria ?? '').toLowerCase().includes(q) ||
        (p.subcategoria ?? '').toLowerCase().includes(q) ||
        (p.descripcion ?? '').toLowerCase().includes(q),
    );
  }

  constructor(
    private readonly productoService: ProductoService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.busquedaCtrl.valueChanges.subscribe(() => this.cdr.markForCheck());
    this.cargar();
  }

  private cargar(): void {
    this.loading = true;
    this.error = false;
    this.productoService.listar().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
        this.notificar('Error al cargar los productos');
      },
    });
  }

  reintentar(): void {
    this.cargar();
  }

  abrirNuevo(): void {
    const ref = this.dialog.open(ProductoDialogComponent, { width: '600px', data: null });
    ref.afterClosed().subscribe((producto: Producto | undefined) => {
      if (!producto) {
        return;
      }
      this.productoService.crear(producto).subscribe({
        next: () => {
          this.notificar('Producto creado');
          this.cargar();
        },
        error: (e) => this.notificar(this.mensajeError(e)),
      });
    });
  }

  abrirEditar(producto: Producto): void {
    const ref = this.dialog.open(ProductoDialogComponent, {
      width: '600px',
      data: { ...producto },
    });
    ref.afterClosed().subscribe((datos: Producto | undefined) => {
      if (!datos || !producto.id) {
        return;
      }
      this.productoService.actualizar(producto.id, datos).subscribe({
        next: () => {
          this.notificar('Producto actualizado');
          this.cargar();
        },
        error: (e) => this.notificar(this.mensajeError(e)),
      });
    });
  }

  eliminar(producto: Producto): void {
    if (!producto.id) {
      return;
    }
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
      return;
    }
    this.productoService.eliminar(producto.id).subscribe({
      next: () => {
        this.notificar('Producto eliminado');
        this.cargar();
      },
      error: (e) => this.notificar(this.mensajeError(e)),
    });
  }

  importarCsv(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const texto = String(reader.result ?? '').replace(/^\uFEFF/, '');
      const lineas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const productos: Producto[] = [];
      const vistos = new Set<string>();
      for (let i = 1; i < lineas.length; i++) {
        const c = lineas[i].split(';').map((s) => s.trim());
        if (!c[0]) {
          continue;
        }
        if (vistos.has(c[0])) {
          continue;
        }
        vistos.add(c[0]);
        const p: Producto = {
          codigo: c[0],
          nombre: c[1] ?? '',
          stock: 0,
          precio: this.parseInt(c[8]) ?? 0,
        };
        if (c[2]) {
          p.marca = c[2];
        }
        if (c[3]) {
          p.categoria = c[3];
        }
        if (c[4]) {
          p.subcategoria = c[4];
        }
        if (c[5]) {
          p.voltaje = this.parseInt(c[5]) ?? undefined;
        }
        if (c[6]) {
          p.largo = this.parseInt(c[6]) ?? undefined;
        }
        if (c[7]) {
          p.ancho = this.parseInt(c[7]) ?? undefined;
        }
        const rev = this.parseInt(c[9]);
        if (rev != null) {
          p.precioRevendedor = rev;
        }
        if (!p.nombre) {
          continue;
        }
        productos.push(p);
      }
      if (productos.length === 0) {
        this.notificar('El archivo no tiene productos');
        return;
      }
      this.productoService.importar(productos).subscribe({
        next: (res) => {
          this.notificar(`Importados ${res.creados} productos (${res.omitidos} omitidos)`);
          this.cargar();
        },
        error: (e) => this.notificar(this.mensajeError(e)),
      });
    };
    reader.readAsText(file);
  }

  private parseInt(valor: string | undefined): number | null {
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
  }

  private mensajeError(err: unknown): string {
    const msg = (err as { error?: { message?: string } })?.error?.message;
    return msg ?? 'Error en la operación';
  }

  private notificar(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
  }
}
