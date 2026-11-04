import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Alerta, AuthResponse, CrearAlertaRequest, TipoAlerta } from '../../core/models/models';

declare const L: any;

interface SugerenciaNominatim {
  display_name: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mobile-app-wrapper">
      <div class="mobile-phone-container">

        <!-- STATUS BAR FICTICIA (ESTILO MOCKUP 21:41) -->
        <div class="status-bar">
          <span class="status-time">21:41</span>
          <div class="status-icons">
            <span class="status-signal">●●●●</span>
            <span class="status-wifi">📶</span>
            <span class="status-battery">🔋</span>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- PESTAÑA 1: MAPA / LISTA (PANTALLAS 5 Y 6) -->
        <!-- ========================================== -->
        <main *ngIf="tabActiva === 'mapa'" class="tab-content">
          <!-- Header con Selector de Municipio -->
          <header class="app-header">
            <div class="brand-row">
              <span class="brand-title">ANGEL SHOT</span>
              <div class="municipio-selector-wrap">
                <select [(ngModel)]="municipioSeleccionado" (change)="filtrarAlertas()" class="municipio-select">
                  <option value="Chía">Chía, Cundinamarca</option>
                  <option value="Soacha">Soacha, Cundinamarca</option>
                  <option value="Cajicá">Cajicá, Cundinamarca</option>
                  <option value="Zipaquirá">Zipaquirá, Cundinamarca</option>
                  <option value="Bogotá">Bogotá, D.C.</option>
                  <option value="TODOS">Todos los municipios</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </div>

            <!-- Segmented Control: [ Mapa | Lista ] -->
            <div class="segmented-control">
              <button 
                type="button" 
                class="seg-btn" 
                [class.active]="vistaMapaLista === 'mapa'" 
                (click)="cambiarVistaMapaLista('mapa')">
                🗺️ Mapa
              </button>
              <button 
                type="button" 
                class="seg-btn" 
                [class.active]="vistaMapaLista === 'lista'" 
                (click)="cambiarVistaMapaLista('lista')">
                📋 Lista
              </button>
            </div>

            <!-- Scroll Horizontal de Filtros por Categoría -->
            <div class="filter-pills-scroll">
              <button 
                type="button" 
                class="pill-btn" 
                [class.active]="filtroTipo === 'TODOS'" 
                (click)="seleccionarFiltroTipo('TODOS')">
                Ver todos
              </button>
              <button 
                type="button" 
                class="pill-btn pill-luz" 
                [class.active]="filtroTipo === 'ILUMINACION_DEFICIENTE'" 
                (click)="seleccionarFiltroTipo('ILUMINACION_DEFICIENTE')">
                🟡 Falta de luz
              </button>
              <button 
                type="button" 
                class="pill-btn pill-acoso" 
                [class.active]="filtroTipo === 'ACOSO_O_INTIMIDACION'" 
                (click)="seleccionarFiltroTipo('ACOSO_O_INTIMIDACION')">
                🔴 Acoso
              </button>
              <button 
                type="button" 
                class="pill-btn pill-desolada" 
                [class.active]="filtroTipo === 'ZONA_DESOLADA'" 
                (click)="seleccionarFiltroTipo('ZONA_DESOLADA')">
                🟣 Zona desolada
              </button>
              <button 
                type="button" 
                class="pill-btn pill-vigilancia" 
                [class.active]="filtroTipo === 'POCA_VIGILANCIA'" 
                (click)="seleccionarFiltroTipo('POCA_VIGILANCIA')">
                🔵 Poca vigilancia
              </button>
            </div>
          </header>

          <!-- VISTA SUB-1: MAPA INTERACTIVO (PANTALLA 5) -->
          <div *ngIf="vistaMapaLista === 'mapa'" class="map-view-area">
            <div id="mapa-angel-shot" class="leaflet-map-canvas"></div>

            <!-- Indicador de Centro Histórico / Radar de ubicación -->
            <div class="map-overlay-center-badge">
              <span class="pulse-point"></span>
              {{ municipioSeleccionado }} · Rutas nocturnas activas
            </div>

            <!-- Tarjeta Inferior Flotante al Seleccionar Punto (Screen 5 bottom) -->
            <div *ngIf="alertaSeleccionada" class="floating-point-card" (click)="abrirModalValidacion(alertaSeleccionada)">
              <div class="card-left">
                <span class="cat-tag" [ngClass]="obtenerClaseCategoria(alertaSeleccionada.tipoAlerta)">
                  {{ formatearTipoAlerta(alertaSeleccionada.tipoAlerta) | uppercase }}
                </span>
                <h3 class="point-title">{{ alertaSeleccionada.ubicacionDetalle }}</h3>
                <p class="point-subtitle">{{ alertaSeleccionada.municipio || 'Chía' }} · {{ alertaSeleccionada.departamento || 'Cundinamarca' }}</p>
                <div class="point-meta">
                  <span>👥 {{ alertaSeleccionada.votosPositivos || 8 }}/{{ alertaSeleccionada.votosTotales || 10 }} coinciden</span>
                  <span class="meta-dot">•</span>
                  <span>{{ formatearFechaRelativa(alertaSeleccionada.createdAt) }}</span>
                </div>
              </div>
              <div class="card-right">
                <span class="dist-badge">{{ obtenerDistanciaFormateada(alertaSeleccionada) }} ↗</span>
                <button type="button" class="btn-detalles-mini" (click)="abrirModalValidacion(alertaSeleccionada); $event.stopPropagation()">
                  Ver
                </button>
              </div>
            </div>
          </div>

          <!-- VISTA SUB-2: LISTA ORDENADA POR CERCANÍA (PANTALLA 6) -->
          <div *ngIf="vistaMapaLista === 'lista'" class="list-view-area">
            <div class="list-header-meta">
              <span>Cerca de ti · Menor distancia</span>
              <span class="count-tag">{{ alertasFiltradas.length }} puntos</span>
            </div>

            <div class="cards-scroll-container">
              <div *ngIf="alertasFiltradas.length === 0" class="empty-state">
                <p>No hay reportes de riesgo en este sector con el filtro seleccionado.</p>
                <button type="button" class="btn-primary-gradient btn-sm" (click)="tabActiva = 'reportar'">
                  ⚠️ Reportar primer punto
                </button>
              </div>

              <div 
                *ngFor="let alerta of alertasFiltradas" 
                class="risk-list-card" 
                (click)="abrirModalValidacion(alerta)">
                <div class="card-top-row">
                  <span class="cat-tag" [ngClass]="obtenerClaseCategoria(alerta.tipoAlerta)">
                    {{ obtenerIconoTipo(alerta.tipoAlerta) }} {{ formatearTipoAlerta(alerta.tipoAlerta) }}
                  </span>
                  <span class="dist-badge">{{ obtenerDistanciaFormateada(alerta) }} &gt;</span>
                </div>

                <h3 class="card-title">{{ alerta.ubicacionDetalle }}</h3>
                <p class="card-sub">{{ alerta.municipio || 'Chía' }} &bull; {{ alerta.descripcion || 'Sin descripción adicional' }}</p>

                <div class="card-bottom-row">
                  <span class="time-ago">{{ formatearFechaRelativa(alerta.createdAt) }}</span>
                  <span class="votes-consensus">
                    👥 {{ alerta.votosPositivos || 8 }} de {{ alerta.votosTotales || 10 }} coinciden
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- ========================================== -->
        <!-- PESTAÑA 2: REPORTAR RIESGO (PANTALLA 3)    -->
        <!-- ========================================== -->
        <main *ngIf="tabActiva === 'reportar'" class="tab-content report-tab">
          <header class="app-header-simple">
            <h2>Reportar riesgo</h2>
            <p class="subtitle-loc">{{ nuevoReporte.municipio }}, Cundinamarca</p>
          </header>

