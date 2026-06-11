import { RolUsuario } from './usuario.d';

export interface Medico {
  id: string;
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  tarifa: number;
  usuarioId: string;
  usuario?: {
    email: string;
    rol: RolUsuario;
  };
}
