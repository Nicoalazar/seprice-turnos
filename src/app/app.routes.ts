import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  {
    path: 'sobreturnos',
    loadComponent: () =>
      import('./pages/turnos/sobreturno/sobreturno.component')
        .then(m => m.SobreturnoComponent)
  },

  {
    path: 'cancelar-turno',
    loadComponent: () =>
      import('./pages/turnos/cancelar-turno/cancelar-turno.component')
        .then(m => m.CancelarTurnoComponent)
  },

  {
    path: 'agenda',
    loadComponent: () =>
      import('./pages/turnos/agenda/agenda.component')
        .then(m => m.AgendaComponent)
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];