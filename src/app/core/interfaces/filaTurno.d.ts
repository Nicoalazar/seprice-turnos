import { EstadoTurno } from './turno';

interface FilaTurno {
  hora: string;
  paciente: string;
  medico?: string;
  motivo?: string;
  estado: EstadoTurno;
}