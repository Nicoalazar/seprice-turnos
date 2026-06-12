import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'acreditacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/acreditacion/acreditacion.component')
        .then(m => m.AcreditacionComponent)
  },

  {
    path: 'verificar-autorizacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/verificar-autorizacion/verificar-autorizacion.component')
        .then(m => m.VerificarAutorizacionComponent)
  },

  {
    path: 'sobreturnos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/turnos/sobreturno/sobreturno.component')
        .then(m => m.SobreturnoComponent)
  },
  {
    path: 'cancelar-turno',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/turnos/cancelar-turno/cancelar-turno.component')
        .then(m => m.CancelarTurnoComponent)
  },
  {
    path: 'agenda',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/turnos/agenda/agenda.component')
        .then(m => m.AgendaComponent)
  },
  {
    path: 'turnos/registrar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/turnos/registrar-turno/registrar-turno.component')
        .then(m => m.RegistrarTurnoComponent)
  },
  {
    path: 'crear-usuario',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/usuarios/crear-usuario/crear-usuario.component')
        .then(m => m.CrearUsuarioComponent)
  },
  {
    path: 'configurar-agenda',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/turnos/configurar-agenda/configurar-agenda.component')
        .then(m => m.ConfigurarAgendaComponent)
  },
  {
    path: 'sala-espera',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/turnos/sala-espera/sala-espera.component')
        .then(m => m.SalaEsperaComponent)
  },
  {
    path: 'liquidacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/liquidacion/generar-liquidacion/generar-liquidacion.component')
        .then(m => m.GenerarLiquidacionComponent)
  },
  {
    path: 'mi-liquidacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/liquidacion/consultar-liquidacion/consultar-liquidacion.component')
        .then(m => m.ConsultarLiquidacionComponent)
  },
  {
    path: 'registrar-atencion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/registrar-atencion/registrar-atencion.component')
        .then(m => m.RegistrarAtencionComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
