import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RevendedorService {
  private readonly apiUrl = `${environment.apiUrl}/api/revendedores`;

  constructor(private readonly http: HttpClient) {}

  generarPdf(request: ListaPreciosRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/pdf`, request, { responseType: 'blob' });
  }
}

export interface ListaPreciosRequest {
  nombre?: string;
  porcentaje: number;
  marca?: string;
}
