import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MedicosService } from '../../../core/services/medicos.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { Medico } from '../../../core/interfaces/medico.d';
import { Agenda } from '../../../core/interfaces/agenda.d';

@Component({
  selector: 'app-configurar-agenda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './configurar-agenda.component.html',
  styleUrls: ['./configurar-agenda.component.css']
})
export class ConfigurarAgendaComponent implements OnInit {
  medicos: Medico[] = [];
  medicoSeleccionado: Medico | null = null;
  agendaActual: Agenda[] = [];
  formulario!: FormGroup;
  cargando = false;
  guardando = false;
  agendaConfirmandoId: string | null = null;
  agendaEditandoId: string | null = null;

  diasSemana = [
    { valor: 0, label: 'Lunes' },
    { valor: 1, label: 'Martes' },
    { valor: 2, label: 'Miércoles' },
    { valor: 3, label: 'Jueves' },
    { valor: 4, label: 'Viernes' },
    { valor: 5, label: 'Sábado' },
    { valor: 6, label: 'Domingo' }
  ];

  duracionesMinimas: { [key: string]: number } = {
    'Clínica Médica': 15,
    'Pediatría': 15,
    'Cardiología': 25,
    'Fisio-kinesiología': 25,
    'Salud Mental': 30,
    'Dermatología': 20
  };

  constructor(
    private fb: FormBuilder,
    private medicosService: MedicosService,
    private agendaService: AgendaService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargando = true;
    this.medicosService.getTodosMedicos().subscribe({
      next: (medicos) => {
        this.medicos = medicos;
        this.cargando = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar médicos', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });

    this.formulario = this.fb.group({
      diaSemana: ['0', Validators.required],
      horaInicio: ['09:00', Validators.required],
      horaFin: ['18:00', Validators.required],
      duracionMin: ['15', Validators.required]
    });
  }

  seleccionarMedico(medico: Medico): void {
    this.medicoSeleccionado = medico;
    const minDuracion = this.duracionesMinimas[medico.especialidad] || 15;
    this.formulario.get('duracionMin')?.setValidators([
      Validators.required,
      Validators.min(minDuracion)
    ]);
    this.formulario.get('duracionMin')?.setValue(String(minDuracion));
    this.formulario.get('duracionMin')?.updateValueAndValidity();
    this.cargarAgendaMedico();
  }

  private cargarAgendaMedico(): void {
    if (!this.medicoSeleccionado) return;

    this.agendaService.getAgendaPorMedico(this.medicoSeleccionado.id).subscribe({
      next: (agendas) => {
        this.agendaActual = agendas;
      },
      error: () => {
        this.agendaActual = [];
      }
    });
  }

  guardar(): void {
    if (!this.formulario.valid || !this.medicoSeleccionado) return;

    const { diaSemana, horaInicio, horaFin, duracionMin } = this.formulario.value;

    // FA1: si ya existe agenda para ese día y no estamos editándola, bloquear
    const yaExiste = this.agendaActual.find(
      a => a.diaSemana === parseInt(diaSemana) && a.id !== this.agendaEditandoId
    );
    if (yaExiste && !this.agendaEditandoId) {
      const diaLabel = this.obtenerDiaLabel(parseInt(diaSemana));
      this.snackBar.open(
        `Ya existe una agenda para los ${diaLabel}. Usá el botón de editar para modificarla.`,
        'Cerrar',
        { duration: 4000 }
      );
      return;
    }

    this.guardando = true;

    this.agendaService
      .crearOActualizarAgenda(
        this.medicoSeleccionado.id,
        parseInt(diaSemana),
        horaInicio,
        horaFin,
        parseInt(duracionMin),
        this.medicoSeleccionado.especialidad
      )
      .subscribe({
        next: (resultado) => {
          if (resultado.ok) {
            this.snackBar.open('Agenda guardada exitosamente', 'Cerrar', { duration: 3000 });
            this.agendaEditandoId = null;
            this.generarFranjasParaProximosMeses(resultado.agendaId!, horaInicio, horaFin, parseInt(duracionMin), parseInt(diaSemana));
            this.cargarAgendaMedico();
          } else {
            this.snackBar.open(`Error: ${resultado.error}`, 'Cerrar', { duration: 3000 });
            this.guardando = false;
          }
        },
        error: () => {
          this.snackBar.open('Error al guardar la agenda', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
  }

  private generarFranjasParaProximosMeses(
    agendaId: string,
    horaInicio: string,
    horaFin: string,
    duracionMin: number,
    diaSemana: number
  ): void {
    const hoy = new Date();
    const diasAGenerar = 60;

    for (let i = 0; i < diasAGenerar; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);

      if (fecha.getDay() === diaSemana) {
        const fechaStr = fecha.toISOString().split('T')[0];

        this.agendaService.generarFranjasParaAgenda(agendaId, fechaStr, horaInicio, horaFin, duracionMin).subscribe();
      }
    }

    this.guardando = false;
  }

  editarFila(agenda: Agenda): void {
    this.agendaEditandoId = agenda.id;
    this.agendaConfirmandoId = null;
    this.formulario.patchValue({
      diaSemana: String(agenda.diaSemana),
      horaInicio: agenda.horaInicio,
      horaFin: agenda.horaFin,
      duracionMin: String(agenda.duracionMin)
    });
  }

  iniciarEliminacion(agendaId: string): void {
    this.agendaConfirmandoId = agendaId;
  }

  confirmarEliminacion(agenda: Agenda): void {
    this.agendaConfirmandoId = null;
    this.agendaService.eliminarAgenda(agenda.id).subscribe({
      next: (res) => {
        if (res.ok) {
          this.snackBar.open('Agenda eliminada', 'Cerrar', { duration: 3000 });
          if (this.agendaEditandoId === agenda.id) this.agendaEditandoId = null;
          this.cargarAgendaMedico();
        } else {
          this.snackBar.open(res.error ?? 'Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
    });
  }

  obtenerDiaLabel(diaSemana: number): string {
    return this.diasSemana.find(d => d.valor === diaSemana)?.label || '';
  }

  obtenerDuracionMinima(): number {
    return this.medicoSeleccionado ? (this.duracionesMinimas[this.medicoSeleccionado.especialidad] || 15) : 15;
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
