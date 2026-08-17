import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Cliente } from '../../models/cliente';

@Component({
  selector: 'app-cliente-dialog',
  imports: [MatDialogModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './cliente-dialog.html',
  styleUrl: './cliente-dialog.css',
})
export class ClienteDialogComponent implements OnInit {
  form = new FormGroup({
    nombre: new FormControl('', Validators.required),
    apellido: new FormControl(''),
    email: new FormControl('', Validators.email),
    telefono: new FormControl(''),
    direccion: new FormControl(''),
    cuit: new FormControl(''),
  });

  constructor(
    public readonly dialogRef: MatDialogRef<ClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cliente | null,
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
    this.dialogRef.close({ ...this.data, ...this.form.value } as Cliente);
  }
}
