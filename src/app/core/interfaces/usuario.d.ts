export type RolUsuario = 'ADMIN' | 'MEDICO' | 'SUPER' | 'RECEPCIONISTA';

export interface Usuario {
  id: string;
  email: string;
  password: string;
  rol: RolUsuario;
  activo: boolean;
  creadoEn: string;
}
