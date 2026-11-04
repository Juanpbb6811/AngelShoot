export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  tipo: string;
  id: number;
  nombre: string;
  email: string;
  roles: string[];
}

export type TipoAlerta = 
  | 'ILUMINACION_DEFICIENTE'
  | 'ACOSO_O_INTIMIDACION'
  | 'ZONA_DESOLADA'
  | 'POCA_VIGILANCIA'
  | 'ANGEL_SHOT_SOLO' 
  | 'ANGEL_SHOT_CON_HIELO' 
  | 'ANGEL_SHOT_CON_LIMA' 
  | 'EMERGENCIA_MEDICA';

export type EstadoAlerta = 
  | 'EMITIDA' 
  | 'EN_ATENCION' 
  | 'ASISTENCIA_EN_CURSO' 
  | 'RESUELTA' 
  | 'CANCELADA';

export type NivelUrgencia = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Alerta {
  id: number;
  usuarioId?: number;
  usuarioNombre?: string;
  usuarioTelefono?: string;
  establecimientoId?: number;
  establecimientoNombre?: string;
  tipoAlerta: TipoAlerta;
  nivelUrgencia: NivelUrgencia;
  estado: EstadoAlerta;
  municipio?: string;
  departamento?: string;
  activo?: boolean;
  latitud?: number;
  longitud?: number;
  ubicacionDetalle?: string;
  descripcion?: string;
  codigoSeguridad?: string;
  distanciaKm?: number;
  distanciaMetros?: number;
  votosPositivos?: number;
  votosTotales?: number;
  porcentajeCoincidencia?: number;
  anonimo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearAlertaRequest {
  tipoAlerta: TipoAlerta;
  nivelUrgencia?: NivelUrgencia;
  municipio: string;
  departamento?: string;
  ubicacionDetalle: string;
  latitud?: number;
  longitud?: number;
  descripcion?: string;
  anonimo?: boolean;
  establecimientoId?: number;
}

export interface Establecimiento {
  id: number;
  nombre: string;
  direccion: string;
  tipo: string;
  latitud: number;
  longitud: number;
  telefonoContacto?: string;
  activo: boolean;
}

export interface Estadisticas {
  totalAlertas: number;
  alertasEmitidas: number;
  alertasEnAtencion: number;
  alertasResueltas: number;
  alertasCanceladas: number;
  totalEstablecimientos: number;
  totalUsuarios: number;
  alertasPorTipo: Record<string, number>;
}
