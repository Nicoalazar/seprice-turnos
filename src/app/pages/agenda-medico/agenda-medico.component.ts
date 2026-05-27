import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { RolUsuario } from '../../core/interfaces/usuario';

export type TipoTurno  = 'Normal' | 'Seguimiento' | 'Sobreturno';
export type EstadoTurno = 'Atendido' | 'En espera' | 'Acreditado' | 'Confirmado';

export interface TurnoAgenda {
  id: number;
  hora: string;       // 'HH:mm' — se usa para ordenar
  paciente: string;
  motivo: string;
  obraSocial: string;
  tipo: TipoTurno;
  estado: EstadoTurno;
}

@Component({
  selector: 'app-agenda-medico',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './agenda-medico.component.html',
  styleUrls: ['./agenda-medico.component.css']
})
export class AgendaMedicoComponent {
  private router = inject(Router);

  rolActivo: RolUsuario = 'MEDICO';

  readonly fechaHoy = 'Lunes 5 de mayo, 2026';
  readonly especialidad = 'Clínica Médica';

  // ── Datos mockeados (ordenados por hora) ──────────────────────────────────
  agenda: TurnoAgenda[] = [
    { id: 1, hora: '09:00', paciente: 'García, Luis',    motivo: 'Control',      obraSocial: 'OSDE 310',       tipo: 'Normal',      estado: 'Atendido'   },
    { id: 2, hora: '09:15', paciente: 'Romero, Ana',     motivo: 'Consulta',     obraSocial: 'Swiss Medical',  tipo: 'Normal',      estado: 'Atendido'   },
    { id: 3, hora: '09:30', paciente: 'López, Marta',    motivo: 'Seguimiento',  obraSocial: 'Medifé',         tipo: 'Seguimiento', estado: 'En espera'  },
    { id: 4, hora: '09:45', paciente: 'Soria, Elena',    motivo: 'Primera vez',  obraSocial: 'Galeno',         tipo: 'Normal',      estado: 'En espera'  },
    { id: 5, hora: '10:00', paciente: 'Castro, Tomás',   motivo: 'Control',      obraSocial: 'Particular',     tipo: 'Normal',      estado: 'Acreditado' },
    { id: 6, hora: '10:15', paciente: 'Flores, Diana',   motivo: 'Derivación',   obraSocial: 'OSDE 410',       tipo: 'Sobreturno',  estado: 'Acreditado' },
    { id: 7, hora: '10:30', paciente: 'Vera, Miguel',    motivo: 'Consulta',     obraSocial: 'Swiss Medical',  tipo: 'Normal',      estado: 'Confirmado' },
    { id: 8, hora: '10:45', paciente: 'Ríos, Patricia',  motivo: 'Control',      obraSocial: 'Medifé',         tipo: 'Normal',      estado: 'Confirmado' },
  ];

  // ── Métricas ──────────────────────────────────────────────────────────────
  get totalAsignados(): number { return this.agenda.length; }
  get totalAtendidos(): number { return this.agenda.filter(t => t.estado === 'Atendido').length; }
  get totalEnEspera(): number  { return this.agenda.filter(t => t.estado === 'En espera').length; }
  get totalSeguimientos(): number { return this.agenda.filter(t => t.tipo === 'Seguimiento').length; }

  // ── FA1: agenda vacía ─────────────────────────────────────────────────────
  get agendaVacia(): boolean { return this.agenda.length === 0; }

  // ── Helpers de estilos ────────────────────────────────────────────────────
  claseEstado(estado: EstadoTurno): string {
    const mapa: Record<EstadoTurno, string> = {
      'Atendido':   'pill-estado estado-atendido',
      'En espera':  'pill-estado estado-en-espera',
      'Acreditado': 'pill-estado estado-acreditado',
      'Confirmado': 'pill-estado estado-confirmado',
    };
    return mapa[estado];
  }

  claseTipo(tipo: TipoTurno): string {
    const mapa: Record<TipoTurno, string> = {
      'Normal':      'pill-tipo tipo-normal',
      'Seguimiento': 'pill-tipo tipo-seguimiento',
      'Sobreturno':  'pill-tipo tipo-sobreturno',
    };
    return mapa[tipo];
  }

  /** El botón de acción depende del estado */
  esAtendido(estado: EstadoTurno): boolean {
    return estado === 'Atendido';
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  registrarAtencion(turno: TurnoAgenda): void {
    turno.estado = 'Atendido';
  }

  verDetalle(turno: TurnoAgenda): void {
    alert(`Detalle de ${turno.paciente}\nHora: ${turno.hora}\nMotivo: ${turno.motivo}\nObra social: ${turno.obraSocial}`);
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
