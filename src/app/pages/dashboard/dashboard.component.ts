import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../components/header/header.component";
import { RolUsuario } from '../../core/interfaces/usuario';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  // Rol activo: determina qué vista se muestra lo recibe de HeaderComponent
  @Input() rolActivo: RolUsuario = 'RECEPCIONISTA';

  // Datos mockeados para el dashboard del administrativo
  turnosAdmin = [
    { hora: '09:00', paciente: 'García, Luis',   medico: 'Dr. Méndez',  estado: 'acreditado' },
    { hora: '09:15', paciente: 'Romero, Ana',    medico: 'Dr. Méndez',  estado: 'pendiente'  },
    { hora: '09:30', paciente: 'López, Marta',   medico: 'Dra. Torres', estado: 'acreditado' },
    { hora: '09:45', paciente: 'Pérez, Juan',    medico: 'Dra. Torres', estado: 'cancelado'  },
    { hora: '10:00', paciente: 'Soria, Elena',   medico: 'Dr. Méndez',  estado: 'pendiente'  },
  ];

  // Datos mockeados para el dashboard del médico
  turnosMedico = [
    { hora: '09:00', paciente: 'García, Luis',  motivo: 'Control',     estado: 'atendido'  },
    { hora: '09:15', paciente: 'Romero, Ana',   motivo: 'Consulta',    estado: 'atendido'  },
    { hora: '09:30', paciente: 'López, Marta',  motivo: 'Seguimiento', estado: 'pendiente' },
    { hora: '09:45', paciente: 'Soria, Elena',  motivo: 'Primera vez', estado: 'pendiente' },
  ];

  // Devuelve la clase CSS según el estado del turno
  getClasePill(estado: string): string {
    return 'pill-' + estado;
  }
}