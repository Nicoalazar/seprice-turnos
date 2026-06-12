import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../auth/login.service';

// Guard que bloquea acceso a rutas si el usuario no está logueado
export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.estaLogueado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
