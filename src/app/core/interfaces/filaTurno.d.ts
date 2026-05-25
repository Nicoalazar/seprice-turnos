import { EstadoTurno } from './turno';

export type EstadoTurno = 'confirmado' | 'presente en sala' | 'atendido' | 'cancelado' | 'ausente';

interface FilaTurno {
  hora: string;
  paciente: string;
  medico?: string;
  motivo?: string;
  estado: EstadoTurno;
}