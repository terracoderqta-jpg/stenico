import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly apiUrl = `${environment.apiUrl}/api/productos`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  importar(productos: Producto[]): Observable<{ creados: number; omitidos: number }> {
    return this.http.post<{ creados: number; omitidos: number }>(`${this.apiUrl}/importar`, productos);
  }

  ajustarPrecios(request: AjustePreciosRequest): Observable<{ actualizados: number }> {
    return this.http.post<{ actualizados: number }>(`${this.apiUrl}/ajustar-precios`, request);
  }
}

export interface AjustePreciosRequest {
  marca?: string;
  porcentajeNormal: number;
  porcentajeSobrePrecio?: number;
}
