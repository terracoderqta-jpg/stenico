import { Cliente } from './cliente';
import { Producto } from './producto';

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE';

export type TipoVenta = 'MINORISTA' | 'REVENDEDOR';

export interface VentaDetalle {
  id?: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id?: number;
  cliente?: Cliente;
  fecha: string;
  metodoPago: MetodoPago;
  tipoVenta?: TipoVenta;
  nroFactura?: string;
  total: number;
  detalles: VentaDetalle[];
}

export interface VentaRequestItem {
  productoId: number;
  cantidad: number;
}

export interface VentaRequest {
  clienteId?: number;
  fecha?: string;
  metodoPago: MetodoPago;
  tipoVenta?: TipoVenta;
  items: VentaRequestItem[];
}
