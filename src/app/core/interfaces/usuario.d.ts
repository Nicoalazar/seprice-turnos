export type RolUsuario = 'ADMIN' | 'MEDICO';

export interface Usuario {
  id: string;
  email: string;
  password: string;
  rol: RolUsuario;
  activo: boolean;
  creadoEn: string;
}
