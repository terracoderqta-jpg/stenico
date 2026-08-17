import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Cheque, ChequeRequest } from '../models/cheque';

@Injectable({ providedIn: 'root' })
export class ChequeService {
  private readonly apiUrl = `${environment.apiUrl}/api/cheques`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Cheque[]> {
    return this.http.get<Cheque[]>(this.apiUrl);
  }

  crear(request: ChequeRequest): Observable<Cheque> {
    return this.http.post<Cheque>(this.apiUrl, request);
  }

  actualizar(id: number, request: ChequeRequest): Observable<Cheque> {
    return this.http.put<Cheque>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
