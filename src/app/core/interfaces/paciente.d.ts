export interface Paciente {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNac: string;
  telefono: string;
  obraSocial: string | null;
  creadoEn: string;
}
