import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { AcreditacionComponent } from './pages/acreditacion/acreditacion.component';
import { AgendaMedicoComponent } from './pages/agenda-medico/agenda-medico.component';
import { VerificarAutorizacionComponent } from './pages/verificar-autorizacion/verificar-autorizacion.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'acreditacion', component: AcreditacionComponent },
    { path: 'atencion/agenda-medico', component: AgendaMedicoComponent },
    { path: 'verificar-autorizacion', component: VerificarAutorizacionComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
