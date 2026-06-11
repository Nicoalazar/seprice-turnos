export type TipoFranja = 'Normal' | 'Sobreturno' | 'Seguimiento';
export type EstadoFranja = 'Atendido' | 'En espera' | 'Acreditado' | 'Confirmado' | 'Libre';

export interface FranjaAgenda {
  hora: string;
  paciente: string;
  motivo: string;
  obraSocial: string;
  tipo: TipoFranja;
  estado: EstadoFranja;
}

export interface SobreturnoItem {
  id: string;
  fecha: string;
  hora: string;
  pacienteId: string;
  medicoId: string;
  consultorio: string;
  estado: string;
  tipo: string;
  motivo: string;
}
