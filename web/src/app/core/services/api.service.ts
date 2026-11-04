import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alerta, AuthResponse, CrearAlertaRequest, Establecimiento, Estadisticas } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'angelshot_token';
  private readonly USER_KEY = 'angelshot_user';

  constructor(private http: HttpClient) {}

  // Autenticación JWT
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res));
        }
      })
    );
  }

  registro(datos: { nombre: string; email: string; password: string; telefono?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/registro`, datos).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUsuarioActual(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // Alertas y Puntos de Riesgo
  getAlertas(filtros?: { tipo?: string; estado?: string; municipio?: string; soloActivos?: boolean; lat?: number; lng?: number }): Observable<Alerta[]> {
    let params = new HttpParams();
    if (filtros?.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros?.estado) params = params.set('estado', filtros.estado);
    if (filtros?.municipio && filtros.municipio !== 'TODOS') params = params.set('municipio', filtros.municipio);
    if (filtros?.soloActivos !== undefined) params = params.set('soloActivos', filtros.soloActivos.toString());
    if (filtros?.lat !== undefined) params = params.set('lat', filtros.lat.toString());
    if (filtros?.lng !== undefined) params = params.set('lng', filtros.lng.toString());

    return this.http.get<Alerta[]>(`${this.apiUrl}/alertas`, { params });
  }

  crearAlerta(request: CrearAlertaRequest): Observable<Alerta> {
    return this.http.post<Alerta>(`${this.apiUrl}/alertas`, request);
  }

  moderarAlerta(id: number, activo: boolean): Observable<Alerta> {
    return this.http.patch<Alerta>(`${this.apiUrl}/alertas/${id}/moderar`, null, {
      params: new HttpParams().set('activo', activo.toString())
    });
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

  // API Externa Gratuita: Geocodificación inversa con BigDataCloud
  geocodificarInversa(lat: number, lng: number): Observable<any> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`;
    return this.http.get<any>(url);
  }
}
