import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Producto } from '../../models/producto';

@Component({
  selector: 'app-producto-dialog',
  imports: [MatDialogModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './producto-dialog.html',
  styleUrl: './producto-dialog.css',
})
export class ProductoDialogComponent implements OnInit {
  form = new FormGroup({
    codigo: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    marca: new FormControl(''),
    descripcion: new FormControl(''),
    categoria: new FormControl(''),
    subcategoria: new FormControl(''),
    voltaje: new FormControl<number | null>(null),
    largo: new FormControl<number | null>(null),
    ancho: new FormControl<number | null>(null),
    precio: new FormControl(0, [Validators.required, Validators.min(0)]),
    precioRevendedor: new FormControl<number | null>(null),
    stock: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  constructor(
    public readonly dialogRef: MatDialogRef<ProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Producto | null,
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ ...this.data, ...this.form.value } as Producto);
  }
}
