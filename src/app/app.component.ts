import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  rol = signal<Rol>('admin');

  setRol(nuevoRol: Rol): void {
    this.rol.set(nuevoRol);
  }

  getPillClass(estado: EstadoTurno): string {
    return `pill-${estado}`;
  }

  turnosAdmin: FilaTurno[] = [
    { hora: '09:00', paciente: 'García, Luis',  medico: 'Dr. Méndez',  estado: 'acreditado' },
    { hora: '09:15', paciente: 'Romero, Ana',   medico: 'Dr. Méndez',  estado: 'pendiente'  },
    { hora: '09:30', paciente: 'López, Marta',  medico: 'Dra. Torres', estado: 'acreditado' },
    { hora: '09:45', paciente: 'Pérez, Juan',   medico: 'Dra. Torres', estado: 'cancelado'  },
    { hora: '10:00', paciente: 'Soria, Elena',  medico: 'Dr. Méndez',  estado: 'pendiente'  },
  ];

  turnosMedico: FilaTurno[] = [
    { hora: '09:00', paciente: 'García, Luis',  motivo: 'Control',     estado: 'atendido'  },
    { hora: '09:15', paciente: 'Romero, Ana',   motivo: 'Consulta',    estado: 'atendido'  },
    { hora: '09:30', paciente: 'López, Marta',  motivo: 'Seguimiento', estado: 'pendiente' },
    { hora: '09:45', paciente: 'Soria, Elena',  motivo: 'Primera vez', estado: 'pendiente' },
  ];
}