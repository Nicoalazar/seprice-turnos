import { Component, OnInit, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnosService } from '../../../core/services/turnos.service';
import { MedicosService } from '../../../core/services/medicos.service';
import { PacientesService } from '../../../core/services/pacientes.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { Paciente } from '../../../core/interfaces/paciente.d';
import { Medico } from '../../../core/interfaces/medico.d';
import { Franja } from '../../../core/interfaces/franja.d';
import { Turno, TipoTurno } from '../../../core/interfaces/turno.d';
import { HeaderComponent } from '../../../components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription, of } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-registrar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, MatIconModule],
  templateUrl: './registrar-turno.component.html',
  styleUrls: ['./registrar-turno.component.css'],
})
export class RegistrarTurnoComponent implements OnInit, OnDestroy {

  // Paciente
  pacienteSeleccionado = signal<Paciente | null>(null);
  pacienteNoRegistrado = signal(false);
  resultadosBusqueda = signal<Paciente[]>([]);

  // Turno
  especialidades: string[] = [];
  medicos = signal<Medico[]>([]);
  medicoSeleccionado = signal<Medico | null>(null);
  franjas = signal<any[]>([]);
  franjaSeleccionada = signal<any | null>(null);

  // Resultado
  turnoConfirmado = signal<any>(null);
  errorMsg = signal<string | null>(null);
  confirmado = signal(false);
  cargando = signal(false);

  // Gestión de subscripciones
  private destroy$ = new Subject<void>();
  private cargarFranjas$ = new Subject<string>();
  private subscriptions: Subscription[] = [];

  formPaciente!: FormGroup;
  formTurno!: FormGroup;

