import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TurnosService } from '../../../core/services/turnos.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { MedicosService } from '../../../core/services/medicos.service';
import { FechaService } from '../../../core/services/fecha.service';
import { TurnoConDetalles } from '../../../core/interfaces/turno.d';
import { Franja } from '../../../core/interfaces/franja.d';
import { Medico } from '../../../core/interfaces/medico.d';

@Component({
  selector: 'app-cancelar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './cancelar-turno.component.html',
  styleUrl: './cancelar-turno.component.css'
})
export class CancelarTurnoComponent implements OnInit {
  private router = inject(Router);
  private turnosService = inject(TurnosService);
  private agendaService = inject(AgendaService);
  private medicosService = inject(MedicosService);
  private snackBar = inject(MatSnackBar);
  private fechaService = inject(FechaService);

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

  readonly hoy = this.fechaService.obtenerHoy();

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
      this.snackBar.open('Por favor, seleccioná un motivo de cancelación.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cargando = true;
    this.turnosService.cancelarTurno(this.turnoActual.id).subscribe({
      next: (result) => {
        this.cargando = false;
        if (result.ok) {
          this.snackBar.open(`Turno cancelado con éxito. Motivo: ${this.motivoCancelacion}`, 'Cerrar', { duration: 4000 });
          this.reseteoCompleto();
        } else {
          this.snackBar.open('Error al cancelar el turno: ' + (result.error || 'Error desconocido'), 'Cerrar', { duration: 4000 });
        }
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('Error al cancelar el turno', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarFranjasDisponibles(): void {
    if (!this.nuevaFecha || !this.nuevoMedicoId || !this.turnoActual) {
      this.snackBar.open('Completá la fecha y el médico para cargar las franjas disponibles.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cargandoReasignacion = true;
    this.agendaService.getFranjasDisponibles(this.nuevoMedicoId, this.nuevaFecha).subscribe({
      next: (franjas) => {
        this.franjasDisponibles.set(franjas);
        this.cargandoReasignacion = false;
        if (franjas.length === 0) {
          this.snackBar.open('No hay franjas disponibles para esa fecha y médico.', 'Cerrar', { duration: 3000 });
        }
      },
      error: () => {
        this.cargandoReasignacion = false;
        this.snackBar.open('Error al cargar franjas disponibles.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  ejecutarReasignacion(): void {
    if (!this.franjaSeleccionada() || !this.turnoActual) {
      this.snackBar.open('Por favor, seleccioná una franja disponible para la reasignación.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cargando = true;
    const nuevaFranjaId = this.franjaSeleccionada()!.id;

    this.turnosService.reasignarTurno(this.turnoActual.id, nuevaFranjaId).subscribe({
      next: (result) => {
        this.cargando = false;
        if (result.ok) {
          this.snackBar.open('¡Turno reasignado con éxito!', 'Cerrar', { duration: 4000 });
          this.reseteoCompleto();
        } else {
          this.snackBar.open('Error al reasignar el turno: ' + (result.error || 'Error desconocido'), 'Cerrar', { duration: 4000 });
        }
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('Error al reasignar el turno', 'Cerrar', { duration: 3000 });
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
