export interface Liquidacion {
  id: string;
  medicoId: string;
  periodo: string;
  prestaciones: number;
  montoTotal: number;
  generadaEn: Date;
}