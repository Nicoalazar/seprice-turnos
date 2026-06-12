import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TurnosService } from '../../../core/services/turnos.service';
import { AtencionService } from '../../../core/services/atencion.service';
import { MedicosService } from '../../../core/services/medicos.service';
import { LoginService } from '../../../auth/login.service';
import { TurnoConDetalles } from '../../../core/interfaces/turno.d';
import { FranjaVista } from '../../../core/interfaces/franja.d';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnChanges, OnInit {

  @Input() medicoSeleccionado: string = '';
  @Input() fechaSeleccionada: string = '';
  @Output() turnoSeleccionado = new EventEmitter<TurnoConDetalles>();
  @Output() atencionRegistrada = new EventEmitter<TurnoConDetalles>();

  turnosDelDia: TurnoConDetalles[] = [];
  especialidadMedico = '';
  franjasHorarias: FranjaVista[] = [];
  turnoDetalle = signal<TurnoConDetalles | null>(null);
  cargando = false;
  formularioAtencion: FormGroup | null = null;
  turnoActualAtencion = signal<TurnoConDetalles | null>(null);
  mostrando = signal<'agenda' | 'formulario'>('agenda');

  private router = inject(Router);
  private atencionService = inject(AtencionService);
  private medicosService = inject(MedicosService);
  private loginService = inject(LoginService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  constructor(private turnosService: TurnosService) { }

  volverAlDashboard(): void { this.router.navigate(['/dashboard']); }

  // Métricas del día calculadas sobre los turnos cargados
  get totalAsignados(): number { return this.turnosDelDia.length; }
  get totalAtendidos(): number { return this.turnosDelDia.filter(t => t.estado === 'ATENDIDO').length; }
  get totalEnEspera(): number { return this.turnosDelDia.filter(t => t.estado === 'PRESENTE EN SALA').length; }
  get totalSeguimiento(): number { return this.turnosDelDia.filter(t => t.tipo === 'SEGUIMIENTO').length; }

  get fechaDisplay(): string {
    if (!this.fechaSeleccionada) return '';
    const texto = new Date(this.fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  ngOnInit(): void {
    // Si no hay inputs, intentar auto-cargar para el médico actual
    if (!this.medicoSeleccionado || !this.fechaSeleccionada) {
      const usuarioActual = this.loginService.getUsuarioActual();
      if (usuarioActual) {
        this.medicosService.getMedicoActual(usuarioActual.id).subscribe({
          next: (medico) => {
            if (medico) {
              this.medicoSeleccionado = medico.id;
              this.especialidadMedico = medico.especialidad;
              const hoy = new Date();
              this.fechaSeleccionada = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
              this.cargarAgenda();
            }
          }
        });
      }
    } else {
      this.cargarAgenda();
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.medicoSeleccionado && this.fechaSeleccionada) {
      this.cargarAgenda();
    }
  }

  cargarAgenda(): void {
    this.cargando = true;
    this.turnosService.getTurnosDeMedico(this.medicoSeleccionado, this.fechaSeleccionada)
      .subscribe({
        next: (datos) => {
          this.turnosDelDia = datos;
          this.franjasHorarias = datos.map(t => ({
            hora: t.franja?.hora ?? '',
            paciente: `${t.paciente?.apellido}, ${t.paciente?.nombre}`,
            motivo: t.tipo,
            obraSocial: t.paciente?.obraSocial ?? '—',
            tipo: t.tipo,
            estado: t.estado,
            turnoId: t.id,
          }));
          this.cargando = false;
        },
        error: () => {
          this.turnosDelDia = [];
          this.franjasHorarias = [];
          this.cargando = false;
        }
      });
  }

  seleccionarFranja(franja: FranjaVista): void {
    const turno = this.turnosDelDia.find(t => t.id === franja.turnoId);
    if (turno && turno.estado === 'CONFIRMADO') {
      this.turnoSeleccionado.emit(turno);
    }
  }

  seleccionarTurno(turno: TurnoConDetalles): void {
    if (turno.estado === 'CONFIRMADO') {
      this.turnoSeleccionado.emit(turno);
    }
  }

  abrirFormularioAtencion(franja: FranjaVista): void {
    const turno = this.turnosDelDia.find(t => t.id === franja.turnoId);
    if (!turno) return;

    this.turnoActualAtencion.set(turno);
    this.mostrando.set('formulario');
    this.formularioAtencion = this.fb.group({
      diagnostico: ['', Validators.required],
      prescripciones: [''],
      derivacion: ['']
    });
  }

  guardarAtencion(): void {
    if (!this.formularioAtencion || !this.turnoActualAtencion()) return;

    const turno = this.turnoActualAtencion()!;
    const { diagnostico, prescripciones, derivacion } = this.formularioAtencion.value;

    this.cargando = true;

    // Crear registro de atención
    this.atencionService.crearAtencion({
      turnoId: turno.id,
      medicoId: turno.medicoId,
      diagnostico,
      prescripciones: prescripciones || undefined,
      derivacion: derivacion || undefined
    }).subscribe({
      next: (atencion) => {
        if (atencion) {
          // Marcar turno como atendido
          this.turnosService.marcarComoAtendido(turno.id).subscribe({
            next: () => {
              this.cargando = false;
              this.snackBar.open('Atención registrada exitosamente', 'Cerrar', { duration: 3000 });
              turno.estado = 'ATENDIDO';
              this.atencionRegistrada.emit(turno);
              this.mostrando.set('agenda');
              this.cargarAgenda();
            },
            error: () => {
              this.cargando = false;
              this.snackBar.open('Error al actualizar turno', 'Cerrar', { duration: 3000 });
            }
          });
        }
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('Error al registrar atención', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cancelarFormulario(): void {
    this.mostrando.set('agenda');
    this.turnoActualAtencion.set(null);
    this.formularioAtencion = null;
  }

  verDetalle(franja: FranjaVista): void {
    const turno = this.turnosDelDia.find(t => t.id === franja.turnoId);
    if (turno) this.turnoDetalle.set(turno);
  }

  cerrarDetalle(): void {
    this.turnoDetalle.set(null);
  }
}
