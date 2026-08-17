import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Presupuesto, PresupuestoRequest } from '../models/presupuesto';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {
  private readonly apiUrl = `${environment.apiUrl}/api/presupuestos`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Presupuesto[]> {
    return this.http.get<Presupuesto[]>(this.apiUrl);
  }

  obtener(id: number): Observable<Presupuesto> {
    return this.http.get<Presupuesto>(`${this.apiUrl}/${id}`);
  }

  crear(request: PresupuestoRequest): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(this.apiUrl, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  presupuestoPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
