import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Cheque, ChequeRequest, EstadoCheque } from '../../models/cheque';

export interface ChequeDialogData {
  cheque?: Cheque;
  monto?: number;
  titular?: string;
}

@Component({
  selector: 'app-cheque-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './cheque-dialog.html',
  styleUrl: './cheque-dialog.css',
})
export class ChequeDialogComponent implements OnInit {
  readonly estados: { valor: EstadoCheque; nombre: string }[] = [
    { valor: 'PENDIENTE', nombre: 'Pendiente' },
    { valor: 'COBRADO', nombre: 'Cobrado' },
    { valor: 'RECHAZADO', nombre: 'Rechazado' },
    { valor: 'CANCELADO', nombre: 'Cancelado' },
  ];

  form = new FormGroup({
    banco: new FormControl('', Validators.required),
    numero: new FormControl('', Validators.required),
    titular: new FormControl(''),
    numeroCuenta: new FormControl(''),
    fechaEmision: new FormControl<Date>(new Date()),
    fechaVencimiento: new FormControl<Date | null>(null),
    monto: new FormControl<number | null>(null, Validators.required),
    estado: new FormControl<EstadoCheque>('PENDIENTE'),
  });

  constructor(
    public readonly dialogRef: MatDialogRef<ChequeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChequeDialogData,
  ) {}

  get editando(): boolean {
    return !!this.data?.cheque;
  }

  ngOnInit(): void {
    const c = this.data?.cheque;
    if (c) {
      this.form.patchValue({
        banco: c.banco,
        numero: c.numero,
        titular: c.titular ?? '',
        numeroCuenta: c.numeroCuenta ?? '',
        fechaEmision: c.fechaEmision ? new Date(c.fechaEmision) : null,
        fechaVencimiento: c.fechaVencimiento ? new Date(c.fechaVencimiento) : null,
        monto: c.monto,
        estado: c.estado,
      });
    } else {
      if (this.data?.monto) {
        this.form.controls.monto.setValue(this.data.monto);
      }
      if (this.data?.titular) {
        this.form.controls.titular.setValue(this.data.titular);
      }
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const request: ChequeRequest = {
      banco: v.banco!,
      numero: v.numero!,
      titular: v.titular ?? undefined,
      numeroCuenta: v.numeroCuenta ?? undefined,
      fechaEmision: this.iso(v.fechaEmision),
      fechaVencimiento: this.iso(v.fechaVencimiento),
      monto: v.monto!,
      estado: v.estado!,
    };
    this.dialogRef.close(request);
  }

  private iso(d: Date | null | undefined): string | undefined {
    if (!d) {
      return undefined;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
