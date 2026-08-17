import { Venta } from './venta';
import { Cliente } from './cliente';

export type EstadoCheque = 'PENDIENTE' | 'COBRADO' | 'RECHAZADO' | 'CANCELADO';

export interface Cheque {
  id?: number;
  banco: string;
  numero: string;
  titular?: string;
  numeroCuenta?: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  monto: number;
  estado: EstadoCheque;
  venta?: Venta;
  cliente?: Cliente;
}

export interface ChequeRequest {
  banco: string;
  numero: string;
  titular?: string;
  numeroCuenta?: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  monto: number;
  ventaId?: number;
  clienteId?: number;
  estado?: EstadoCheque;
}
