import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolUsuario } from '../../core/interfaces/usuario';
import { Router } from '@angular/router';
import { RolService } from '../../core/services/rol.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  private router = inject(Router);
  private rolService = inject(RolService);

  rolActivo: RolUsuario = 'RECEPCIONISTA';

  constructor() {
    this.rolService.rolActivo$.subscribe(rol => {
      this.rolActivo = rol;
    });
  }

  // Datos mockeados para el dashboard del administrativo
  turnosAdmin = [
    { hora: '09:00', paciente: 'García, Luis',   medico: 'Dr. Méndez',  estado: 'presente en sala' },
    { hora: '09:15', paciente: 'Romero, Ana',    medico: 'Dr. Méndez',  estado: 'confirmado'  },
    { hora: '09:30', paciente: 'López, Marta',   medico: 'Dra. Torres', estado: 'presente en sala' },
    { hora: '09:45', paciente: 'Pérez, Juan',    medico: 'Dra. Torres', estado: 'cancelado'  },
    { hora: '10:00', paciente: 'Soria, Elena',   medico: 'Dr. Méndez',  estado: 'confirmado'  },
  ];

  // Datos mockeados para el dashboard del médico
  turnosMedico = [
    { hora: '09:00', paciente: 'García, Luis',  motivo: 'Control',     estado: 'atendido'  },
    { hora: '09:15', paciente: 'Romero, Ana',   motivo: 'Consulta',    estado: 'atendido'  },
    { hora: '09:30', paciente: 'López, Marta',  motivo: 'Seguimiento', estado: 'presente en sala' },
    { hora: '09:45', paciente: 'Soria, Elena',  motivo: 'Primera vez', estado: 'presente en sala' },
  ];

  getClasePill(estado: string): string {
    return 'pill-' + estado.replace(/ /g, '-');
  }

  // Funciones para manejar las acciones rápidas y navegar a las páginas correspondientes
  nuevoTurno() {
    this.router.navigate(['/agenda']);
  }

  sobreturno() {
    this.router.navigate(['/sobreturnos'])
  }

  acreditarPaciente() {
    this.router.navigate(['/acreditacion']);
  }

  verificarAutorizacion() {
    this.router.navigate(['/verificar-autorizacion']);
  }

  liquidarHonorarios() {
    alert('Función para liquidar honorarios');
  }

  verAgenda() {
    this.router.navigate(['agenda'])
  }

  registrarAtencion() {
    alert('Función para registrar atención');
  }

  turnoSeguimiento() {
    alert('Función para recitar turno de seguimiento');
  }

}