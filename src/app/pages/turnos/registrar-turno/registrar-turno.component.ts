import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnosService, FranjaHoraria, RespuestaRegistro } from '../../../core/services/turnos.service';
import { Paciente } from '../../../core/interfaces/paciente.d';
import { Medico } from '../../../core/interfaces/medico.d';
import { Turno, TipoTurno } from '../../../core/interfaces/turno.d';
import { HeaderComponent } from '../../../components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
 
@Component({
  selector: 'app-registrar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, MatIconModule],
  templateUrl: './registrar-turno.component.html',
  styleUrls: ['./registrar-turno.component.css'],
})
export class RegistrarTurnoComponent implements OnInit {
 
  // ── Paciente ──────────────────────────────────────────────────────────────
  pacienteSeleccionado = signal<Paciente | null>(null);
  pacienteNoRegistrado = signal(false);
  resultadosBusqueda   = signal<Paciente[]>([]);
 
  // ── Turno ─────────────────────────────────────────────────────────────────
  especialidades: string[] = [];
  medicos            = signal<Medico[]>([]);
  medicoSeleccionado = signal<Medico | null>(null);
  franjas            = signal<FranjaHoraria[]>([]);
  franjaSeleccionada = signal<FranjaHoraria | null>(null);
 
  // ── Resultado ─────────────────────────────────────────────────────────────
  turnoConfirmado = signal<Turno | null>(null);
  errorMsg        = signal<string | null>(null);
  confirmado      = signal(false);
 
  formPaciente!: FormGroup;
  formTurno!: FormGroup;
 
  readonly hoy = new Date().toISOString().split('T')[0];
  readonly fechaMax = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  })();
 
  readonly fechaDisplay = computed(() => {
    const v = this.formTurno?.get('fecha')?.value as string | null;
    if (!v) return '';
    return new Date(v + 'T00:00:00').toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  });
 
  get franjasDisponiblesCount(): number {
    return this.franjas().filter(f => f.disponible).length;
  }
 
  get formularioValido(): boolean {
    return this.pacienteValido && this.formTurno.valid && !!this.franjaSeleccionada();
  }
 
  get pacienteValido(): boolean {
    return this.pacienteNoRegistrado()
      ? this.formPaciente.get('nombreManual')!.valid
      : !!this.pacienteSeleccionado();
  }

  get controlBusqueda(): FormControl<string | null> {
  return this.formPaciente.get('busqueda') as FormControl<string | null>;
}

get controlNombreManual(): FormControl<string | null> {
  return this.formPaciente.get('nombreManual') as FormControl<string | null>;
}
 
  constructor(
    private fb: FormBuilder,
    private turnosService: TurnosService,
    private router: Router,
  ) {}
 
  ngOnInit(): void {
    this.especialidades = this.turnosService.getEspecialidades();
 
    this.formPaciente = this.fb.group({
      busqueda:      [''],
      nombreManual:  [''],
      obraSocial:    [''],
      modalidadPago: ['obra social'],
    });
 
    this.formTurno = this.fb.group({
      especialidad:  ['', Validators.required],
      medicoId:      ['', Validators.required],
      fecha:         [this.hoy, Validators.required],
      tipo:          ['normal' as TipoTurno, Validators.required],
      observaciones: [''],
    });
 
    // Especialidad → cargar médicos y preseleccionar primero
    this.formTurno.get('especialidad')!.valueChanges.subscribe((esp: string) => {
      const lista = this.turnosService.getMedicosPorEspecialidad(esp);
      this.medicos.set(lista);
      const primero = lista[0] ?? null;
      this.medicoSeleccionado.set(primero);
      this.formTurno.patchValue({ medicoId: primero?.id ?? '' }, { emitEvent: false });
      this.franjaSeleccionada.set(null);
      if (primero) this.cargarFranjas(primero.id);
      else this.franjas.set([]);
    });
 
    // Médico → actualizar franjas
    this.formTurno.get('medicoId')!.valueChanges.subscribe((id: string) => {
      const m = this.medicos().find(x => x.id === id) ?? null;
      this.medicoSeleccionado.set(m);
      this.franjaSeleccionada.set(null);
      if (id) this.cargarFranjas(id);
      else this.franjas.set([]);
    });
 
    // Fecha → actualizar franjas
    this.formTurno.get('fecha')!.valueChanges.subscribe(() => {
      const id = this.formTurno.get('medicoId')!.value as string;
      this.franjaSeleccionada.set(null);
      if (id) this.cargarFranjas(id);
    });
  }
 
  private cargarFranjas(medicoId: string): void {
    const fecha = this.formTurno.get('fecha')!.value as string;
    if (!fecha) return;
    this.franjas.set(this.turnosService.getFranjasDisponibles(medicoId, fecha));
  }
 
  // ── Paciente ──────────────────────────────────────────────────────────────
 
  buscar(): void {
    const q = this.formPaciente.get('busqueda')!.value as string;
    this.resultadosBusqueda.set(this.turnosService.buscarPaciente(q));
  }
 
  elegirPaciente(p: Paciente): void {
    this.pacienteSeleccionado.set(p);
    this.resultadosBusqueda.set([]);
    this.formPaciente.patchValue({ busqueda: `${p.apellido}, ${p.nombre}`, obraSocial: p.obraSocial });
  }
 
  toggleFA2(): void {
    this.pacienteNoRegistrado.update(v => !v);
    this.pacienteSeleccionado.set(null);
    this.resultadosBusqueda.set([]);
    this.formPaciente.reset({ busqueda: '', nombreManual: '', obraSocial: '', modalidadPago: 'obra social' });
    const ctrl = this.formPaciente.get('nombreManual')!;
    if (this.pacienteNoRegistrado()) {
      ctrl.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      ctrl.clearValidators();
    }
    ctrl.updateValueAndValidity();
  }
 
  // ── Turno ─────────────────────────────────────────────────────────────────
 
  elegirFranja(f: FranjaHoraria): void {
    if (!f.disponible) return;
    this.franjaSeleccionada.set(f);
  }
 
  setTipo(tipo: TipoTurno): void {
    this.formTurno.patchValue({ tipo });
  }
 
  // ── Confirmar ─────────────────────────────────────────────────────────────
 
  confirmar(): void {
    if (!this.formularioValido) return;
    this.errorMsg.set(null);
 
    const medicoId  = this.formTurno.get('medicoId')!.value as string;
    const fecha     = this.formTurno.get('fecha')!.value as string;
    const tipo      = this.formTurno.get('tipo')!.value as TipoTurno;
    const pacienteId = this.pacienteNoRegistrado() ? '' : this.pacienteSeleccionado()!.id;
 
    const result: RespuestaRegistro = this.turnosService.registrarTurno({
      pacienteId, medicoId, fecha,
      hora: this.franjaSeleccionada()!.hora,
      tipo,
    });
 
    if (result.ok && result.turno) {
      this.turnoConfirmado.set(result.turno);
      this.confirmado.set(true);
    } else {
      this.errorMsg.set(result.error ?? 'Error al registrar el turno.');
    }
  }
 
  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
 
  getNombreMedico(): string {
    const m = this.medicoSeleccionado();
    return m ? `${m.apellido}, ${m.nombre}` : '';
  }
 
  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}
 
