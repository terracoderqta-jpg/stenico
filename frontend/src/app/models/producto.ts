export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  marca?: string;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
  voltaje?: number;
  largo?: number;
  ancho?: number;
  precio: number;
  precioRevendedor?: number;
  stock: number;
}
