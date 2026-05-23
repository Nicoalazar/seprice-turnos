import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { SobreturnoComponent } from './pages/turnos/sobreturno/sobreturno.component';
import { CancelarTurnoComponent } from './pages/turnos/cancelar-turno/cancelar-turno.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'dashboard', component: DashboardComponent},
    {path: 'sobreturnos', component: SobreturnoComponent},
    {path: 'cancelar-turno', component: CancelarTurnoComponent}, 
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'}
];