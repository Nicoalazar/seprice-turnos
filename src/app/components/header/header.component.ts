import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RolUsuario } from '../../core/interfaces/usuario';
import { LoginService } from '../../auth/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule, MatDividerModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {

  private loginService = inject(LoginService);
  
  @Output() rolActivoChange = new EventEmitter<RolUsuario>();

  rolActivo: RolUsuario = 'ADMIN';

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

  irAPerfil(): void {
    alert('Función para ir al perfil del usuario');
  }

}
