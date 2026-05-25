import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RolUsuario } from '../../core/interfaces/usuario';
import { LoginService } from '../../auth/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {

  private loginService = inject(LoginService);

  rol = signal<RolUsuario>('MEDICO');
  
    setRol(nuevoRol: RolUsuario): void {
      this.rol.set(nuevoRol);
    }
  
    getPillClass(estado: EstadoTurno): string {
      return `pill-${estado}`;
    }

    logout(): void {
      Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que quieres cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.loginService.logout();
          Swal.fire('¡Sesión cerrada!', 'Has cerrado sesión exitosamente.', 'success');
        }
      });
    }

}