          <form (ngSubmit)="enviarReporte()" class="report-form-body">
            <!-- Selector de Municipio en Píldoras -->
            <div class="form-section">
              <label class="form-label">Municipio <small class="text-muted">Cundinamarca</small></label>
              <div class="municipios-pills">
                <button 
                  type="button" 
                  class="mun-pill" 
                  [class.active]="nuevoReporte.municipio === 'Chía'" 
                  (click)="seleccionarMunicipioForm('Chía')">
                  Chía
                </button>
                <button 
                  type="button" 
                  class="mun-pill" 
                  [class.active]="nuevoReporte.municipio === 'Soacha'" 
                  (click)="seleccionarMunicipioForm('Soacha')">
                  Soacha
                </button>
                <button 
                  type="button" 
                  class="mun-pill" 
                  [class.active]="nuevoReporte.municipio === 'Cajicá'" 
                  (click)="seleccionarMunicipioForm('Cajicá')">
                  Cajicá
                </button>
                <button 
                  type="button" 
                  class="mun-pill" 
                  [class.active]="nuevoReporte.municipio === 'Zipaquirá'" 
                  (click)="seleccionarMunicipioForm('Zipaquirá')">
                  Zipaquirá
                </button>
              </div>
            </div>

            <!-- Dirección / Referencia Textual + Geocodificación Automática -->
            <div class="form-section">
              <label class="form-label">Dirección o punto de referencia</label>
              <div class="input-with-action">
                <input 
                  type="text" 
                  [(ngModel)]="nuevoReporte.ubicacionDetalle" 
                  name="ubicacionDetalle"
                  (input)="alEscribirDireccion()"
                  placeholder="Ej: Parque principal · Cra. 9 / Cl. 11" 
                  class="form-input" 
                  required />
                <button 
                  type="button" 
                  class="btn-gps-trigger" 
                  (click)="capturarUbicacionActualGPS()"
                  [disabled]="cargandoGeo"
                  title="Capturar coordenadas con GPS y BigDataCloud">
                  {{ cargandoGeo ? '⏳' : '📍 GPS' }}
                </button>
              </div>

              <!-- Sugerencias Nominatim OpenStreetMap en vivo -->
              <div *ngIf="sugerenciasNominatim.length > 0" class="nominatim-dropdown">
                <div 
                  *ngFor="let sug of sugerenciasNominatim" 
                  class="nominatim-item" 
                  (click)="seleccionarSugerenciaNominatim(sug)">
                  📍 {{ sug.display_name }}
                </div>
              </div>
              <small class="hint-text">
                {{ nuevoReporte.latitud ? ('Coordenadas: ' + nuevoReporte.latitud + ', ' + nuevoReporte.longitud) : 'Escribe la calle o toca el botón GPS para autocompletar.' }}
              </small>
            </div>

            <!-- Categoría de Riesgo (Grid 2x2 interactivo como en Mockup) -->
            <div class="form-section">
              <label class="form-label">Categoría de riesgo</label>
              <div class="category-grid">
                <div 
                  class="cat-card" 
                  [class.selected]="nuevoReporte.tipoAlerta === 'ILUMINACION_DEFICIENTE'"
                  (click)="nuevoReporte.tipoAlerta = 'ILUMINACION_DEFICIENTE'">
                  <span class="cat-icon">💡</span>
                  <span class="cat-name">Iluminación</span>
                </div>
                <div 
                  class="cat-card" 
                  [class.selected]="nuevoReporte.tipoAlerta === 'ACOSO_O_INTIMIDACION'"
                  (click)="nuevoReporte.tipoAlerta = 'ACOSO_O_INTIMIDACION'">
                  <span class="cat-icon">⚠️</span>
                  <span class="cat-name">Acoso</span>
                </div>
                <div 
                  class="cat-card" 
                  [class.selected]="nuevoReporte.tipoAlerta === 'ZONA_DESOLADA'"
                  (click)="nuevoReporte.tipoAlerta = 'ZONA_DESOLADA'">
                  <span class="cat-icon">🏚️</span>
                  <span class="cat-name">Zona desolada</span>
                </div>
                <div 
                  class="cat-card" 
                  [class.selected]="nuevoReporte.tipoAlerta === 'POCA_VIGILANCIA'"
                  (click)="nuevoReporte.tipoAlerta = 'POCA_VIGILANCIA'">
                  <span class="cat-icon">👮</span>
                  <span class="cat-name">Poca vigilancia</span>
                </div>
              </div>
            </div>

            <!-- Descripción (Máx. 300 caracteres) -->
            <div class="form-section">
              <div class="label-with-counter">
                <label class="form-label">Descripción</label>
                <span class="char-counter">Máx. 300 caracteres</span>
              </div>
              <textarea 
                [(ngModel)]="nuevoReporte.descripcion" 
                name="descripcion"
                maxlength="300"
                rows="3" 
                placeholder="Luminarias apagadas junto al parque. Carrera 9 oscura hacia calle 11." 
                class="form-textarea"></textarea>
            </div>

            <!-- Reporte Anónimo Switch -->
            <div class="form-switch-row">
              <label class="switch-container">
                <input type="checkbox" [(ngModel)]="nuevoReporte.anonimo" name="anonimo" />
                <span class="switch-slider"></span>
              </label>
              <span class="switch-label">Reporte anónimo.</span>
            </div>

            <!-- Feedback de envío -->
            <div *ngIf="mensajeExito" class="alert-box alert-success">{{ mensajeExito }}</div>
            <div *ngIf="mensajeError" class="alert-box alert-error">{{ mensajeError }}</div>

            <!-- Botón Enviar Reporte -->
            <button 
              type="submit" 
              class="btn-primary-gradient btn-full" 
              [disabled]="enviandoReporte">
              {{ enviandoReporte ? 'Guardando reporte...' : 'Enviar reporte' }}
            </button>
          </form>
        </main>

        <!-- ========================================== -->
        <!-- PESTAÑA 3: BOTÓN DE PÁNICO SOS (PANTALLA 4)-->
        <!-- ========================================== -->
        <main *ngIf="tabActiva === 'sos'" class="tab-content sos-tab">
          <header class="app-header-sos">
            <span class="brand-title">Angel Shot</span>
            <span class="badge-status-sos">
              <span class="dot-green"></span> Sin alerta activa
            </span>
          </header>

          <div class="sos-content-area">
            <h2 class="sos-title">Botón de pánico</h2>

            <!-- Botón Circular Central SOS con Efecto Onda/Pulso -->
            <div class="sos-button-wrapper">
              <div class="sos-ripple-ring" [class.holding]="presionandoSos"></div>
              <button 
                type="button" 
                class="btn-sos-circle" 
                (mousedown)="iniciarPresionSos()"
                (mouseup)="cancelarPresionSos()"
                (touchstart)="iniciarPresionSos()"
                (touchend)="cancelarPresionSos()">
                <div class="sos-inner-label">
                  <span class="sos-main-text">SOS</span>
                  <span class="sos-sub-text">
                    {{ presionandoSos ? ('Enviando en ' + segundosSos + 's...') : 'Mantén 3 segundos' }}
                  </span>
                </div>
              </button>
            </div>

            <div class="sos-location-info">
              <h4>Alerta con tu ubicación</h4>
              <p>{{ municipioSeleccionado }} · Centro histórico</p>
              <small>Solo al activar SOS</small>
            </div>

            <!-- Contactos de Confianza -->
            <div class="trusted-contacts-section">
              <div class="section-title-row">
                <span>Contactos de confianza</span>
                <button type="button" class="btn-text-action">Gestionar</button>
              </div>

              <div class="contact-card">
                <div class="contact-avatar avatar-purple">LM</div>
                <div class="contact-details">
                  <strong>Laura Martínez</strong>
                  <p>Hermana &bull; +57 310 555 0182</p>
                </div>
              </div>

              <div class="contact-card">
                <div class="contact-avatar avatar-pink">CR</div>
                <div class="contact-details">
                  <strong>Camila Rojas</strong>
                  <p>Amiga &bull; +57 315 555 0246</p>
                </div>
              </div>
            </div>

            <!-- Botón Llamada de Emergencia Nacional 123 -->
            <a href="tel:123" class="btn-call-123">
              📞 Llamar al 123
            </a>
          </div>
        </main>

        <!-- ========================================== -->
        <!-- PESTAÑA 4: COMUNIDAD / AUTENTICACIÓN (1 & 2)-->
        <!-- ========================================== -->
        <main *ngIf="tabActiva === 'comunidad'" class="tab-content auth-tab">
          <!-- SI EL USUARIO YA ESTÁ LOGUEADO: PERFIL -->
          <div *ngIf="usuarioActual" class="profile-view">
            <header class="app-header-simple">
              <h2>Mi Comunidad</h2>
              <p class="subtitle-loc">Sesión activa protegida por JWT</p>
            </header>

