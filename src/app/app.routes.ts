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
    path: 'acreditacion',
    loadComponent: () =>
      import('./pages/acreditacion/acreditacion.component')
        .then(m => m.AcreditacionComponent)
  },

  {
    path: 'verificar-autorizacion',
    loadComponent: () =>
      import('./pages/verificar-autorizacion/verificar-autorizacion.component')
        .then(m => m.VerificarAutorizacionComponent)
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
    path: 'turnos/registrar',
    loadComponent: () =>
      import('./pages/turnos/registrar-turno/registrar-turno.component')
        .then(m => m.RegistrarTurnoComponent)
  },
  {
    path: 'crear-usuario',
    loadComponent: () =>
      import('./pages/usuarios/crear-usuario/crear-usuario.component')
        .then(m => m.CrearUsuarioComponent)
  },
  {
    path: 'configurar-agenda',
    loadComponent: () =>
      import('./pages/turnos/configurar-agenda/configurar-agenda.component')
        .then(m => m.ConfigurarAgendaComponent)
  },
  {
    path: 'sala-espera',
    loadComponent: () =>
      import('./pages/turnos/sala-espera/sala-espera.component')
        .then(m => m.SalaEsperaComponent)
  },
  {
    path: 'liquidacion',
    loadComponent: () =>
      import('./pages/liquidacion/generar-liquidacion/generar-liquidacion.component')
        .then(m => m.GenerarLiquidacionComponent)
  },
  {
    path: 'mi-liquidacion',
    loadComponent: () =>
      import('./pages/liquidacion/consultar-liquidacion/consultar-liquidacion.component')
        .then(m => m.ConsultarLiquidacionComponent)
  },
  {
    path: 'registrar-atencion',
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
