import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
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
  
  @Output() rolActivoChange = new EventEmitter<RolUsuario>();

  rolActivo: RolUsuario = 'MEDICO';

  cambiarRol(rolActivo: RolUsuario): void {
    this.rolActivo = rolActivo;
    this.rolActivoChange.emit(rolActivo);
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
