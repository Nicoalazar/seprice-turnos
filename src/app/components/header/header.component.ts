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
  usuarioActual: any = null;
  rolRealUsuario: string = 'RECEPCIONISTA';
  nombreUsuario: string = '';
  iniciales: string = '';

  constructor() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    const usuarioJson = localStorage.getItem('usuarioLogueado');
    if (usuarioJson) {
      this.usuarioActual = JSON.parse(usuarioJson);
      this.rolRealUsuario = this.usuarioActual.rol || 'RECEPCIONISTA';

      // Obtener email del usuario
      if (this.usuarioActual.email) {
        this.nombreUsuario = this.usuarioActual.email;
        // Calcular iniciales basadas en email
        this.iniciales = this.usuarioActual.email.substring(0, 2).toUpperCase();
      }

      // Si el rol es SUPER, iniciar con ADMIN, si no con el rol correspondiente
      if (this.rolRealUsuario === 'SUPER') {
        this.rolActivo = 'ADMIN';
      } else if (this.rolRealUsuario === 'MEDICO') {
        this.rolActivo = 'MEDICO';
      } else {
        this.rolActivo = 'ADMIN';
      }
    }
  }

  esSuperUsuario(): boolean {
    return this.rolRealUsuario === 'SUPER';
  }

  esMedico(): boolean {
    return this.rolRealUsuario === 'MEDICO';
  }

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
