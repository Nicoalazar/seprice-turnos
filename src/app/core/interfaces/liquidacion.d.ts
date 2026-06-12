export interface Liquidacion {
  id: string;
  medicoId: string;
  periodoDesde: string;
  periodoHasta: string;
  cantTurnos: number;
  montoUnitario: number;
  montoTotal: number;
  generadaEn: string;
}