  readonly hoy = this.obtenerFechaLocal(new Date());
  readonly fechaMax = this.obtenerFechaLocal(new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000));

  private obtenerFechaLocal(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const día = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${día}`;
  }

  readonly fechaDisplay = computed(() => {
    const v = this.formTurno?.get('fecha')?.value as string | null;
    if (!v) return '';
    return new Date(v + 'T00:00:00').toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  });

  get franjasDisponiblesCount(): number {
    return this.franjas().length;
  }

  get formularioValido(): boolean {
    return this.pacienteValido && this.formTurno.valid && !!this.franjaSeleccionada() && this.franjasDisponiblesCount > 0;
  }

  get sinFranjasDisponibles(): boolean {
    const medicoId = this.formTurno.get('medicoId')?.value as string;
    const fecha = this.formTurno.get('fecha')?.value as string;
    return !!(medicoId && fecha && this.franjas().length === 0);
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
    private medicosService: MedicosService,
    private pacientesService: PacientesService,
    private agendaService: AgendaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargando.set(true);
    const espSub = this.medicosService.getEspecialidades().subscribe({
      next: (esp) => {
        this.especialidades = esp;
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
    this.subscriptions.push(espSub);

    this.formPaciente = this.fb.group({
      busqueda: [''],
      nombreManual: [''],
      obraSocial: [''],
      modalidadPago: ['obra social'],
    });

    this.formTurno = this.fb.group({
      especialidad: ['', Validators.required],
      medicoId: ['', Validators.required],
      fecha: [this.hoy, Validators.required],
      tipo: ['normal', Validators.required],
      observaciones: [''],
    });

    // Cargar franjas con switchMap y debounceTime para evitar múltiples subscripciones
    const franjasSub = this.cargarFranjas$.pipe(
      debounceTime(300),
      switchMap((medicoId) => {
        const fecha = this.formTurno.get('fecha')!.value as string;
        if (!fecha || !medicoId) return of([]);
        return this.agendaService.getFranjasDisponibles(medicoId, fecha);
      })
    ).subscribe((franjas) => {
      const mapeadas = franjas.map(f => ({
        ...f,
        esSobreturno: f.sobreturno
      })) as any[];
      this.franjas.set(mapeadas);
    });
    this.subscriptions.push(franjasSub);

    // Especialidad → cargar médicos
    const espChangeSub = this.formTurno.get('especialidad')!.valueChanges.pipe(
      switchMap((esp: string) => this.medicosService.getMedicosPorEspecialidad(esp))
    ).subscribe((lista: any[]) => {
      this.medicos.set(lista);
      const primero = lista[0] ?? null;
      this.medicoSeleccionado.set(primero);
      this.formTurno.patchValue({ medicoId: primero?.id ?? '' }, { emitEvent: false });
      this.franjaSeleccionada.set(null);
      if (primero) this.cargarFranjas$.next(primero.id);
      else this.franjas.set([]);
    });
    this.subscriptions.push(espChangeSub);

    // Médico → actualizar franjas
    const medicoChangeSub = this.formTurno.get('medicoId')!.valueChanges.subscribe((id: string) => {
      const m = this.medicos().find(x => x.id === id) ?? null;
      this.medicoSeleccionado.set(m);
      this.franjaSeleccionada.set(null);
      if (id) this.cargarFranjas$.next(id);
      else this.franjas.set([]);
    });
    this.subscriptions.push(medicoChangeSub);

    // Fecha → actualizar franjas
    const fechaChangeSub = this.formTurno.get('fecha')!.valueChanges.subscribe(() => {
      const id = this.formTurno.get('medicoId')!.value as string;
      this.franjaSeleccionada.set(null);
      if (id) this.cargarFranjas$.next(id);
    });
    this.subscriptions.push(fechaChangeSub);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  buscar(): void {
    const q = this.formPaciente.get('busqueda')!.value as string;
    this.pacientesService.buscarPaciente(q).subscribe({
      next: (resultados) => {
        this.resultadosBusqueda.set(resultados);
      },
      error: () => {
        this.resultadosBusqueda.set([]);
      }
    });
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

  elegirFranja(f: Franja): void {
    this.franjaSeleccionada.set(f);
  }

  setTipo(tipo: string): void {
    this.formTurno.patchValue({ tipo });
  }

  confirmar(): void {
    if (!this.formularioValido) return;
    this.errorMsg.set(null);
    this.cargando.set(true);

    const medicoId = this.formTurno.get('medicoId')!.value as string;
    const tipoStr = this.formTurno.get('tipo')!.value as string;
    const tipo: TipoTurno = tipoStr.toUpperCase() as TipoTurno;
    const franjaId = this.franjaSeleccionada()!.id;

    if (this.pacienteNoRegistrado()) {
      const nombreCompleto = this.formPaciente.get('nombreManual')!.value as string;
      const [apellido, nombre] = nombreCompleto.includes(',')
        ? nombreCompleto.split(',').map(s => s.trim())
        : ['', nombreCompleto];

      this.pacientesService.crearPaciente({
        dni: '',
        nombre: nombre || nombreCompleto,
        apellido: apellido || '',
        fechaNac: new Date().toISOString(),
        telefono: '',
        obraSocial: this.formPaciente.get('obraSocial')?.value || null,
      }).subscribe({
        next: (pacienteCreado) => {
          if (pacienteCreado) {
            this.registrarTurnoConPaciente(medicoId, pacienteCreado.id, franjaId, tipo);
          } else {
            this.cargando.set(false);
            this.errorMsg.set('Error al registrar el paciente.');
          }
        },
        error: () => {
          this.cargando.set(false);
          this.errorMsg.set('Error al registrar el paciente.');
        }
      });
    } else {
      const pacienteId = this.pacienteSeleccionado()!.id;
      this.registrarTurnoConPaciente(medicoId, pacienteId, franjaId, tipo);
    }
  }

  private registrarTurnoConPaciente(medicoId: string, pacienteId: string, franjaId: string, tipo: TipoTurno): void {
    this.turnosService.registrarTurno({
      pacienteId,
      medicoId,
      franjaId,
      tipo,
      modalidadPago: 'OBRA_SOCIAL',
    }).subscribe({
      next: (result) => {
        this.cargando.set(false);
        if (result.ok && result.turno) {
          const franja = this.franjaSeleccionada()!;
          const medico = this.medicoSeleccionado()!;
          const turnoConDetalles = {
            ...result.turno,
            consultorio: medico ? `Consultorio ${medico.especialidad}` : 'Sin asignar',
            fecha: new Date(franja.fecha + 'T00:00:00'),
            hora: franja.hora,
          };
          this.turnoConfirmado.set(turnoConDetalles);
          this.confirmado.set(true);
        } else {
          this.errorMsg.set(result.error ?? 'Error al registrar el turno.');
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMsg.set('Error al registrar el turno.');
        console.error(err);
      }
    });
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
