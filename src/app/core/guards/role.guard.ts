import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../auth/login.service';
import { RolUsuario } from '../interfaces/usuario.d';

// Guard que restringe el acceso a una ruta según el rol del usuario logueado.
// SUPER tiene acceso a todas las rutas (puede alternar vista ADMIN/MEDICO desde el header).
export const roleGuard = (rolesPermitidos: RolUsuario[]): CanActivateFn => () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  const usuario = loginService.getUsuarioActual();

  if (!usuario) {
    return router.createUrlTree(['/login']);
  }

  if (usuario.rol === 'SUPER' || rolesPermitidos.includes(usuario.rol)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
