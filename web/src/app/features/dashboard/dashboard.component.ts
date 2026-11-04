import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Alerta, Estadisticas } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <header style="margin-bottom: 2rem; border-bottom: 1px solid #334155; padding-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 2rem; font-weight: 800; color: #a78bfa;">🛡️ Angel Shot</h1>
          <p style="color: #94a3b8;">Centro de Monitoreo y Asistencia Discreta en Tiempo Real</p>
        </div>
        <span style="background: #059669; padding: 0.4rem 0.8rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 700;">
          SISTEMA EN LÍNEA
        </span>
      </header>

      <!-- Métricas rápidas -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div style="background: #1e293b; padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid #3b82f6;">
          <p style="color: #94a3b8; font-size: 0.875rem;">Total de Alertas</p>
          <h2 style="font-size: 1.8rem; font-weight: bold; margin-top: 0.25rem;">{{ stats?.totalAlertas ?? 0 }}</h2>
        </div>

        <div style="background: #1e293b; padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid #ef4444;">
          <p style="color: #94a3b8; font-size: 0.875rem;">Emitidas / Pendientes</p>
          <h2 style="font-size: 1.8rem; font-weight: bold; margin-top: 0.25rem; color: #f87171;">{{ stats?.alertasEmitidas ?? 0 }}</h2>
        </div>

        <div style="background: #1e293b; padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid #06b6d4;">
          <p style="color: #94a3b8; font-size: 0.875rem;">En Atención</p>
          <h2 style="font-size: 1.8rem; font-weight: bold; margin-top: 0.25rem; color: #38bdf8;">{{ stats?.alertasEnAtencion ?? 0 }}</h2>
        </div>

        <div style="background: #1e293b; padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid #10b981;">
          <p style="color: #94a3b8; font-size: 0.875rem;">Resueltas / A Salvo</p>
          <h2 style="font-size: 1.8rem; font-weight: bold; margin-top: 0.25rem; color: #34d399;">{{ stats?.alertasResueltas ?? 0 }}</h2>
        </div>
      </div>

      <!-- Tabla de Alertas Recientes -->
      <div style="background: #1e293b; border-radius: 0.75rem; padding: 1.5rem; overflow-x: auto;">
        <h3 style="font-size: 1.25rem; margin-bottom: 1rem; color: #f1f5f9;">Alertas en Monitoreo</h3>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid #334155; color: #94a3b8; font-size: 0.85rem;">
              <th style="padding: 0.75rem;">ID</th>
              <th style="padding: 0.75rem;">Tipo</th>
              <th style="padding: 0.75rem;">Urgencia</th>
              <th style="padding: 0.75rem;">Ubicación</th>
              <th style="padding: 0.75rem;">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let alerta of alertas" style="border-bottom: 1px solid #334155; font-size: 0.9rem;">
              <td style="padding: 0.75rem;">#{{ alerta.id }}</td>
              <td style="padding: 0.75rem; font-weight: 600;">{{ alerta.tipoAlerta }}</td>
              <td style="padding: 0.75rem;">
                <span [style.color]="alerta.nivelUrgencia === 'CRITICA' ? '#f87171' : '#38bdf8'">
                  {{ alerta.nivelUrgencia }}
                </span>
              </td>
              <td style="padding: 0.75rem;">{{ alerta.ubicacionDetalle || 'GPS reportado' }}</td>
              <td style="padding: 0.75rem;">
                <span style="background: #334155; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">
                  {{ alerta.estado }}
                </span>
              </td>
            </tr>
            <tr *ngIf="alertas.length === 0">
              <td colspan="5" style="padding: 2rem; text-align: center; color: #64748b;">
                No hay alertas activas en el sistema.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  alertas: Alerta[] = [];
  stats?: Estadisticas;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.apiService.getEstadisticas().subscribe({
      next: (res) => this.stats = res,
      error: () => {}
    });

    this.apiService.getAlertas().subscribe({
      next: (res) => this.alertas = res,
      error: () => {}
    });
  }
}
