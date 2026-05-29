export type ResultadoVerificacion = 'autorizado' | 'no-autorizado' | 'pendiente';

export interface CoberturaMock {
  estado: ResultadoVerificacion;
  descripcion: string;
  codigoAutorizacion?: string;
  coberturaPct: string;
  copago: string;
  topeAnual: string;
  requiereOrden: string;
}

export interface PacienteVerificacion {
  id: number;
  iniciales: string;
  colorAvatar: string;
  nombre: string;
  apellido: string;
  dni: string;
  dniDisplay: string;
  obraSocial: string;
  planesDisponibles: string[];
  planPredeterminado: string;
  nroAfiliado: string;
  medico: string;
  prestacionNombre: string;
  codigoPrestacionDefault: string;
  cobertura: CoberturaMock;
}
