import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { CommonModule } from '@angular/common';
import { RolUsuario } from './core/interfaces/usuario';
import { RolService } from './core/services/rol.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, BackButtonComponent, CommonModule],
  template: `
    <app-header *ngIf="!isLoginRoute()" (rolActivoChange)="cambiarRol($event)"></app-header>
    <app-back-button *ngIf="shouldShowFloatingButton()"></app-back-button>
    <main [class.app-main]="!isLoginRoute()" [class.app-main-fullscreen]="isLoginRoute()"><router-outlet /></main>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private rolService = inject(RolService);
  private router = inject(Router);

  isLoginRoute(): boolean {
    return this.router.url === '/login';
  }

  shouldShowFloatingButton(): boolean {
    const url = this.router.url;
    return url !== '/login' && url !== '/dashboard';
  }

  cambiarRol(rol: RolUsuario): void {
    this.rolService.setRolActivo(rol);
  }
}