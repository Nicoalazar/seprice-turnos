export type EstadoTurno = 'confirmado' | 'presente en sala' | 'atendido' | 'cancelado' | 'ausente';
export type TipoTurno = 'normal' | 'sobreturno';

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