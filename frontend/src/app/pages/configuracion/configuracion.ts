import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto';

@Component({
  selector: 'app-configuracion',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatTableModule,
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class ConfiguracionComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;
  error = false;

  alcance: 'total' | 'marca' = 'total';
  marca: string | null = null;
  porcentajeNormal = 0;
  porcentajeSobrePrecio = 0;
  aplicando = false;

  columnasPreview = ['codigo', 'nombre', 'marca', 'precio', 'nuevoPrecio', 'revendedor', 'nuevoRevendedor'];

  constructor(
    private readonly productoService: ProductoService,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  get marcas(): string[] {
    return [...new Set(this.productos.map((p) => p.marca).filter((m): m is string => !!m))].sort();
  }

  get afectados(): number {
    if (this.alcance === 'marca') {
      return this.productos.filter((p) => p.marca === this.marca).length;
    }
    return this.productos.length;
  }

  get hayMarcaElegida(): boolean {
    return this.alcance === 'total' || !!this.marca;
  }

  get preview(): Producto[] {
    const enAlcance =
      this.alcance === 'marca'
        ? this.productos.filter((p) => p.marca === this.marca)
        : this.productos;
    return enAlcance
      .filter((p) => (p.precio ?? 0) > 0 || p.precioRevendedor != null)
      .sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? ''));
  }

  nuevoPrecio(p: Producto): number {
    return this.aplicarPct(p.precio ?? 0, Number(this.porcentajeNormal) || 0);
  }

  nuevoRevendedor(p: Producto): number {
    const sobre = Number(this.porcentajeSobrePrecio) || 0;
    if (sobre <= 0) {
      return 0;
    }
    return Math.round(this.nuevoPrecio(p) * (sobre / 100) * 100) / 100;
  }

  tieneRevendedor(p: Producto): boolean {
    return p.precioRevendedor != null && p.precioRevendedor > 0;
  }

  private aplicarPct(valor: number, pct: number): number {
    return Math.round(valor * (1 + pct / 100) * 100) / 100;
  }

  cargar(): void {
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

  aplicar(): void {
    const normal = Number(this.porcentajeNormal) || 0;
    const sobre = Number(this.porcentajeSobrePrecio) || 0;
    if (normal === 0 && sobre <= 0) {
      this.notificar('Ingresá un porcentaje para ajustar');
      return;
    }
    if (!this.hayMarcaElegida) {
      this.notificar('Elegí una marca para filtrar');
      return;
    }
    if (this.afectados === 0) {
      this.notificar('No hay productos en el alcance elegido');
      return;
    }
    const detalle =
      `Normal: ${normal > 0 ? '+' : ''}${normal}%` +
      (sobre > 0 ? ` | Revendedor: ${sobre}% del precio` : '');
    if (!confirm(`¿Aplicar este ajuste?\n${detalle}\nProductos afectados: ${this.afectados}`)) {
      return;
    }
    this.aplicando = true;
    this.productoService
      .ajustarPrecios({
        marca: this.alcance === 'marca' ? (this.marca ?? undefined) : undefined,
        porcentajeNormal: normal,
        porcentajeSobrePrecio: sobre > 0 ? sobre : undefined,
      })
      .subscribe({
        next: (res) => {
          this.aplicando = false;
          this.cdr.markForCheck();
          this.notificar(`Precios ajustados en ${res.actualizados} producto(s)`);
          this.cargar();
        },
        error: (e) => {
          this.aplicando = false;
          this.cdr.markForCheck();
          this.notificar(this.mensajeError(e));
        },
      });
  }

  private mensajeError(err: unknown): string {
    const msg = (err as { error?: { message?: string } })?.error?.message;
    return msg ?? 'Error al ajustar los precios';
  }

  private notificar(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3500 });
  }
}
