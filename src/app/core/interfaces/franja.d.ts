export interface FranjaVista {
  hora: string;
  paciente: string;
  motivo: string;
  obraSocial: string;
  tipo: string;
  estado: string;
  turnoId: string;
}

export interface Franja {
  id: string;
  agendaId: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // "09:00"
  disponible: boolean;
  sobreturno: boolean;
  creadoEn?: string;
}

export interface FranjaConAgenda extends Franja {
  agenda?: {
    medicoId: string;
    duracionMin: number;
  };
}
