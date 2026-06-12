export interface Atencion {
  id: string;
  turnoId: string;
  medicoId: string;
  diagnostico: string;
  prescripciones?: string;
  derivacion?: string;
  registradoEn: string;
}
