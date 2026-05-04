export type EstadoTurno = 'pendiente' | 'acreditado' | 'atendido' | 'cancelado';
export type TipoTurno = 'normal' | 'sobreturno' | 'seguimiento';

export interface Turno {
  id: string;
  fecha: Date;
  hora: string;
  pacienteId: string;
  medicoId: string;
  consultorio: string;
  estado: EstadoTurno;
  tipo: TipoTurno;
}