import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'dashboard', component: DashboardComponent},
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'}
];
