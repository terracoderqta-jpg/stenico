import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto';
import { RevendedorService } from '../../services/revendedor';

@Component({
  selector: 'app-revendedores',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './revendedores.html',
  styleUrl: './revendedores.css',
})
export class RevendedoresComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;
  error = false;

  nombre = '';
  marca: string | null = null;
  porcentaje = 0;
  generando = false;

  columnas = ['codigo', 'nombre', 'marca', 'precio', 'precioFinal'];

  constructor(
    private readonly productoService: ProductoService,
    private readonly revendedorService: RevendedorService,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  get marcas(): string[] {
    return [...new Set(this.productos.map((p) => p.marca).filter((m): m is string => !!m))].sort();
  }

  get lista(): Producto[] {
    const enAlcance = this.marca
      ? this.productos.filter((p) => p.marca === this.marca)
      : this.productos;
    return enAlcance
      .filter((p) => (p.precio ?? 0) > 0)
      .sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? ''));
  }

  precioFinal(p: Producto): number {
    const extra = Number(this.porcentaje) || 0;
    return Math.round((p.precio ?? 0) * (1 + extra / 100) * 100) / 100;
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

  generar(): void {
    if (!this.nombre.trim()) {
      this.notificar('Ingresá el nombre del revendedor');
      return;
    }
    if (this.lista.length === 0) {
      this.notificar('No hay productos con precio en el alcance elegido');
      return;
    }
    const extra = Number(this.porcentaje) || 0;
    this.generando = true;
    this.revendedorService
      .generarPdf({
        nombre: this.nombre.trim(),
        porcentaje: extra,
        marca: this.marca ?? undefined,
      })
      .subscribe({
        next: (blob) => {
          this.generando = false;
          this.cdr.markForCheck();
          this.descargar(blob);
          this.notificar('PDF generado');
        },
        error: () => {
          this.generando = false;
          this.cdr.markForCheck();
          this.notificar('Error al generar el PDF');
        },
      });
  }

  private descargar(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const nombreLimpio = this.nombre.trim().replace(/[^a-zA-Z0-9_áéíóúñÁÉÍÓÚÑ-]/g, '_');
    a.href = url;
    a.download = `lista_de_precios_${nombreLimpio}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private notificar(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3500 });
  }
}
