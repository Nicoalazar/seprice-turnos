export type RolUsuario = 'admin' | 'medico';

export interface Medico {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  rol: RolUsuario;
}