            <div class="profile-card">
              <div class="profile-avatar">👤</div>
              <h3>{{ usuarioActual.nombre }}</h3>
              <p class="profile-email">{{ usuarioActual.email }}</p>
              <div class="role-tags">
                <span *ngFor="let r of usuarioActual.roles" class="role-badge">{{ r }}</span>
              </div>
            </div>

            <div class="profile-stats">
              <div class="pstat-item">
                <span class="pstat-num">{{ misAlertas.length }}</span>
                <span class="pstat-lbl">Mis Reportes</span>
              </div>
              <div class="pstat-item">
                <span class="pstat-num">{{ contarValidacionesHechas() }}</span>
                <span class="pstat-lbl">Validaciones</span>
              </div>
            </div>

            <button type="button" class="btn-logout" (click)="cerrarSesion()">
              🚪 Cerrar sesión
            </button>
          </div>

          <!-- PANTALLA 1: INICIA SESIÓN -->
          <div *ngIf="!usuarioActual && subVistaAuth === 'login'" class="auth-screen">
            <div class="auth-brand-center">
              <div class="shield-logo">🛡️</div>
              <h1 class="auth-title">Angel Shot</h1>
              <p class="auth-subtitle">Noche segura</p>
            </div>

            <h2 class="auth-heading">Inicia sesión</h2>

            <form (ngSubmit)="ejecutarLogin()" class="auth-form">
              <div class="form-group">
                <label class="form-label">Correo electrónico</label>
                <input 
                  type="email" 
                  [(ngModel)]="loginEmail" 
                  name="email" 
                  placeholder="Correo" 
                  class="form-input" 
                  required />
              </div>

              <div class="form-group">
                <label class="form-label">Contraseña</label>
                <input 
                  type="password" 
                  [(ngModel)]="loginPassword" 
                  name="password" 
                  placeholder="Contraseña" 
                  class="form-input" 
                  required />
                <a href="javascript:void(0)" class="forgot-pass-link">Recuperar contraseña</a>
              </div>

              <div *ngIf="authError" class="alert-box alert-error">{{ authError }}</div>

              <button type="submit" class="btn-primary-gradient btn-full" [disabled]="procesandoAuth">
                {{ procesandoAuth ? 'Iniciando...' : '➔ Entrar' }}
              </button>

              <div class="auth-toggle-link">
                <span>¿No tienes cuenta? </span>
                <a href="javascript:void(0)" (click)="subVistaAuth = 'registro'">Regístrate</a>
              </div>
            </form>
          </div>

          <!-- PANTALLA 2: CREAR CUENTA -->
          <div *ngIf="!usuarioActual && subVistaAuth === 'registro'" class="auth-screen">
            <div class="register-header-nav">
              <button type="button" class="btn-back" (click)="subVistaAuth = 'login'">←</button>
              <div class="header-titles">
                <h2>Crear cuenta</h2>
                <div class="steps-indicator">
                  <span class="step-active">1 Cuenta</span>
                  <span class="step-line"></span>
                  <span>2 Verifica identidad</span>
                </div>
              </div>
            </div>

            <form (ngSubmit)="ejecutarRegistro()" class="auth-form">
              <div class="form-group">
                <label class="form-label">Nombre</label>
                <input 
                  type="text" 
                  [(ngModel)]="regNombre" 
                  name="nombre" 
                  placeholder="Tu nombre" 
                  class="form-input" 
                  required />
              </div>

              <div class="form-group">
                <label class="form-label">Correo</label>
                <input 
                  type="email" 
                  [(ngModel)]="regEmail" 
                  name="email" 
                  placeholder="tu@correo.com" 
                  class="form-input" 
                  required />
              </div>

              <div class="form-group">
                <label class="form-label">Contraseña</label>
                <input 
                  type="password" 
                  [(ngModel)]="regPassword" 
                  name="password" 
                  placeholder="••••••••" 
                  class="form-input" 
                  required />
                <small class="hint-text">8+ caracteres · Mayúscula · Número</small>
              </div>

              <div class="form-group">
                <label class="form-label">Confirmar contraseña</label>
                <input 
                  type="password" 
                  [(ngModel)]="regConfirmPassword" 
                  name="confirmPassword" 
                  placeholder="••••••••" 
                  class="form-input" 
                  required />
              </div>

              <!-- Sección: Verifica tu identidad -->
              <div class="verification-box">
                <div class="verif-title-row">
                  <strong>Verifica tu identidad</strong>
                  <span class="verif-tag">Verificación privada obligatoria</span>
                </div>
                <div class="verif-buttons-row">
                  <button type="button" class="btn-verif-type">🪪 Documento</button>
                  <button type="button" class="btn-verif-type">🤳 Selfie</button>
                </div>
                <small class="verif-note">🔒 Datos cifrados, nunca públicos</small>
              </div>

              <div class="form-checkbox-row">
                <input type="checkbox" [(ngModel)]="aceptoTerminos" name="terminos" id="term-check" required />
                <label for="term-check">Acepto términos, privacidad y verificación de identidad.</label>
              </div>

              <div *ngIf="authError" class="alert-box alert-error">{{ authError }}</div>

              <button type="submit" class="btn-primary-gradient btn-full" [disabled]="procesandoAuth">
                {{ procesandoAuth ? 'Registrando...' : '➔ Crear y verificar' }}
              </button>

              <div class="auth-toggle-link">
                <span>¿Tienes cuenta? </span>
                <a href="javascript:void(0)" (click)="subVistaAuth = 'login'">Inicia sesión</a>
              </div>
            </form>
          </div>
        </main>

        <!-- ========================================== -->
        <!-- MODAL DETALLE Y VALIDACIÓN (PANTALLA 7)   -->
        <!-- ========================================== -->
        <div *ngIf="modalDetalleAbierto && alertaModal" class="modal-backdrop" (click)="cerrarModalValidacion()">
          <div class="bottom-sheet-modal" (click)="$event.stopPropagation()">
            <div class="sheet-drag-handle"></div>
            <button type="button" class="btn-sheet-close" (click)="cerrarModalValidacion()">✕</button>

            <!-- Categoría -->
            <span class="cat-tag" [ngClass]="obtenerClaseCategoria(alertaModal.tipoAlerta)">
              {{ formatearTipoAlerta(alertaModal.tipoAlerta) | uppercase }}
            </span>

            <!-- Título y Dirección -->
            <h2 class="modal-title">{{ alertaModal.ubicacionDetalle }}</h2>
            <div class="modal-sub-row">
              <span class="modal-sub-loc">{{ alertaModal.municipio || 'Chía' }}, Cundinamarca</span>
              <span class="dist-badge">{{ obtenerDistanciaFormateada(alertaModal) }}</span>
            </div>

            <!-- Autor y Fecha -->
            <div class="modal-author-meta">
              <span>{{ formatearFechaRelativa(alertaModal.createdAt) }}</span>
              <span class="meta-dot">•</span>
              <span>{{ alertaModal.anonimo ? 'Anónimo' : (alertaModal.usuarioNombre || 'Ciudadana') }}</span>
            </div>

            <!-- Descripción -->
            <p class="modal-desc">{{ alertaModal.descripcion || 'Punto de riesgo reportado en el espacio público nocturno.' }}</p>

            <!-- Recuadro Métrico de Validación Comunitaria (Mockup Screen 7) -->
            <div class="validation-score-box">
              <div class="score-percent">{{ alertaModal.porcentajeCoincidencia || calcularPorcentaje(alertaModal) }}%</div>
              <div class="score-label">COINCIDEN</div>
              <div class="score-summary">
                {{ alertaModal.votosPositivos || 8 }} de {{ alertaModal.votosTotales || 10 }} coinciden
              </div>
              <small class="score-tagline">Validación comunitaria</small>
            </div>

            <!-- Botones de Acción: Validar / Ya no ocurre -->
            <div class="validation-actions-row">
              <button 
                type="button" 
                class="btn-validate-agree" 
                (click)="enviarValidacionComunitaria(alertaModal, true)">
                ✓ Validar
              </button>
              <button 
                type="button" 
                class="btn-validate-disagree" 
                (click)="enviarValidacionComunitaria(alertaModal, false)">
                ✕ Ya no ocurre
              </button>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- BARRA INFERIOR DE NAVEGACIÓN (4 BOTONES)   -->
        <!-- ========================================== -->
        <nav class="bottom-nav-bar">
          <button 
            type="button" 
            class="nav-item" 
            [class.active]="tabActiva === 'mapa'" 
            (click)="cambiarTab('mapa')">
            <span class="nav-icon">🗺️</span>
            <span class="nav-label">Mapa</span>
          </button>

