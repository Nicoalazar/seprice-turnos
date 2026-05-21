import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RolUsuario } from '../../core/interfaces/usuario';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {

  rol = signal<RolUsuario>('MEDICO');
  
    setRol(nuevoRol: RolUsuario): void {
      this.rol.set(nuevoRol);
    }
  
    getPillClass(estado: EstadoTurno): string {
      return `pill-${estado}`;
    }

}
