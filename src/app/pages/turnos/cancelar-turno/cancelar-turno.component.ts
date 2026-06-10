import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TurnosService } from '../../../core/services/turnos.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { MedicosService } from '../../../core/services/medicos.service';
import { TurnoConDetalles } from '../../../core/interfaces/turno.d';
import { Franja } from '../../../core/interfaces/franja.d';
import { Medico } from '../../../core/interfaces/medico.d';

@Component({
  selector: 'app-cancelar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule],
  templateUrl: './cancelar-turno.component.html',
  styleUrl: './cancelar-turno.component.css'
})
export class CancelarTurnoComponent implements OnInit {
  private router = inject(Router);
  private turnosService = inject(TurnosService);
  private agendaService = inject(AgendaService);
  private medicosService = inject(MedicosService);

  volverAlDashboard(): void { this.router.navigate(['/dashboard']); }

  buscadorControl = new FormControl('');
  turnoEncontrado: boolean = false;
  errorTurnoNoEncontrado: boolean = false;
  turnoActual: TurnoConDetalles | null = null;
  cargando = false;

  // Variables para cancelación
  motivoCancelacion: string = '';
  notaCancelacion: string = '';

  // Variables para reasignación
  nuevaFecha: string = '';
  nuevoMedicoId: string = '';
  franjasDisponibles = signal<Franja[]>([]);
  franjaSeleccionada = signal<Franja | null>(null);
  medicos = signal<Medico[]>([]);
  cargandoReasignacion = false;

  readonly hoy = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.medicosService.getTodosMedicos().subscribe((medicos) => {
      this.medicos.set(medicos);
    });
  }

  buscar(): void {
    const valorBusqueda = this.buscadorControl.value?.trim();
    if (!valorBusqueda) {
      this.reseteoCompleto();
      return;
    }

    this.cargando = true;
    this.turnosService.buscarTurnoPorPaciente(valorBusqueda).subscribe({
      next: (turno) => {
        this.cargando = false;
        if (turno) {
          this.turnoActual = turno;
          this.turnoEncontrado = true;
          this.errorTurnoNoEncontrado = false;
        } else {
          this.turnoEncontrado = false;
          this.errorTurnoNoEncontrado = true;
        }
      },
      error: () => {
        this.cargando = false;
        this.turnoEncontrado = false;
        this.errorTurnoNoEncontrado = true;
      }
    });
  }

  ejecutarCancelacion(): void {
    if (!this.motivoCancelacion || !this.turnoActual) {
      alert('Por favor, seleccioná un motivo de cancelación.');
      return;
    }

    this.cargando = true;
    this.turnosService.cancelarTurno(this.turnoActual.id).subscribe({
      next: (result) => {
        this.cargando = false;
        if (result.ok) {
          alert(`¡Turno Cancelado con Éxito!\nMotivo: ${this.motivoCancelacion}\nNota: ${this.notaCancelacion || 'Ninguna'}`);
          this.reseteoCompleto();
        } else {
          alert('Error al cancelar el turno: ' + (result.error || 'Error desconocido'));
        }
      },
      error: () => {
        this.cargando = false;
        alert('Error al cancelar el turno');
      }
    });
  }

  cargarFranjasDisponibles(): void {
    if (!this.nuevaFecha || !this.nuevoMedicoId || !this.turnoActual) {
      alert('Completá la fecha y el médico para cargar las franjas disponibles.');
      return;
    }

    this.cargandoReasignacion = true;
    this.agendaService.getFranjasDisponibles(this.nuevoMedicoId, this.nuevaFecha).subscribe({
      next: (franjas) => {
        this.franjasDisponibles.set(franjas);
        this.cargandoReasignacion = false;
        if (franjas.length === 0) {
          alert('No hay franjas disponibles para esa fecha y médico.');
        }
      },
      error: () => {
        this.cargandoReasignacion = false;
        alert('Error al cargar franjas disponibles.');
      }
    });
  }

  ejecutarReasignacion(): void {
    if (!this.franjaSeleccionada() || !this.turnoActual) {
      alert('Por favor, seleccioná una franja disponible para la reasignación.');
      return;
    }

    this.cargando = true;
    const nuevaFranjaId = this.franjaSeleccionada()!.id;

    this.turnosService.reasignarTurno(this.turnoActual.id, nuevaFranjaId, this.nuevoMedicoId).subscribe({
      next: (result) => {
        this.cargando = false;
        if (result.ok) {
          alert('¡Turno reasignado con éxito!');
          this.reseteoCompleto();
        } else {
          alert('Error al reasignar el turno: ' + (result.error || 'Error desconocido'));
        }
      },
      error: () => {
        this.cargando = false;
        alert('Error al reasignar el turno');
      }
    });
  }

  private reseteoCompleto(): void {
    this.turnoEncontrado = false;
    this.errorTurnoNoEncontrado = false;
    this.turnoActual = null;
    this.buscadorControl.setValue('');
    this.motivoCancelacion = '';
    this.notaCancelacion = '';
    this.nuevaFecha = '';
    this.nuevoMedicoId = '';
    this.franjasDisponibles.set([]);
    this.franjaSeleccionada.set(null);
  }
}
