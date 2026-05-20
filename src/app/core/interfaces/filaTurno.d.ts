type EstadoTurno = 'acreditado' | 'pendiente' | 'cancelado' | 'atendido';

interface FilaTurno {
  hora: string;
  paciente: string;
  medico?: string;
  motivo?: string;
  estado: EstadoTurno;
}