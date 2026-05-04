export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  obraSocial: string;
  autorizacion?: 'autorizado' | 'rechazado' | 'pendiente';
}