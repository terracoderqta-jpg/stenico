import { Cliente } from './cliente';
import { Producto } from './producto';
import { TipoVenta } from './venta';

export interface PresupuestoDetalle {
  id?: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Presupuesto {
  id?: number;
  cliente?: Cliente;
  fecha: string;
  tipoVenta?: TipoVenta;
  nroPresupuesto?: string;
  observaciones?: string;
  diasVigencia?: number;
  total: number;
  detalles: PresupuestoDetalle[];
  nombreCliente?: string;
  cuitCliente?: string;
  telefonoCliente?: string;
  direccionCliente?: string;
  emailCliente?: string;
}

export interface PresupuestoRequestItem {
  productoId: number;
  cantidad: number;
  precioUnitario?: number;
}

export interface PresupuestoRequest {
  clienteId?: number;
  fecha?: string;
  tipoVenta?: TipoVenta;
  observaciones?: string;
  diasVigencia?: number;
  clienteNombre?: string;
  clienteCuit?: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  clienteEmail?: string;
  items: PresupuestoRequestItem[];
}
