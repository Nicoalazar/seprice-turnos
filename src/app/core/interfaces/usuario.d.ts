export type RolUsuario = 'SUPER' | 'RECEPCIONISTA' | 'MEDICO';

export interface Usuario {
  id: string;
  email: string;
  password: string;
  rol: RolUsuario;
  activo: boolean;
  creadoEn: Date;
}