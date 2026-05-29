import { EstadoTurno } from './turno';

export interface TurnoHoy {
  fecha: string;
  hora: string;
  medico: string;
  especialidad: string;
  estado: EstadoTurno;
}

export interface Cobertura {
  estado: 'autorizado' | 'rechazado' | 'sin-cobertura';
  obraSocial?: string;
  prestacion?: string;
  codigo?: string;
}

export interface PacienteAcreditacion {
  id: number;
  iniciales: string;
  colorAvatar: string;
  nombre: string;
  apellido: string;
  dni: string;
  dniDisplay: string;
  fechaNacimiento: string;
  telefono: string;
  obraSocial: string | null;
  nroAfiliado: string | null;
  turnoHoy: TurnoHoy | null;
  cobertura: Cobertura;
}
