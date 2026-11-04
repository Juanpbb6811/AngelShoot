import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
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

  // Autenticación JWT (RF01)
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

  // Reportes y Puntos de Riesgo (/api/reportes y /api/alertas dual support)
  getAlertas(filtros?: { tipo?: string; estado?: string; municipio?: string; soloActivos?: boolean; lat?: number; lng?: number }): Observable<Alerta[]> {
    let params = new HttpParams();
    if (filtros?.tipo && filtros.tipo !== 'TODOS') params = params.set('tipo', filtros.tipo);
    if (filtros?.estado) params = params.set('estado', filtros.estado);
    if (filtros?.municipio && filtros.municipio !== 'TODOS') params = params.set('municipio', filtros.municipio);
    if (filtros?.soloActivos !== undefined) params = params.set('soloActivos', filtros.soloActivos.toString());
    if (filtros?.lat !== undefined) params = params.set('lat', filtros.lat.toString());
    if (filtros?.lng !== undefined) params = params.set('lng', filtros.lng.toString());

    return this.http.get<Alerta[]>(`${this.apiUrl}/reportes`, { params }).pipe(
      catchError(() => this.http.get<Alerta[]>(`${this.apiUrl}/alertas`, { params }))
    );
  }

  crearAlerta(request: CrearAlertaRequest): Observable<Alerta> {
    return this.http.post<Alerta>(`${this.apiUrl}/reportes`, request).pipe(
      catchError(() => this.http.post<Alerta>(`${this.apiUrl}/alertas`, request))
    );
  }

  validarAlerta(id: number, coincide: boolean): Observable<Alerta> {
    const params = new HttpParams().set('coincide', coincide.toString());
    return this.http.post<Alerta>(`${this.apiUrl}/reportes/${id}/validar`, null, { params }).pipe(
      catchError(() => this.http.post<Alerta>(`${this.apiUrl}/alertas/${id}/validar`, null, { params }))
    );
  }

  moderarAlerta(id: number, activo: boolean): Observable<Alerta> {
    return this.http.patch<Alerta>(`${this.apiUrl}/reportes/${id}/moderar`, null, {
      params: new HttpParams().set('activo', activo.toString())
    });
  }

  actualizarEstado(id: number, nuevoEstado: string, comentario?: string): Observable<Alerta> {
    return this.http.patch<Alerta>(`${this.apiUrl}/reportes/${id}/estado`, { nuevoEstado, comentario });
  }

  getEstablecimientos(): Observable<Establecimiento[]> {
    return this.http.get<Establecimiento[]>(`${this.apiUrl}/establecimientos`);
  }

  getEstadisticas(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(`${this.apiUrl}/estadisticas`);
  }

  // APIs Externas Gratuitas de Geocodificación y Mapas (PDF Requerimientos)
  // 1. BigDataCloud Reverse Geocoding Client API (gratuita, sin API key)
  geocodificarInversa(lat: number, lng: number): Observable<any> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`;
    return this.http.get<any>(url);
  }

  // 2. OpenStreetMap Nominatim Search API (búsqueda de direcciones y lugares en Colombia)
  buscarDireccion(query: string): Observable<any[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&limit=5`;
    return this.http.get<any[]>(url);
  }

  // 3. IP Geolocation Fallback si el usuario no tiene GPS o lo rechaza
  obtenerUbicacionIP(): Observable<any> {
    return this.http.get<any>('https://ipapi.co/json/').pipe(
      catchError(() => of({ latitude: 4.8631, longitude: -74.0583, city: 'Chía' }))
    );
  }
}