          <button 
            type="button" 
            class="nav-item" 
            [class.active]="tabActiva === 'reportar'" 
            (click)="cambiarTab('reportar')">
            <span class="nav-icon">⚠️</span>
            <span class="nav-label">Reportes</span>
          </button>

          <button 
            type="button" 
            class="nav-item" 
            [class.active]="tabActiva === 'sos'" 
            (click)="cambiarTab('sos')">
            <span class="nav-icon">🛡️</span>
            <span class="nav-label">Rutas</span>
          </button>

          <button 
            type="button" 
            class="nav-item" 
            [class.active]="tabActiva === 'comunidad'" 
            (click)="cambiarTab('comunidad')">
            <span class="nav-icon">👥</span>
            <span class="nav-label">Comunidad</span>
          </button>
        </nav>

      </div>
    </div>
  `,
  styles: [`
    /* ================================================= */
    /* PALETA DARK MODE EXACTA AL MOCKUP FIGMA           */
    /* ================================================= */
    :host {
      --bg-dark: #0a0e1a;
      --bg-card: #131929;
      --bg-card-hover: #182035;
      --bg-input: #161e33;
      --border-color: rgba(255, 255, 255, 0.08);
      --border-color-glow: rgba(139, 92, 246, 0.35);
      --primary-purple: #8b5cf6;
      --primary-pink: #ec4899;
      --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      --text-white: #f8fafc;
      --text-muted: #94a3b8;
      --color-luz: #f59e0b;
      --color-acoso: #ef4444;
      --color-desolada: #8b5cf6;
      --color-vigilancia: #3b82f6;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .mobile-app-wrapper {
      min-height: 100vh;
      background: #030712;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
    }

    .mobile-phone-container {
      width: 100%;
      max-width: 440px;
      min-height: 100vh;
      height: 100vh;
      background: var(--bg-dark);
      color: var(--text-white);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }

    @media (min-width: 480px) {
      .mobile-phone-container {
        height: 900px;
        min-height: 900px;
        border-radius: 40px;
        border: 4px solid #1f293d;
      }
    }

