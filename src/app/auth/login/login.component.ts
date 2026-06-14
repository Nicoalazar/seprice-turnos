import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '../login.service';

// Componente que muestra el formulario de login
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Variables para guardar los datos del formulario
  email: string = '';
  password: string = '';

  // Variable para controlar si se está cargando (mientras se hace login)
  cargando: boolean = false;

  // Variable para guardar el mensaje de error (si hay)
  error: string = '';

  // Variable para mostrar/ocultar contraseña
  mostrarPassword: boolean = false;

  // Inyectamos el servicio de login y router usando inject() (forma moderna de Angular 17)
  private loginService = inject(LoginService);
  private router = inject(Router);

  // Método para alternar la visibilidad de la contraseña
  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // Método que se ejecuta cuando el usuario hace click en "Iniciar Sesión"
  async iniciarSesion(): Promise<void> {
    // Verificar que los campos no estén vacíos
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    // Limpiar errores anteriores
    this.error = '';

    // Mostrar que se está cargando
    this.cargando = true;

    // Llamar al servicio para hacer login
    const resultado = await this.loginService.login(this.email, this.password);

    // Ocultar el estado de carga
    this.cargando = false;

    // Verificar si hubo error
    if (!resultado.exito) {
      this.error = resultado.error || 'Error desconocido';
      return;
    }

    // Si el login fue exitoso
    this.router.navigate(['/dashboard']);
  }
}
