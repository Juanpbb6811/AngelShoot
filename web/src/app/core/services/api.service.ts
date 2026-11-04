import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alerta, AuthResponse, Establecimiento, Estadisticas } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  getAlertas(estado?: string): Observable<Alerta[]> {
    const url = estado ? `${this.apiUrl}/alertas?estado=${estado}` : `${this.apiUrl}/alertas`;
    return this.http.get<Alerta[]>(url);
  }

  actualizarEstado(id: number, nuevoEstado: string, comentario?: string): Observable<Alerta> {
    return this.http.patch<Alerta>(`${this.apiUrl}/alertas/${id}/estado`, { nuevoEstado, comentario });
  }

  getEstablecimientos(): Observable<Establecimiento[]> {
    return this.http.get<Establecimiento[]>(`${this.apiUrl}/establecimientos`);
  }

  getEstadisticas(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(`${this.apiUrl}/estadisticas`);
  }
}