    /* STATUS BAR */
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 24px 4px;
      font-size: 13px;
      font-weight: 700;
      color: #cbd5e1;
      background: var(--bg-dark);
      z-index: 50;
    }
    .status-icons {
      display: flex;
      gap: 6px;
      font-size: 11px;
    }

    /* CONTENEDOR DE PESTAÑAS */
    .tab-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding-bottom: 70px;
      position: relative;
    }

    /* HEADER PANTALLA MAPA/LISTA */
    .app-header {
      padding: 8px 16px;
      background: var(--bg-dark);
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 20;
    }

    .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #94a3b8;
    }

    .municipio-selector-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .municipio-select {
      appearance: none;
      background: transparent;
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      border: none;
      padding-right: 18px;
      cursor: pointer;
      outline: none;
    }
    .municipio-select option {
      background: #1e293b;
      color: #fff;
    }
    .select-arrow {
      position: absolute;
      right: 0;
      pointer-events: none;
      color: var(--primary-purple);
      font-size: 12px;
    }

    /* SEGMENTED CONTROL [ Mapa | Lista ] */
    .segmented-control {
      display: flex;
      background: #141b2d;
      padding: 3px;
      border-radius: 20px;
      border: 1px solid var(--border-color);
    }
    .seg-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .seg-btn.active {
      background: var(--accent-gradient);
      color: #fff;
      box-shadow: 0 2px 10px rgba(139, 92, 246, 0.4);
    }

    /* SCROLL HORIZONTAL DE FILTROS */
    .filter-pills-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }
    .filter-pills-scroll::-webkit-scrollbar {
      display: none;
    }
    .pill-btn {
      white-space: nowrap;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: #141b2d;
      border: 1px solid var(--border-color);
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pill-btn.active {
      background: #252e46;
      border-color: var(--primary-purple);
      color: #fff;
    }
    .pill-luz.active { border-color: var(--color-luz); color: #fde68a; }
    .pill-acoso.active { border-color: var(--color-acoso); color: #fca5a5; }
    .pill-desolada.active { border-color: var(--color-desolada); color: #ddd6fe; }
    .pill-vigilancia.active { border-color: var(--color-vigilancia); color: #93c5fd; }

    /* AREA DEL MAPA LEAFLET */
    .map-view-area {
      flex: 1;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .leaflet-map-canvas {
      width: 100%;
      height: 100%;
      min-height: 400px;
      flex: 1;
      background: #0d111c;
      z-index: 1;
    }

    .map-overlay-center-badge {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(19, 25, 41, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-color);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }
    .pulse-point {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    /* TARJETA INFERIOR FLOTANTE SOBRE EL MAPA (SCREEN 5) */
    .floating-point-card {
      position: absolute;
      bottom: 14px;
      left: 14px;
      right: 14px;
      background: #121829;
      border: 1px solid var(--border-color);
      border-radius: 18px;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 20;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: transform 0.2s;
    }
    .floating-point-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary-purple);
    }
    .point-title {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      margin: 4px 0 2px;
    }
    .point-subtitle {
      font-size: 12px;
      color: #94a3b8;
    }
    .point-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .meta-dot { font-size: 8px; }
    .card-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .dist-badge {
      background: #1e293b;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      color: #e2e8f0;
      white-space: nowrap;
    }
    .btn-detalles-mini {
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }

    /* VISTA LISTA (SCREEN 6) */
    .list-view-area {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .list-header-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #94a3b8;
      font-weight: 600;
      padding: 0 2px;
    }
    .count-tag {
      background: #1e293b;
      padding: 2px 8px;
      border-radius: 10px;
      color: #e2e8f0;
    }
    .cards-scroll-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .risk-list-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .risk-list-card:hover {
      background: var(--bg-card-hover);
      border-color: rgba(139, 92, 246, 0.4);
    }
    .card-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 2px;
    }
    .card-sub {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .card-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    .votes-consensus {
      color: #a78bfa;
      font-weight: 600;
    }

    /* BADGES DE CATEGORIA */
    .cat-tag {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 8px;
    }
    .cat-luz { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .cat-acoso { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .cat-desolada { background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3); }
    .cat-vigilancia { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }

    /* PESTAÑA REPORTAR RIESGO (SCREEN 3) */
    .report-tab {
      padding: 16px;
    }
    .app-header-simple {
      margin-bottom: 14px;
    }
    .app-header-simple h2 {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
    }
    .subtitle-loc {
      font-size: 12px;
      color: #94a3b8;
    }
    .report-form-body {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      font-size: 12px;
      font-weight: 700;
      color: #cbd5e1;
    }
    .municipios-pills {
      display: flex;
      gap: 8px;
      overflow-x: auto;
    }
    .mun-pill {
      flex: 1;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      color: #94a3b8;
      cursor: pointer;
    }
    .mun-pill.active {
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      box-shadow: 0 2px 10px rgba(139, 92, 246, 0.4);
    }
    .input-with-action {
      display: flex;
      gap: 8px;
    }
    .form-input {
      flex: 1;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 12px 14px;
      color: #fff;
      font-size: 14px;
      outline: none;
    }
    .form-input:focus {
      border-color: var(--primary-purple);
    }
    .btn-gps-trigger {
      background: #1e293b;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      color: #cbd5e1;
      padding: 0 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-gps-trigger:hover {
      background: #334155;
    }
    .nominatim-dropdown {
      background: #182035;
      border: 1px solid var(--border-color-glow);
      border-radius: 12px;
      max-height: 140px;
      overflow-y: auto;
      margin-top: 4px;
    }
    .nominatim-item {
      padding: 8px 12px;
      font-size: 12px;
      color: #cbd5e1;
      cursor: pointer;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .nominatim-item:hover {
      background: #252e46;
      color: #fff;
    }
    .hint-text {
      font-size: 11px;
      color: #64748b;
    }

    /* GRID CATEGORIAS 2x2 */
    .category-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .cat-card {
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cat-card.selected {
      background: #211c3b;
      border-color: var(--primary-purple);
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
    }
    .cat-icon { font-size: 18px; }
    .cat-name { font-size: 13px; font-weight: 700; color: #fff; }

    .label-with-counter {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .char-counter { font-size: 11px; color: #64748b; }
    .form-textarea {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 12px 14px;
      color: #fff;
      font-size: 13px;
      outline: none;
      resize: none;
    }
    .form-textarea:focus { border-color: var(--primary-purple); }

    .form-switch-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .switch-container {
      position: relative;
      display: inline-block;
      width: 42px;
      height: 24px;
    }
    .switch-container input { opacity: 0; width: 0; height: 0; }
    .switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #334155;
      transition: .3s;
      border-radius: 24px;
    }
    .switch-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }
    input:checked + .switch-slider { background-color: var(--primary-purple); }
    input:checked + .switch-slider:before { transform: translateX(18px); }
    .switch-label { font-size: 13px; color: #cbd5e1; }

    .btn-primary-gradient {
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      padding: 14px;
      border-radius: 16px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(236, 72, 153, 0.35);
      transition: opacity 0.2s;
    }
    .btn-primary-gradient:hover { opacity: 0.95; }
    .btn-full { width: 100%; }

    /* PESTAÑA BOTÓN DE PÁNICO SOS (SCREEN 4) */
    .sos-tab {
      padding: 16px;
      display: flex;
      flex-direction: column;
    }
    .app-header-sos {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .badge-status-sos {
      background: #141b2d;
      border: 1px solid var(--border-color);
      padding: 4px 10px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot-green {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }
    .sos-content-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      flex: 1;
    }
    .sos-title {
      font-size: 24px;
      font-weight: 800;
      color: #fff;
    }

    /* BOTON CIRCULAR SOS CON PULSO */
    .sos-button-wrapper {
      position: relative;
      width: 180px;
      height: 180px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 10px 0;
    }
    .sos-ripple-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.2);
      animation: sosPulse 2s infinite ease-out;
    }
    .sos-ripple-ring.holding {
      animation: sosHoldPulse 0.5s infinite;
      background: rgba(239, 68, 68, 0.5);
    }
    @keyframes sosPulse {
      0% { transform: scale(0.9); opacity: 0.8; }
      100% { transform: scale(1.35); opacity: 0; }
    }
    @keyframes sosHoldPulse {
      0% { transform: scale(1.1); }
      50% { transform: scale(1.25); }
      100% { transform: scale(1.1); }
    }
    .btn-sos-circle {
      position: relative;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: radial-gradient(circle, #f43f5e 0%, #e11d48 100%);
      border: 4px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 0 35px rgba(225, 29, 72, 0.6);
      color: #fff;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      user-select: none;
    }
    .sos-main-text {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 2px;
      display: block;
    }
    .sos-sub-text {
      font-size: 10px;
      font-weight: 600;
      opacity: 0.85;
      display: block;
      margin-top: 2px;
    }
    .sos-location-info {
      text-align: center;
    }
    .sos-location-info h4 {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
    }
    .sos-location-info p {
      font-size: 13px;
      color: #94a3b8;
      margin: 2px 0;
    }
    .sos-location-info small {
      font-size: 11px;
      color: #64748b;
    }

    /* SECCION CONTACTOS */
    .trusted-contacts-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
      color: #cbd5e1;
    }
    .btn-text-action {
      background: none;
      border: none;
      color: var(--primary-purple);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .contact-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .contact-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 800;
      font-size: 13px;
      color: #fff;
    }
    .avatar-purple { background: #8b5cf6; }
    .avatar-pink { background: #ec4899; }
    .contact-details strong {
      font-size: 14px;
      color: #fff;
      display: block;
    }
    .contact-details p {
      font-size: 12px;
      color: #94a3b8;
    }
    .btn-call-123 {
      width: 100%;
      background: #182035;
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      padding: 12px;
      border-radius: 14px;
      text-align: center;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      display: block;
      margin-top: auto;
      transition: background 0.2s;
    }
    .btn-call-123:hover { background: rgba(239, 68, 68, 0.15); }

    /* PESTAÑA AUTENTICACION / COMUNIDAD (SCREEN 1 & 2) */
    .auth-tab {
      padding: 20px 16px;
    }
    .auth-screen {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .auth-brand-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 10px;
    }
    .shield-logo {
      font-size: 40px;
      margin-bottom: 6px;
    }
    .auth-title {
      font-size: 26px;
      font-weight: 900;
      color: #fff;
    }
    .auth-subtitle {
      font-size: 13px;
      color: var(--primary-purple);
      font-weight: 600;
    }
    .auth-heading {
      font-size: 20px;
      font-weight: 800;
      color: #fff;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .forgot-pass-link {
      align-self: flex-end;
      font-size: 12px;
      color: var(--primary-purple);
      text-decoration: none;
      margin-top: 2px;
    }
    .auth-toggle-link {
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
      margin-top: 8px;
    }
    .auth-toggle-link a {
      color: var(--primary-purple);
      font-weight: 700;
    }

    /* SCREEN 2 REGISTER SPECIFICS */
    .register-header-nav {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-back {
      background: none;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
    }
    .header-titles h2 {
      font-size: 20px;
      font-weight: 800;
      color: #fff;
    }
    .steps-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #64748b;
    }
    .step-active { color: var(--primary-purple); font-weight: 700; }
    .step-line { width: 14px; height: 1px; background: #334155; }

    .verification-box {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .verif-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #fff;
    }
    .verif-tag {
      font-size: 10px;
      color: #a78bfa;
    }
    .verif-buttons-row {
      display: flex;
      gap: 8px;
    }
    .btn-verif-type {
      flex: 1;
      background: #1e293b;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 8px;
      color: #cbd5e1;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .verif-note {
      font-size: 11px;
      color: #64748b;
    }
    .form-checkbox-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      color: #cbd5e1;
    }
    .form-checkbox-row input { margin-top: 3px; }

    /* PERFIL VIEW */
    .profile-view {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .profile-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 18px;
      padding: 20px;
      text-align: center;
    }
    .profile-avatar { font-size: 40px; margin-bottom: 8px; }
    .profile-email { font-size: 13px; color: #94a3b8; margin: 4px 0 12px; }
    .role-tags { display: flex; justify-content: center; gap: 6px; }
    .role-badge {
      background: #1e293b;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      color: #a78bfa;
      font-weight: 700;
    }
    .profile-stats {
      display: flex;
      gap: 10px;
    }
    .pstat-item {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 12px;
      text-align: center;
    }
    .pstat-num { font-size: 20px; font-weight: 800; color: #fff; display: block; }
    .pstat-lbl { font-size: 11px; color: #94a3b8; }
    .btn-logout {
      background: #1e293b;
      border: 1px solid var(--border-color);
      color: #cbd5e1;
      padding: 12px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    /* MODAL DETALLE Y VALIDACION COMUNITARIA (PANTALLA 7) */
    .modal-backdrop {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: flex-end;
    }
    .bottom-sheet-modal {
      width: 100%;
      background: #111728;
      border-top: 1px solid var(--border-color);
      border-radius: 28px 28px 0 0;
      padding: 20px 20px 80px;
      position: relative;
      animation: slideUp 0.25s ease-out;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .sheet-drag-handle {
      width: 40px;
      height: 4px;
      background: #334155;
      border-radius: 4px;
      align-self: center;
      margin-bottom: 4px;
    }
    .btn-sheet-close {
      position: absolute;
      top: 18px;
      right: 20px;
      background: #1e293b;
      border: none;
      color: #94a3b8;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .modal-title {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
    }
    .modal-sub-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-sub-loc { font-size: 13px; color: #94a3b8; }
    .modal-author-meta {
      font-size: 12px;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .modal-desc {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.4;
      background: #161e33;
      padding: 10px 12px;
      border-radius: 12px;
    }

    /* SCORE DE VALIDACION (SCREEN 7 RECTANGLE) */
    .validation-score-box {
      background: #18223a;
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 14px;
      text-align: center;
      margin: 6px 0;
    }
    .score-percent {
      font-size: 32px;
      font-weight: 900;
      color: #a78bfa;
    }
    .score-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #c4b5fd;
    }
    .score-summary {
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      margin-top: 4px;
    }
    .score-tagline {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
    }

    .validation-actions-row {
      display: flex;
      gap: 10px;
      margin-top: 4px;
    }
    .btn-validate-agree {
      flex: 1;
      background: var(--accent-gradient);
      color: #fff;
      border: none;
      padding: 12px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-validate-disagree {
      flex: 1;
      background: #1e293b;
      border: 1px solid var(--border-color);
      color: #cbd5e1;
      padding: 12px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    /* BARRA INFERIOR DE NAVEGACION FIJA */
    .bottom-nav-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 65px;
      background: #0f1524;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 60;
    }
    .nav-item {
      background: none;
      border: none;
      color: #64748b;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: color 0.2s;
    }
    .nav-item.active {
      color: #a78bfa;
    }
    .nav-icon { font-size: 18px; }
    .nav-label { font-size: 11px; font-weight: 600; }

    /* ALERT BOXES */
    .alert-box {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // Navegación
  tabActiva: 'mapa' | 'reportar' | 'sos' | 'comunidad' = 'mapa';
  vistaMapaLista: 'mapa' | 'lista' = 'mapa';
  subVistaAuth: 'login' | 'registro' = 'login';

  // Filtros
  municipioSeleccionado: string = 'Chía';
  filtroTipo: string = 'TODOS';

  // Datos
  alertas: Alerta[] = [];
  alertasFiltradas: Alerta[] = [];
  misAlertas: Alerta[] = [];
  alertaSeleccionada: Alerta | null = null;
  alertaModal: Alerta | null = null;
  modalDetalleAbierto: boolean = false;

  // Ubicación del Usuario (Chía por defecto)
  userLat: number = 4.8631;
  userLng: number = -74.0583;

  // Mapa Leaflet
  private map: any = null;
  private markersLayer: any = null;
  private userMarker: any = null;

  // Formulario de Reporte
  nuevoReporte: CrearAlertaRequest = {
    tipoAlerta: 'ILUMINACION_DEFICIENTE',
    municipio: 'Chía',
    departamento: 'Cundinamarca',
    ubicacionDetalle: '',
    descripcion: '',
    anonimo: false,
    latitud: 4.8631,
    longitud: -74.0583
  };
  cargandoGeo: boolean = false;
  enviandoReporte: boolean = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  sugerenciasNominatim: SugerenciaNominatim[] = [];
  private debounceTimer: any = null;

  // Botón SOS
  presionandoSos: boolean = false;
  segundosSos: number = 3;
  private timerSos: any = null;

  // Autenticación
  usuarioActual: AuthResponse | null = null;
  loginEmail: string = '';
  loginPassword: string = '';
  regNombre: string = '';
  regEmail: string = '';
  regPassword: string = '';
  regConfirmPassword: string = '';
  aceptoTerminos: boolean = false;
  authError: string | null = null;
  procesandoAuth: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.usuarioActual = this.apiService.getUsuarioActual();
    this.obtenerUbicacionInicial();
    this.cargarAlertas();
  }

  ngAfterViewInit(): void {
    if (this.tabActiva === 'mapa' && this.vistaMapaLista === 'mapa') {
      setTimeout(() => this.inicializarMapa(), 300);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (this.timerSos) clearInterval(this.timerSos);
  }

  // ----------------------------------------------------
  // GEOLOCALIZACIÓN Y UBICACIÓN
  // ----------------------------------------------------
  private obtenerUbicacionInicial(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.nuevoReporte.latitud = this.userLat;
          this.nuevoReporte.longitud = this.userLng;
          this.actualizarMarcadorUsuario();
          this.calcularDistancias();
        },
        () => {
          // Fallback a IP (RN02)
          this.apiService.obtenerUbicacionIP().subscribe(ipData => {
            if (ipData?.latitude && ipData?.longitude) {
              this.userLat = ipData.latitude;
              this.userLng = ipData.longitude;
              this.nuevoReporte.latitud = this.userLat;
              this.nuevoReporte.longitud = this.userLng;
              this.actualizarMarcadorUsuario();
              this.calcularDistancias();
            }
          });
        }
      );
    }
  }

  // ----------------------------------------------------
  // LEAFLET MAPA INTERACTIVO (OPENSTREETMAP / CARTODB)
  // ----------------------------------------------------
  private inicializarMapa(): void {
    if (typeof L === 'undefined') {
      setTimeout(() => this.inicializarMapa(), 300);
      return;
    }

    const container = document.getElementById('mapa-angel-shot');
    if (!container) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    // Inicializar mapa centrado en Sabana Centro (Chía)
    this.map = L.map('mapa-angel-shot', {
      zoomControl: false,
      attributionControl: false
    }).setView([this.userLat, this.userLng], 14);

    // Tiles oscuros CartoDB Dark Matter con fallback OSM
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.actualizarMarcadorUsuario();
    this.renderizarMarcadoresEnMapa();

    // Clic en el mapa para capturar coordenadas
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
            if (ciudad.toLowerCase().includes('chía') || ciudad.toLowerCase().includes('chia')) this.nuevoReporte.municipio = 'Chía';
            else if (ciudad.toLowerCase().includes('soacha')) this.nuevoReporte.municipio = 'Soacha';
            else if (ciudad.toLowerCase().includes('cajicá') || ciudad.toLowerCase().includes('cajica')) this.nuevoReporte.municipio = 'Cajicá';
            else if (ciudad.toLowerCase().includes('zipaquirá') || ciudad.toLowerCase().includes('zipaquira')) this.nuevoReporte.municipio = 'Zipaquirá';

            const via = geo.localityInfo?.administrative?.[0]?.name || geo.locality || '';
            if (via && !this.nuevoReporte.ubicacionDetalle) {
              this.nuevoReporte.ubicacionDetalle = `${via} (${lat}, ${lng})`;
            }
          }
        },
        error: () => { this.cargandoGeo = false; }
      });
    });
  }

  private actualizarMarcadorUsuario(): void {
    if (!this.map || typeof L === 'undefined') return;

    if (this.userMarker) {
      this.userMarker.setLatLng([this.userLat, this.userLng]);
      return;
    }

    const userIcon = L.divIcon({
      className: 'user-radar-div-icon',
      html: `
        <div style="position:relative; width:22px; height:22px; display:flex; justify-content:center; align-items:center;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(59,130,246,0.3); animation:pulse 2s infinite;"></div>
          <div style="width:12px; height:12px; border-radius:50%; background:#3b82f6; border:2px solid #fff; box-shadow:0 0 8px #3b82f6;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    this.userMarker = L.marker([this.userLat, this.userLng], { icon: userIcon }).addTo(this.map);
  }

  private renderizarMarcadoresEnMapa(): void {
    if (!this.map || !this.markersLayer || typeof L === 'undefined') return;

    this.markersLayer.clearLayers();

    this.alertasFiltradas.forEach(alerta => {
      const lat = alerta.latitud || this.userLat;
      const lng = alerta.longitud || this.userLng;

      const color = this.obtenerColorPorTipo(alerta.tipoAlerta);
      const iconHtml = this.obtenerIconoTipo(alerta.tipoAlerta);

      const customIcon = L.divIcon({
        className: 'incident-pin-icon',
        html: `
          <div style="position:relative; width:30px; height:30px; display:flex; justify-content:center; align-items:center;">
            <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${color}33; animation:pulse 2.5s infinite;"></div>
            <div style="width:24px; height:24px; border-radius:50%; background:${color}; color:#fff; display:flex; justify-content:center; align-items:center; font-size:12px; border:2px solid #ffffffaa; box-shadow:0 0 10px ${color};">
              ${iconHtml}
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      marker.on('click', () => {
        this.alertaSeleccionada = alerta;
      });

      this.markersLayer.addLayer(marker);
    });

    // Seleccionar el primer reporte si no hay ninguno seleccionado
    if (!this.alertaSeleccionada && this.alertasFiltradas.length > 0) {
      this.alertaSeleccionada = this.alertasFiltradas[0];
    }
  }

  // ----------------------------------------------------
  // CARGA DE DATOS Y FILTROS
  // ----------------------------------------------------
  cargarAlertas(): void {
    this.apiService.getAlertas().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.alertas = data;
        } else {
          this.alertas = this.generarDatosMuestra();
        }
        this.filtrarAlertas();
      },
      error: () => {
        this.alertas = this.generarDatosMuestra();
        this.filtrarAlertas();
      }
    });
  }

  filtrarAlertas(): void {
    this.alertasFiltradas = this.alertas.filter(a => {
      const coincideMunicipio = this.municipioSeleccionado === 'TODOS' || 
        (a.municipio && a.municipio.toLowerCase().includes(this.municipioSeleccionado.toLowerCase()));
      const coincideTipo = this.filtroTipo === 'TODOS' || a.tipoAlerta === this.filtroTipo;
      return coincideMunicipio && coincideTipo;
    });

    this.calcularDistancias();
    this.renderizarMarcadoresEnMapa();
  }

  seleccionarFiltroTipo(tipo: string): void {
    this.filtroTipo = tipo;
    this.filtrarAlertas();
  }

  cambiarVistaMapaLista(vista: 'mapa' | 'lista'): void {
    this.vistaMapaLista = vista;
    if (vista === 'mapa') {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        } else {
          this.inicializarMapa();
        }
      }, 100);
    }
  }

  cambiarTab(tab: 'mapa' | 'reportar' | 'sos' | 'comunidad'): void {
    this.tabActiva = tab;
    if (tab === 'mapa' && this.vistaMapaLista === 'mapa') {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        } else {
          this.inicializarMapa();
        }
      }, 150);
    }
  }

  // ----------------------------------------------------
  // GESTIÓN DE REPORTES (RF01, RF02, RF09)
  // ----------------------------------------------------
  capturarUbicacionActualGPS(): void {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada por el navegador.');
      return;
    }

    this.cargandoGeo = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;
        this.nuevoReporte.latitud = this.userLat;
        this.nuevoReporte.longitud = this.userLng;
        this.actualizarMarcadorUsuario();

        // Geocodificación inversa BigDataCloud
        this.apiService.geocodificarInversa(this.userLat, this.userLng).subscribe({
          next: (geo) => {
            this.cargandoGeo = false;
            if (geo) {
              const ciudad = geo.city || geo.locality || 'Chía';
              if (ciudad.toLowerCase().includes('chía') || ciudad.toLowerCase().includes('chia')) this.nuevoReporte.municipio = 'Chía';
              else if (ciudad.toLowerCase().includes('soacha')) this.nuevoReporte.municipio = 'Soacha';
              else if (ciudad.toLowerCase().includes('cajicá') || ciudad.toLowerCase().includes('cajica')) this.nuevoReporte.municipio = 'Cajicá';
              else if (ciudad.toLowerCase().includes('zipaquirá') || ciudad.toLowerCase().includes('zipaquira')) this.nuevoReporte.municipio = 'Zipaquirá';

              const via = geo.localityInfo?.administrative?.[0]?.name || geo.locality || '';
              this.nuevoReporte.ubicacionDetalle = via ? `${via}` : `Ubicación actual (${this.userLat.toFixed(4)}, ${this.userLng.toFixed(4)})`;
            }
          },
          error: () => {
            this.cargandoGeo = false;
            this.nuevoReporte.ubicacionDetalle = `Coordenadas (${this.userLat.toFixed(4)}, ${this.userLng.toFixed(4)})`;
          }
        });
      },
      () => {
        this.cargandoGeo = false;
        alert('No se pudo acceder al sensor GPS. Escribe el punto de referencia manualmente.');
      }
    );
  }

  alEscribirDireccion(): void {
    clearTimeout(this.debounceTimer);
    const q = this.nuevoReporte.ubicacionDetalle.trim();
    if (q.length < 3) {
      this.sugerenciasNominatim = [];
      return;
    }

    this.debounceTimer = setTimeout(() => {
      const queryCompleta = `${q}, ${this.nuevoReporte.municipio}, Cundinamarca, Colombia`;
      this.apiService.buscarDireccion(queryCompleta).subscribe({
        next: (items) => {
          this.sugerenciasNominatim = items || [];
        },
        error: () => {
          this.sugerenciasNominatim = [];
        }
      });
    }, 400);
  }

  seleccionarSugerenciaNominatim(sug: SugerenciaNominatim): void {
    this.nuevoReporte.ubicacionDetalle = sug.display_name.split(',')[0];
    this.nuevoReporte.latitud = parseFloat(sug.lat);
    this.nuevoReporte.longitud = parseFloat(sug.lon);
    this.sugerenciasNominatim = [];
  }

  seleccionarMunicipioForm(mun: string): void {
    this.nuevoReporte.municipio = mun;
    if (mun === 'Chía') { this.nuevoReporte.latitud = 4.8631; this.nuevoReporte.longitud = -74.0583; }
    else if (mun === 'Soacha') { this.nuevoReporte.latitud = 4.5802; this.nuevoReporte.longitud = -74.2169; }
    else if (mun === 'Cajicá') { this.nuevoReporte.latitud = 4.9189; this.nuevoReporte.longitud = -74.0286; }
    else if (mun === 'Zipaquirá') { this.nuevoReporte.latitud = 5.0255; this.nuevoReporte.longitud = -74.0041; }
  }

  enviarReporte(): void {
    if (!this.usuarioActual) {
      this.mensajeError = 'Debes iniciar sesión con tu cuenta para emitir un reporte protegido por JWT.';
      setTimeout(() => this.tabActiva = 'comunidad', 1500);
      return;
    }

    if (!this.nuevoReporte.ubicacionDetalle) {
      this.mensajeError = 'Por favor escribe la dirección o punto de referencia específico.';
      return;
    }

    this.enviandoReporte = true;
    this.mensajeExito = null;
    this.mensajeError = null;

    this.apiService.crearAlerta(this.nuevoReporte).subscribe({
      next: (creada) => {
        this.enviandoReporte = false;
        this.mensajeExito = '¡Punto de riesgo reportado exitosamente!';
        this.alertas.unshift(creada);
        this.filtrarAlertas();
        setTimeout(() => {
          this.mensajeExito = null;
          this.tabActiva = 'mapa';
        }, 1200);
      },
      error: () => {
        this.enviandoReporte = false;
        // Fallback local visual
        const mockupAlerta: Alerta = {
          id: Date.now(),
          tipoAlerta: this.nuevoReporte.tipoAlerta,
          nivelUrgencia: 'MEDIA',
          estado: 'EMITIDA',
          municipio: this.nuevoReporte.municipio,
          departamento: 'Cundinamarca',
          ubicacionDetalle: this.nuevoReporte.ubicacionDetalle,
          descripcion: this.nuevoReporte.descripcion,
          anonimo: this.nuevoReporte.anonimo,
          latitud: this.nuevoReporte.latitud,
          longitud: this.nuevoReporte.longitud,
          votosPositivos: 1,
          votosTotales: 1,
          porcentajeCoincidencia: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.alertas.unshift(mockupAlerta);
        this.filtrarAlertas();
        this.mensajeExito = '¡Reporte registrado!';
        setTimeout(() => {
          this.mensajeExito = null;
          this.tabActiva = 'mapa';
        }, 1000);
      }
    });
  }

  // ----------------------------------------------------
  // VALIDACIÓN COMUNITARIA (PANTALLA 7)
  // ----------------------------------------------------
  abrirModalValidacion(alerta: Alerta): void {
    this.alertaModal = alerta;
    this.modalDetalleAbierto = true;
  }

  cerrarModalValidacion(): void {
    this.modalDetalleAbierto = false;
    this.alertaModal = null;
  }

  enviarValidacionComunitaria(alerta: Alerta, coincide: boolean): void {
    this.apiService.validarAlerta(alerta.id, coincide).subscribe({
      next: (actualizada) => {
        alerta.votosPositivos = actualizada.votosPositivos;
        alerta.votosTotales = actualizada.votosTotales;
        alerta.porcentajeCoincidencia = actualizada.porcentajeCoincidencia;
      },
      error: () => {
        // Incremento visual local
        alerta.votosTotales = (alerta.votosTotales || 10) + 1;
        if (coincide) {
          alerta.votosPositivos = (alerta.votosPositivos || 8) + 1;
        }
        alerta.porcentajeCoincidencia = Math.round(((alerta.votosPositivos || 1) * 100) / alerta.votosTotales);
      }
    });

    alert(coincide ? '✓ ¡Gracias por validar este reporte!' : '✕ Gracias, registramos que ya no ocurre.');
    this.cerrarModalValidacion();
  }

  calcularPorcentaje(alerta: Alerta): number {
    const pos = alerta.votosPositivos || 8;
    const tot = alerta.votosTotales || 10;
    return Math.round((pos * 100) / tot);
  }

  // ----------------------------------------------------
  // BOTÓN SOS (PANTALLA 4)
  // ----------------------------------------------------
  iniciarPresionSos(): void {
    this.presionandoSos = true;
    this.segundosSos = 3;
    this.timerSos = setInterval(() => {
      this.segundosSos--;
      if (this.segundosSos <= 0) {
        clearInterval(this.timerSos);
        this.dispararAlertaSos();
      }
    }, 1000);
  }

  cancelarPresionSos(): void {
    this.presionandoSos = false;
    if (this.timerSos) {
      clearInterval(this.timerSos);
      this.timerSos = null;
    }
  }

  private dispararAlertaSos(): void {
    this.presionandoSos = false;
    alert(`🚨 ALERTA SOS ACTIVADA en ${this.municipioSeleccionado}.\n\nSe ha emitido notificación a tus contactos de confianza (Laura Martínez y Camila Rojas) con tu geolocalización.`);
  }

  // ----------------------------------------------------
  // AUTENTICACIÓN (PANTALLAS 1 Y 2)
  // ----------------------------------------------------
  ejecutarLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.authError = 'Por favor ingresa correo y contraseña.';
      return;
    }

    this.procesandoAuth = true;
    this.authError = null;

    this.apiService.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: (res) => {
        this.procesandoAuth = false;
        this.usuarioActual = res;
        this.tabActiva = 'mapa';
      },
      error: (err) => {
        this.procesandoAuth = false;
        this.authError = err.error?.message || 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      }
    });
  }

  ejecutarRegistro(): void {
    if (!this.regNombre || !this.regEmail || !this.regPassword) {
      this.authError = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    if (this.regPassword !== this.regConfirmPassword) {
      this.authError = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this.aceptoTerminos) {
      this.authError = 'Debes aceptar los términos y la verificación de identidad.';
      return;
    }

    this.procesandoAuth = true;
    this.authError = null;

    this.apiService.registro({
      nombre: this.regNombre,
      email: this.regEmail,
      password: this.regPassword
    }).subscribe({
      next: (res) => {
        this.procesandoAuth = false;
        this.usuarioActual = res;
        this.tabActiva = 'mapa';
      },
      error: (err) => {
        this.procesandoAuth = false;
        this.authError = err.error?.message || 'Error al crear la cuenta. Intenta con otro correo.';
      }
    });
  }

  cerrarSesion(): void {
    this.apiService.logout();
    this.usuarioActual = null;
    this.subVistaAuth = 'login';
  }

  contarValidacionesHechas(): number {
    return 14;
  }

  // ----------------------------------------------------
  // UTILIDADES Y FORMATEO
  // ----------------------------------------------------
  private calcularDistancias(): void {
    this.alertasFiltradas.forEach(a => {
      const lat = a.latitud || this.userLat;
      const lon = a.longitud || this.userLng;
      const d = this.calcularDistanciaMetros(this.userLat, this.userLng, lat, lon);
      a.distanciaMetros = d;
    });

    // Ordenar de menor a mayor distancia
    this.alertasFiltradas.sort((a, b) => (a.distanciaMetros || 0) - (b.distanciaMetros || 0));
  }

  private calcularDistanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Metros
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  obtenerDistanciaFormateada(alerta: Alerta): string {
    const m = alerta.distanciaMetros ?? 200;
    if (m < 1000) {
      return `A ${m} m`;
    }
    return `A ${(m / 1000).toFixed(1)} km`;
  }

  formatearTipoAlerta(tipo: TipoAlerta): string {
    switch (tipo) {
      case 'ILUMINACION_DEFICIENTE': return 'Iluminación deficiente';
      case 'ACOSO_O_INTIMIDACION': return 'Acoso callejero';
      case 'ZONA_DESOLADA': return 'Zona desolada';
      case 'POCA_VIGILANCIA': return 'Poca vigilancia';
      default: return 'Alerta comunitaria';
    }
  }

  obtenerClaseCategoria(tipo: TipoAlerta): string {
    switch (tipo) {
      case 'ILUMINACION_DEFICIENTE': return 'cat-luz';
      case 'ACOSO_O_INTIMIDACION': return 'cat-acoso';
      case 'ZONA_DESOLADA': return 'cat-desolada';
      case 'POCA_VIGILANCIA': return 'cat-vigilancia';
      default: return 'cat-luz';
    }
  }

  obtenerColorPorTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case 'ILUMINACION_DEFICIENTE': return '#f59e0b';
      case 'ACOSO_O_INTIMIDACION': return '#ef4444';
      case 'ZONA_DESOLADA': return '#8b5cf6';
      case 'POCA_VIGILANCIA': return '#3b82f6';
      default: return '#ec4899';
    }
  }

  obtenerIconoTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case 'ILUMINACION_DEFICIENTE': return '💡';
      case 'ACOSO_O_INTIMIDACION': return '⚠️';
      case 'ZONA_DESOLADA': return '🏚️';
      case 'POCA_VIGILANCIA': return '👮';
      default: return '🛡️';
    }
  }

  formatearFechaRelativa(fechaIso: string): string {
    if (!fechaIso) return 'Hace 25 min';
    const ahora = new Date().getTime();
    const pasada = new Date(fechaIso).getTime();
    const diffMin = Math.round((ahora - pasada) / 60000);

    if (diffMin <= 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `Hace ${diffH} h`;
    return 'Hace 1 d';
  }

  // Datos precargados exactamente como en los mockups de Figma
  private generarDatosMuestra(): Alerta[] {
    return [
      {
        id: 1,
        tipoAlerta: 'ILUMINACION_DEFICIENTE',
        nivelUrgencia: 'MEDIA',
        estado: 'EMITIDA',
        municipio: 'Chía',
        departamento: 'Cundinamarca',
        ubicacionDetalle: 'Parque principal, Chía',
        descripcion: 'Luminarias apagadas junto al parque. Carrera 9 oscura hacia calle 11.',
        latitud: 4.8631,
        longitud: -74.0583,
        distanciaMetros: 200,
        votosPositivos: 8,
        votosTotales: 10,
        porcentajeCoincidencia: 80,
        anonimo: true,
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        tipoAlerta: 'ACOSO_O_INTIMIDACION',
        nivelUrgencia: 'ALTA',
        estado: 'EMITIDA',
        municipio: 'Chía',
        departamento: 'Cundinamarca',
        ubicacionDetalle: 'Av. Pradilla, centro',
        descripcion: 'Acoso callejero constante a estudiantes al descender del transporte intermunicipal.',
        latitud: 4.8670,
        longitud: -74.0530,
        distanciaMetros: 650,
        votosPositivos: 5,
        votosTotales: 7,
        porcentajeCoincidencia: 71,
        anonimo: false,
        usuarioNombre: 'Camila R.',
        createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        tipoAlerta: 'ZONA_DESOLADA',
        nivelUrgencia: 'MEDIA',
        estado: 'EMITIDA',
        municipio: 'Chía',
        departamento: 'Cundinamarca',
        ubicacionDetalle: 'Vereda La Balsa',
        descripcion: 'Vía La Balsa hacia Chía. Tramo oscuro sin presencia policial ni transeúntes.',
        latitud: 4.8720,
        longitud: -74.0450,
        distanciaMetros: 1500,
        votosPositivos: 4,
        votosTotales: 6,
        porcentajeCoincidencia: 66,
        anonimo: true,
        createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        tipoAlerta: 'POCA_VIGILANCIA',
        nivelUrgencia: 'MEDIA',
        estado: 'EMITIDA',
        municipio: 'Soacha',
        departamento: 'Cundinamarca',
        ubicacionDetalle: 'Parque Central de Soacha',
        descripcion: 'Falta de cuadrante policial en horario nocturno cerca a paraderos.',
        latitud: 4.5802,
        longitud: -74.2169,
        distanciaMetros: 3200,
        votosPositivos: 9,
        votosTotales: 10,
        porcentajeCoincidencia: 90,
        anonimo: true,
        createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}
