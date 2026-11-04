import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Alerta, Estadisticas, TipoAlerta, NivelUrgencia, CrearAlertaRequest } from '../../core/models/models';

declare const L: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <!-- Encabezado Principal -->
      <header class="header">
        <div class="header-branding">
          <div class="logo-badge">🛡️</div>
          <div>
            <h1 class="title">Angel Shot &bull; Ruta Segura</h1>
            <p class="subtitle">Visibilización colaborativa de puntos de riesgo nocturno para mujeres (Chía &bull; Zipaquirá &bull; Cajicá)</p>
          </div>
        </div>

        <div class="header-actions">
          <div *ngIf="usuarioActual; else loginPrompt" class="user-badge">
            <span class="user-avatar">👤</span>
            <div class="user-info">
              <strong>{{ usuarioActual.nombre }}</strong>
              <small>{{ usuarioActual.email }}</small>
            </div>
            <button (click)="cerrarSesion()" class="btn-secondary btn-sm">Salir</button>
          </div>
          <ng-template #loginPrompt>
            <button (click)="mostrarModalAuth = true" class="btn-primary">
              🔑 Iniciar Sesión (JWT)
            </button>
          </ng-template>
        </div>
      </header>

      <!-- Banner de Alcance y Delimitación -->
      <div class="scope-banner">
        <span class="scope-icon">ℹ️</span>
        <div>
          <strong>Alcance del Reto (Problema 6):</strong> Plataforma ciudadana orientada a visibilizar y prevenir riesgos en el espacio público nocturno (acoso, luminarias apagadas, zonas desoladas). <em>No realiza rastreo GPS continuo en segundo plano ni botón de pánico policial directo.</em>
        </div>
      </div>

      <!-- Métricas del Sistema -->
      <section class="stats-grid">
        <div class="stat-card border-blue">
          <span class="stat-label">Total de Reportes</span>
          <span class="stat-value">{{ stats?.totalAlertas ?? alertas.length }}</span>
        </div>
        <div class="stat-card border-purple">
          <span class="stat-label">Chía</span>
          <span class="stat-value">{{ contarPorMunicipio('Chía') }}</span>
        </div>
        <div class="stat-card border-amber">
          <span class="stat-label">Zipaquirá</span>
          <span class="stat-value">{{ contarPorMunicipio('Zipaquirá') }}</span>
        </div>
        <div class="stat-card border-emerald">
          <span class="stat-label">Cajicá</span>
          <span class="stat-value">{{ contarPorMunicipio('Cajicá') }}</span>
        </div>
      </section>

      <!-- Layout Principal: Formulario de Reporte y Mapa -->
      <div class="main-grid">
        <!-- Columna Izquierda: Formulario de Reporte (RF01, RF02, RF09) -->
        <section class="card form-card">
          <div class="card-header">
            <h2>⚠️ Reportar Punto de Riesgo</h2>
            <span class="badge badge-jwt">Protegido por JWT</span>
          </div>

          <div *ngIf="!usuarioActual" class="auth-required-notice">
            <p>🔒 <strong>Acceso restringido:</strong> Debes autenticarte con tu cuenta para registrar reportes de riesgo en el sistema.</p>
            <button (click)="mostrarModalAuth = true" class="btn-outline-primary" style="margin-top: 0.5rem; width: 100%;">
              Iniciar Sesión para Reportar
            </button>
          </div>

          <form *ngIf="usuarioActual" (ngSubmit)="enviarReporte()" #reporteForm="ngForm" class="reporte-form">
            <!-- Mensaje de éxito / error -->
            <div *ngIf="mensajeExito" class="alert alert-success">{{ mensajeExito }}</div>
            <div *ngIf="mensajeError" class="alert alert-danger">{{ mensajeError }}</div>

            <!-- Selección de Municipio -->
            <div class="form-group">
              <label for="municipio">Municipio en Cundinamarca <span class="req">*</span></label>
              <select id="municipio" [(ngModel)]="nuevoReporte.municipio" name="municipio" required (change)="alCambiarMunicipio()" class="form-control">
                <option value="Chía">Chía (Cundinamarca)</option>
                <option value="Zipaquirá">Zipaquirá (Cundinamarca)</option>
                <option value="Cajicá">Cajicá (Cundinamarca)</option>
              </select>
            </div>

            <!-- Punto de Referencia Específico -->
            <div class="form-group">
              <label for="referencia">Punto de Referencia Específico <span class="req">*</span></label>
              <input
                id="referencia"
                type="text"
                [(ngModel)]="nuevoReporte.ubicacionDetalle"
                name="ubicacionDetalle"
                placeholder="Ej. Callejón peatonal U. Sabana / Frente al paradero variante"
                required
                class="form-control"
              />
              <small class="hint">Indica esquinas, parques, puentes o negocios conocidos.</small>
            </div>

            <!-- Categoría de Riesgo -->
            <div class="form-group">
              <label for="categoria">Categoría de Riesgo <span class="req">*</span></label>
              <select id="categoria" [(ngModel)]="nuevoReporte.tipoAlerta" name="tipoAlerta" required class="form-control">
                <option value="ACOSO_O_INTIMIDACION">🚨 Acoso callejero / Intimidación verbal o física</option>
                <option value="ILUMINACION_DEFICIENTE">💡 Iluminación deficiente / Vía a oscuras</option>
                <option value="ZONA_DESOLADA">🏚️ Zona desolada / Sin vigilancia comercial ni pública</option>
                <option value="ANGEL_SHOT_SOLO">🍸 Protocolo Angel Shot (Establecimiento / Bar)</option>
                <option value="EMERGENCIA_MEDICA">🚑 Emergencia médica en vía pública</option>
              </select>
            </div>

            <!-- Nivel de Urgencia -->
            <div class="form-group">
              <label for="urgencia">Nivel de Percepción del Riesgo</label>
              <select id="urgencia" [(ngModel)]="nuevoReporte.nivelUrgencia" name="nivelUrgencia" class="form-control">
                <option value="BAJA">Baja (Precaución preventiva)</option>
                <option value="MEDIA">Media (Evitar transitar sola)</option>
                <option value="ALTA">Alta (Zona de peligro recurrente)</option>
                <option value="CRITICA">Crítica (Incidente reciente / Muy peligroso)</option>
              </select>
            </div>

            <!-- Geocodificación y Coordenadas -->
            <div class="form-group">
              <label>Coordenadas (Latitud, Longitud)</label>
              <div class="coord-inputs">
                <input type="number" step="any" [(ngModel)]="nuevoReporte.latitud" name="latitud" placeholder="Latitud" class="form-control" />
                <input type="number" step="any" [(ngModel)]="nuevoReporte.longitud" name="longitud" placeholder="Longitud" class="form-control" />
              </div>
              <div class="geo-actions">
                <button type="button" (click)="obtenerUbicacionActual()" class="btn-geo" [disabled]="cargandoGeo">
                  <span>📍</span> {{ cargandoGeo ? 'Consultando API BigDataCloud...' : 'Capturar mi GPS & Geocodificar' }}
                </button>
                <small class="geo-tip">O haz clic directo en el mapa para fijar el pin.</small>
              </div>
            </div>

            <!-- Descripción Detallada -->
            <div class="form-group">
              <label for="descripcion">Descripción adicional (Opcional)</label>
              <textarea
                id="descripcion"
                [(ngModel)]="nuevoReporte.descripcion"
                name="descripcion"
                rows="2"
                placeholder="Ej. A partir de las 8pm se apagan las luces y no hay paso de transporte frecuente."
                class="form-control"
              ></textarea>
            </div>

            <button type="submit" [disabled]="enviando || !reporteForm.form.valid" class="btn-submit">
              {{ enviando ? 'Registrando punto...' : '🚨 Publicar Reporte Comunitario' }}
            </button>
          </form>
        </section>

        <!-- Columna Derecha: Mapa Interactivo Leaflet (RF04, RF05, RF06) -->
        <section class="card map-card">
          <div class="card-header">
            <div>
              <h2>🗺️ Mapa Comunitario de Rutas y Riesgos</h2>
              <small style="color: #94a3b8;">OpenStreetMap + Leaflet &bull; Haz clic para capturar coordenadas</small>
            </div>
            <button (click)="centrarEnSabana()" class="btn-secondary btn-sm">Sabana Centro</button>
          </div>

          <div id="mapa-angel-shot" class="leaflet-container-custom"></div>

          <!-- Leyenda del Mapa -->
          <div class="map-legend">
            <span class="legend-item"><span class="dot dot-acoso"></span> Acoso / Intimidación</span>
            <span class="legend-item"><span class="dot dot-luz"></span> Iluminación Deficiente</span>
            <span class="legend-item"><span class="dot dot-desolada"></span> Zona Desolada</span>
            <span class="legend-item"><span class="dot dot-angel"></span> Protocolo Angel Shot</span>
          </div>
        </section>
      </div>

      <!-- Barra de Filtros y Búsqueda (RF03, RF07) -->
      <section class="card filter-card">
        <div class="filters-header">
          <h3>🔍 Explorador de Puntos de Riesgo</h3>
          <span class="counter-badge">{{ alertasFiltradas.length }} puntos visibles</span>
        </div>

        <div class="filters-controls">
          <!-- Filtro por Municipio -->
          <div class="filter-group">
            <label>Municipio:</label>
            <div class="pill-group">
              <button
                type="button"
                [class.active]="filtroMunicipio === 'TODOS'"
                (click)="cambiarFiltroMunicipio('TODOS')"
                class="pill-btn"
              >
                Todos
              </button>
              <button
                type="button"
                [class.active]="filtroMunicipio === 'Chía'"
                (click)="cambiarFiltroMunicipio('Chía')"
                class="pill-btn"
              >
                Chía
              </button>
              <button
                type="button"
                [class.active]="filtroMunicipio === 'Zipaquirá'"
                (click)="cambiarFiltroMunicipio('Zipaquirá')"
                class="pill-btn"
              >
                Zipaquirá
              </button>
              <button
                type="button"
                [class.active]="filtroMunicipio === 'Cajicá'"
                (click)="cambiarFiltroMunicipio('Cajicá')"
                class="pill-btn"
              >
                Cajicá
              </button>
            </div>
          </div>

          <!-- Filtro por Tipo de Riesgo -->
          <div class="filter-group">
            <label>Tipo de Riesgo:</label>
            <select [(ngModel)]="filtroTipo" (change)="aplicarFiltrosLocales()" class="form-control select-inline">
              <option value="TODOS">Todos los tipos de riesgo</option>
              <option value="ACOSO_O_INTIMIDACION">🚨 Acoso o Intimidación</option>
              <option value="ILUMINACION_DEFICIENTE">💡 Iluminación Deficiente</option>
              <option value="ZONA_DESOLADA">🏚️ Zonas Desoladas</option>
              <option value="ANGEL_SHOT_SOLO">🍸 Protocolo Angel Shot</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Listado Estructurado de Reportes (RF03, RF04) -->
      <section class="card list-card">
        <div class="card-header">
          <h3>📋 Listado de Puntos Reportados</h3>
          <small style="color: #94a3b8;">Ordenados por fecha y municipio de referencia</small>
        </div>

        <div class="table-responsive">
          <table class="report-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Municipio</th>
                <th>Punto de Referencia</th>
                <th>Descripción / Horario</th>
                <th>Fecha Reporte</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let alerta of alertasFiltradas">
                <td>
                  <span class="badge" [ngClass]="obtenerClaseTipo(alerta.tipoAlerta)">
                    {{ formatearTipo(alerta.tipoAlerta) }}
                  </span>
                </td>
                <td>
                  <span class="municipio-pill">{{ alerta.municipio || 'Chía' }}</span>
                </td>
                <td>
                  <strong>{{ alerta.ubicacionDetalle }}</strong>
                </td>
                <td class="col-desc">
                  {{ alerta.descripcion || 'Sin descripción adicional' }}
                </td>
                <td class="col-date">
                  {{ formatearFecha(alerta.createdAt) }}
                </td>
                <td>
                  <button (click)="centrarEnPunto(alerta)" class="btn-locate" title="Ubicar en el mapa">
                    🎯 Ver Mapa
                  </button>
                </td>
              </tr>
              <tr *ngIf="alertasFiltradas.length === 0">
                <td colspan="6" class="empty-state">
                  No hay reportes de riesgo que coincidan con los filtros seleccionados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Modal de Autenticación Rápida JWT -->
      <div *ngIf="mostrarModalAuth" class="modal-backdrop">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ modoRegistro ? 'Crear Cuenta Segura' : 'Ingresar a Angel Shot (JWT)' }}</h3>
            <button (click)="mostrarModalAuth = false" class="modal-close">&times;</button>
          </div>

          <div class="modal-body">
            <div *ngIf="authError" class="alert alert-danger">{{ authError }}</div>

            <!-- Formulario Login -->
            <form *ngIf="!modoRegistro" (ngSubmit)="iniciarSesion()">
              <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" [(ngModel)]="authEmail" name="authEmail" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Contraseña</label>
                <input type="password" [(ngModel)]="authPassword" name="authPassword" required class="form-control" />
              </div>
              <button type="submit" [disabled]="autenticando" class="btn-submit" style="margin-top: 1rem;">
                {{ autenticando ? 'Verificando JWT...' : 'Entrar' }}
              </button>
            </form>

            <!-- Formulario Registro -->
            <form *ngIf="modoRegistro" (ngSubmit)="registrarse()">
              <div class="form-group">
                <label>Nombre Completo</label>
                <input type="text" [(ngModel)]="regNombre" name="regNombre" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" [(ngModel)]="regEmail" name="regEmail" required class="form-control" />
              </div>
              <div class="form-group">
                <label>Teléfono (opcional)</label>
                <input type="text" [(ngModel)]="regTelefono" name="regTelefono" class="form-control" />
              </div>
              <div class="form-group">
                <label>Contraseña (mínimo 6 caracteres)</label>
                <input type="password" [(ngModel)]="regPassword" name="regPassword" required class="form-control" />
              </div>
              <button type="submit" [disabled]="autenticando" class="btn-submit" style="margin-top: 1rem;">
                {{ autenticando ? 'Creando cuenta...' : 'Crear Cuenta y Conectar' }}
              </button>
            </form>

            <div class="modal-footer-switch">
              <button type="button" (click)="modoRegistro = !modoRegistro" class="btn-link">
                {{ modoRegistro ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Aún no tienes cuenta? Regístrate aquí' }}
              </button>
            </div>

            <!-- Credenciales de demostración -->
            <div class="demo-credentials">
              <small><strong>Credenciales de prueba:</strong> admin&#64;angelshot.app | AngelShotAdmin2026*</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #0f172a;
      min-height: 100vh;
    }

    .app-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #334155;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-badge {
      font-size: 2.5rem;
      background: #312e81;
      padding: 0.5rem 0.75rem;
      border-radius: 1rem;
      border: 1px solid #6366f1;
    }

    .title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #c084fc;
      margin: 0;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 0.9rem;
      margin: 0.25rem 0 0 0;
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #1e293b;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #334155;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      font-size: 0.8rem;
    }

    .scope-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #1e1b4b;
      border-left: 4px solid #818cf8;
      padding: 0.85rem 1.25rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      color: #e0e7ff;
      margin-bottom: 1.5rem;
    }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: #1e293b;
      padding: 1.25rem;
      border-radius: 0.75rem;
      display: flex;
      flex-direction: column;
      border: 1px solid #334155;
    }

    .border-blue { border-left: 4px solid #3b82f6; }
    .border-purple { border-left: 4px solid #a855f7; }
    .border-amber { border-left: 4px solid #f59e0b; }
    .border-emerald { border-left: 4px solid #10b981; }

    .stat-label {
      font-size: 0.8rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #f8fafc;
      margin-top: 0.25rem;
    }

    /* Main Grid */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 960px) {
      .main-grid {
        grid-template-columns: 420px 1fr;
      }
    }

    .card {
      background: #1e293b;
      border-radius: 0.75rem;
      padding: 1.5rem;
      border: 1px solid #334155;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .card-header h2, .card-header h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0;
    }

    /* Map */
    .leaflet-container-custom {
      height: 480px;
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid #475569;
      background: #0f172a;
      z-index: 10;
    }

    .map-legend {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot-acoso { background: #ef4444; }
    .dot-luz { background: #f59e0b; }
    .dot-desolada { background: #8b5cf6; }
    .dot-angel { background: #06b6d4; }

    /* Form */
    .form-group {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .req { color: #f87171; }

    .form-control {
      background: #0f172a;
      border: 1px solid #475569;
      border-radius: 0.5rem;
      padding: 0.6rem 0.75rem;
      color: #f8fafc;
      font-size: 0.9rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #a855f7;
    }

    .hint {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .coord-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .geo-actions {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: 0.35rem;
    }

    .btn-geo {
      background: #334155;
      color: #e2e8f0;
      border: 1px solid #475569;
      padding: 0.4rem 0.6rem;
      border-radius: 0.4rem;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-geo:hover:not(:disabled) {
      background: #475569;
    }

    .geo-tip {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    .btn-submit {
      width: 100%;
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      color: white;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: none;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.95rem;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
      transition: opacity 0.2s;
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Buttons */
    .btn-primary {
      background: #7c3aed;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: none;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-secondary {
      background: #334155;
      color: #f1f5f9;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      border: none;
      cursor: pointer;
    }

    .btn-sm {
      font-size: 0.8rem;
      padding: 0.3rem 0.6rem;
    }

    .btn-outline-primary {
      background: transparent;
      border: 1px solid #a855f7;
      color: #c084fc;
      padding: 0.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 600;
    }

    /* Filters */
    .filter-card {
      margin-bottom: 1.5rem;
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .counter-badge {
      background: #312e81;
      color: #c7d2fe;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .filters-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      align-items: center;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .filter-group label {
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .pill-group {
      display: flex;
      gap: 0.35rem;
    }

    .pill-btn {
      background: #0f172a;
      border: 1px solid #334155;
      color: #94a3b8;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .pill-btn.active {
      background: #7c3aed;
      color: white;
      border-color: #a855f7;
      font-weight: 600;
    }

    .select-inline {
      min-width: 220px;
    }

    /* Table */
    .table-responsive {
      overflow-x: auto;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .report-table th {
      background: #0f172a;
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #334155;
    }

    .report-table td {
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      border-bottom: 1px solid #334155;
      vertical-align: middle;
    }

    .col-desc {
      max-width: 280px;
      color: #cbd5e1;
    }

    .col-date {
      white-space: nowrap;
      color: #94a3b8;
      font-size: 0.8rem;
    }

    .municipio-pill {
      background: #1e1b4b;
      color: #c7d2fe;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .btn-locate {
      background: #0284c7;
      color: white;
      border: none;
      padding: 0.35rem 0.65rem;
      border-radius: 0.35rem;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .btn-locate:hover {
      background: #0369a1;
    }

    .empty-state {
      text-align: center;
      padding: 2.5rem;
      color: #64748b;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .badge-jwt {
      background: #065f46;
      color: #a7f3d0;
    }

    .badge-acoso {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .badge-luz {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }

    .badge-desolada {
      background: rgba(139, 92, 246, 0.2);
      color: #c084fc;
      border: 1px solid rgba(139, 92, 246, 0.4);
    }

    .badge-angel {
      background: rgba(6, 182, 212, 0.2);
      color: #38bdf8;
      border: 1px solid rgba(6, 182, 212, 0.4);
    }

    .badge-otro {
      background: #334155;
      color: #cbd5e1;
    }

    /* Alerts */
    .alert {
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }

    .alert-success {
      background: #064e3b;
      color: #a7f3d0;
      border: 1px solid #059669;
    }

    .alert-danger {
      background: #450a0a;
      color: #fecaca;
      border: 1px solid #dc2626;
    }

    .auth-required-notice {
      background: #1e1b4b;
      border: 1px solid #4338ca;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-box {
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 0.75rem;
      width: 100%;
      max-width: 420px;
      padding: 1.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.15rem;
      color: #f8fafc;
    }

    .modal-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .modal-footer-switch {
      margin-top: 1rem;
      text-align: center;
    }

    .btn-link {
      background: none;
      border: none;
      color: #a855f7;
      text-decoration: underline;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .demo-credentials {
      margin-top: 1rem;
      padding: 0.5rem;
      background: #0f172a;
      border-radius: 0.35rem;
      color: #94a3b8;
      text-align: center;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // Datos
  alertas: Alerta[] = [];
  alertasFiltradas: Alerta[] = [];
  stats?: Estadisticas;
  usuarioActual: any = null;

  // Filtros
  filtroMunicipio: string = 'TODOS';
  filtroTipo: string = 'TODOS';

  // Formulario nuevo reporte
  nuevoReporte: CrearAlertaRequest = {
    municipio: 'Chía',
    departamento: 'Cundinamarca',
    tipoAlerta: 'ILUMINACION_DEFICIENTE',
    nivelUrgencia: 'MEDIA',
    ubicacionDetalle: '',
    latitud: 4.8614,
    longitud: -74.0336,
    descripcion: ''
  };

  // Coordenadas centro de municipios
  private coordsMunicipios: Record<string, { lat: number; lng: number }> = {
    'Chía': { lat: 4.8614, lng: -74.0336 },
    'Zipaquirá': { lat: 5.0267, lng: -74.0042 },
    'Cajicá': { lat: 4.9189, lng: -74.0256 }
  };

  // Estados UI
  enviando = false;
  cargandoGeo = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  // Modal Auth
  mostrarModalAuth = false;
  modoRegistro = false;
  autenticando = false;
  authEmail = 'admin@angelshot.app';
  authPassword = 'AngelShotAdmin2026*';
  authError: string | null = null;

  regNombre = '';
  regEmail = '';
  regTelefono = '';
  regPassword = '';

  // Instancias de Mapa Leaflet
  private map: any = null;
  private markersLayer: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.usuarioActual = this.apiService.getUsuarioActual();
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  cargarDatos(): void {
    this.apiService.getEstadisticas().subscribe({
      next: (res) => this.stats = res,
      error: () => {}
    });

    this.apiService.getAlertas().subscribe({
      next: (res) => {
        this.alertas = res;
        this.aplicarFiltrosLocales();
        this.actualizarMarcadoresMapa();
      },
      error: () => {}
    });
  }

  // Leaflet Map Initialization
  private inicializarMapa(): void {
    if (typeof L === 'undefined') {
      setTimeout(() => this.inicializarMapa(), 300);
      return;
    }

    const container = document.getElementById('mapa-angel-shot');
    if (!container || this.map) return;

    // Centro inicial: Sabana Centro (Chía/Cajicá)
    this.map = L.map('mapa-angel-shot').setView([4.88, -74.03], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    // Clic en el mapa para capturar coordenadas y hacer geocodificación inversa
    this.map.on('click', (e: any) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      this.nuevoReporte.latitud = lat;
      this.nuevoReporte.longitud = lng;

      // Geocodificación inversa gratuita con BigDataCloud
      this.cargandoGeo = true;
      this.apiService.geocodificarInversa(lat, lng).subscribe({
        next: (geo) => {
          this.cargandoGeo = false;
          if (geo) {
            const ciudad = geo.city || geo.locality || '';
            if (ciudad.includes('Chía') || ciudad.includes('Chia')) this.nuevoReporte.municipio = 'Chía';
            else if (ciudad.includes('Zipaquirá') || ciudad.includes('Zipaquira')) this.nuevoReporte.municipio = 'Zipaquirá';
            else if (ciudad.includes('Cajicá') || ciudad.includes('Cajica')) this.nuevoReporte.municipio = 'Cajicá';

            if (!this.nuevoReporte.ubicacionDetalle && geo.localityInfo?.administrative) {
              const barrio = geo.locality || geo.principalSubdivision || '';
              this.nuevoReporte.ubicacionDetalle = `Cerca a ${barrio} (Marcado en mapa)`;
            }
          }
        },
        error: () => {
          this.cargandoGeo = false;
        }
      });
    });

    this.actualizarMarcadoresMapa();
  }

  private actualizarMarcadoresMapa(): void {
    if (!this.map || !this.markersLayer || typeof L === 'undefined') return;

    this.markersLayer.clearLayers();

    this.alertasFiltradas.forEach(alerta => {
      if (alerta.latitud && alerta.longitud) {
        const color = this.obtenerColorMarcador(alerta.tipoAlerta);

        const markerHtml = `
          <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-leaflet-pin',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 13px; color: #1e293b; min-width: 180px;">
            <div style="font-weight: 700; color: ${color}; margin-bottom: 4px;">
              ${this.formatearTipo(alerta.tipoAlerta)}
            </div>
            <div style="font-weight: 600; margin-bottom: 2px;">
              📍 ${alerta.municipio || 'Chía'}: ${alerta.ubicacionDetalle}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
              🕒 ${this.formatearFecha(alerta.createdAt)}
            </div>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #334155;">
              ${alerta.descripcion || 'Punto de riesgo reportado por la comunidad.'}
            </p>
          </div>
        `;

        const marker = L.marker([alerta.latitud, alerta.longitud], { icon: customIcon })
          .bindPopup(popupContent);

        this.markersLayer.addLayer(marker);
      }
    });
  }

  centrarEnSabana(): void {
    if (this.map) {
      this.map.setView([4.88, -74.03], 12);
    }
  }

  centrarEnPunto(alerta: Alerta): void {
    if (this.map && alerta.latitud && alerta.longitud) {
      this.map.setView([alerta.latitud, alerta.longitud], 16);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }

  alCambiarMunicipio(): void {
    const coords = this.coordsMunicipios[this.nuevoReporte.municipio];
    if (coords) {
      this.nuevoReporte.latitud = coords.lat;
      this.nuevoReporte.longitud = coords.lng;
      if (this.map) {
        this.map.setView([coords.lat, coords.lng], 14);
      }
    }
  }

  obtenerUbicacionActual(): void {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por su navegador.');
      return;
    }

    this.cargandoGeo = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        this.nuevoReporte.latitud = lat;
        this.nuevoReporte.longitud = lng;

        if (this.map) {
          this.map.setView([lat, lng], 15);
        }

        // Consultar API Externa Gratuita BigDataCloud
        this.apiService.geocodificarInversa(lat, lng).subscribe({
          next: (geo) => {
            this.cargandoGeo = false;
            if (geo) {
              const ciudad = geo.city || geo.locality || '';
              if (ciudad.includes('Zipaquirá') || ciudad.includes('Zipaquira')) this.nuevoReporte.municipio = 'Zipaquirá';
              else if (ciudad.includes('Cajicá') || ciudad.includes('Cajica')) this.nuevoReporte.municipio = 'Cajicá';
              else this.nuevoReporte.municipio = 'Chía';

              if (geo.locality) {
                this.nuevoReporte.ubicacionDetalle = `${geo.locality}, sector detectado`;
              }
            }
          },
          error: () => {
            this.cargandoGeo = false;
          }
        });
      },
      () => {
        this.cargandoGeo = false;
        alert('No se pudo acceder al sensor GPS. Por favor escribe la referencia o selecciona en el mapa.');
      }
    );
  }

  // Envío de Reporte (RF01, RF02, RF09)
  enviarReporte(): void {
    if (!this.usuarioActual) {
      this.mostrarModalAuth = true;
      return;
    }

    this.enviando = true;
    this.mensajeExito = null;
    this.mensajeError = null;

    this.apiService.crearAlerta(this.nuevoReporte).subscribe({
      next: (creada) => {
        this.enviando = false;
        this.mensajeExito = `¡Punto de riesgo reportado exitosamente! (ID #${creada.id})`;
        this.nuevoReporte.ubicacionDetalle = '';
        this.nuevoReporte.descripcion = '';
        this.cargarDatos();
      },
      error: (err) => {
        this.enviando = false;
        if (err.status === 409) {
          this.mensajeError = '⚠️ Ya existe un reporte idéntico registrado en este punto en los últimos 10 minutos (RF09: Prevención de duplicados).';
        } else if (err.status === 401 || err.status === 403) {
          this.mensajeError = '🔒 Sesión expirada o no autorizada. Por favor inicia sesión nuevamente con tu token JWT.';
          this.apiService.logout();
          this.usuarioActual = null;
        } else {
          this.mensajeError = 'Ocurrió un error al registrar el reporte. Por favor revisa los campos e intenta de nuevo.';
        }
      }
    });
  }

  // Filtros
  cambiarFiltroMunicipio(mun: string): void {
    this.filtroMunicipio = mun;
    this.aplicarFiltrosLocales();
    this.actualizarMarcadoresMapa();
    if (mun !== 'TODOS' && this.coordsMunicipios[mun] && this.map) {
      this.map.setView([this.coordsMunicipios[mun].lat, this.coordsMunicipios[mun].lng], 13);
    }
  }

  aplicarFiltrosLocales(): void {
    this.alertasFiltradas = this.alertas.filter(alerta => {
      const cumpleMun = this.filtroMunicipio === 'TODOS' ||
        (alerta.municipio && alerta.municipio.toLowerCase().includes(this.filtroMunicipio.toLowerCase()));

      const cumpleTipo = this.filtroTipo === 'TODOS' || alerta.tipoAlerta === this.filtroTipo;

      return cumpleMun && cumpleTipo;
    });
    this.actualizarMarcadoresMapa();
  }

  contarPorMunicipio(mun: string): number {
    return this.alertas.filter(a => a.municipio && a.municipio.toLowerCase().includes(mun.toLowerCase())).length;
  }

  // Autenticación JWT Rápida
  iniciarSesion(): void {
    this.autenticando = true;
    this.authError = null;
    this.apiService.login({ email: this.authEmail, password: this.authPassword }).subscribe({
      next: (res) => {
        this.autenticando = false;
        this.usuarioActual = res;
        this.mostrarModalAuth = false;
        this.cargarDatos();
      },
      error: () => {
        this.autenticando = false;
        this.authError = 'Credenciales inválidas. Verifica tu correo y contraseña.';
      }
    });
  }

  registrarse(): void {
    this.autenticando = true;
    this.authError = null;
    this.apiService.registro({
      nombre: this.regNombre,
      email: this.regEmail,
      telefono: this.regTelefono,
      password: this.regPassword
    }).subscribe({
      next: (res) => {
        this.autenticando = false;
        this.usuarioActual = res;
        this.mostrarModalAuth = false;
        this.cargarDatos();
      },
      error: () => {
        this.autenticando = false;
        this.authError = 'Error al crear la cuenta. Puede que el correo ya esté registrado.';
      }
    });
  }

  cerrarSesion(): void {
    this.apiService.logout();
    this.usuarioActual = null;
  }

  // Utilidades de Visualización
  formatearTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case 'ACOSO_O_INTIMIDACION': return '🚨 Acoso / Intimidación';
      case 'ILUMINACION_DEFICIENTE': return '💡 Iluminación Deficiente';
      case 'ZONA_DESOLADA': return '🏚️ Zona Desolada';
      case 'ANGEL_SHOT_SOLO': return '🍸 Protocolo Angel Shot';
      case 'ANGEL_SHOT_CON_HIELO': return '🍸 Angel Shot (Hielo)';
      case 'ANGEL_SHOT_CON_LIMA': return '🍸 Angel Shot (Lima)';
      case 'EMERGENCIA_MEDICA': return '🚑 Emergencia Médica';
      default: return tipo;
    }
  }

  obtenerClaseTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case 'ACOSO_O_INTIMIDACION': return 'badge-acoso';
      case 'ILUMINACION_DEFICIENTE': return 'badge-luz';
      case 'ZONA_DESOLADA': return 'badge-desolada';
      case 'ANGEL_SHOT_SOLO':
      case 'ANGEL_SHOT_CON_HIELO':
      case 'ANGEL_SHOT_CON_LIMA': return 'badge-angel';
      default: return 'badge-otro';
    }
  }

  obtenerColorMarcador(tipo: TipoAlerta): string {
    switch (tipo) {
      case 'ACOSO_O_INTIMIDACION': return '#ef4444';
      case 'ILUMINACION_DEFICIENTE': return '#f59e0b';
      case 'ZONA_DESOLADA': return '#8b5cf6';
      case 'ANGEL_SHOT_SOLO':
      case 'ANGEL_SHOT_CON_HIELO':
      case 'ANGEL_SHOT_CON_LIMA': return '#06b6d4';
      default: return '#3b82f6';
    }
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return 'Reciente';
    try {
      const f = new Date(fechaStr);
      return f.toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fechaStr;
    }
  }
}
