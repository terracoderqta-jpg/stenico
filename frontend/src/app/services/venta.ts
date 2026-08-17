import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Venta, VentaRequest } from '../models/venta';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly apiUrl = `${environment.apiUrl}/api/ventas`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  registrar(request: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, request);
  }
}
