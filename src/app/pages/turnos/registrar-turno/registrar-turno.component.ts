import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnosService, FranjaHoraria, Especialidad, Medico, Paciente } from '../../../core/services/turnos.service';
import { Turno, TipoTurno } from '../../../core/interfaces/turno.d';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-registrar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './registrar-turno.component.html',
  styleUrls: ['./registrar-turno.component.css'],
})
export class RegistrarTurnoComponent implements OnInit {

  // PACIENTE
  pacienteSeleccionado = signal<Paciente | null>(null);
  pacienteNoRegistrado = signal(false);
  resultadosBusqueda   = signal<Paciente[]>([]);

  // TURNO (Se extiende el tipo de forma local para mapear propiedades del backend sin alterar el servicio)
  especialidades: Especialidad[] = [];
  medicos             = signal<(Medico & { apellido?: string })[]>([]);
  medicoSeleccionado  = signal<(Medico & { apellido?: string }) | null>(null);
  franjas             = signal<(FranjaHoraria & { esSobreturno?: boolean })[]>([]);
  franjaSeleccionada  = signal<(FranjaHoraria & { esSobreturno?: boolean }) | null>(null);

  // RESULTADO 
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
    const v = this.formTurno?.get('fecha')?.value;
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

    // ESPECIALIDAD SELECCIONA PRIMER MEDICO
    this.formTurno.get('especialidad')!.valueChanges.subscribe(esp => {
      const lista = this.turnosService.getMedicosPorEspecialidad(Number(esp)) as (Medico & { apellido?: string })[];
      this.medicos.set(lista);
      const primero = lista[0] ?? null;
      this.medicoSeleccionado.set(primero);
      this.formTurno.patchValue({ medicoId: primero?.id ?? '' }, { emitEvent: false });
      this.franjaSeleccionada.set(null);
      if (primero) this.cargarFranjas(String(primero.id));
      else this.franjas.set([]);
    });

    // MEDICO ACTUALIZAR FRANJA
    this.formTurno.get('medicoId')!.valueChanges.subscribe(id => {
      const m = this.medicos().find(x => x.id === id) ?? null;
      this.medicoSeleccionado.set(m);
      this.franjaSeleccionada.set(null);
      if (id) this.cargarFranjas(id);
      else this.franjas.set([]);
    });

    // FECHA ACTUALIZAR FRANJA
    this.formTurno.get('fecha')!.valueChanges.subscribe(() => {
      const id = this.formTurno.get('medicoId')!.value;
      this.franjaSeleccionada.set(null);
      if (id) this.cargarFranjas(id);
    });
  }

  private cargarFranjas(medicoId: string): void {
    const fecha = this.formTurno.get('fecha')!.value;
    if (!fecha) return;
    this.franjas.set(
      this.turnosService.getFranjasDisponibles(medicoId, fecha) as (FranjaHoraria & { esSobreturno?: boolean })[]
    );
  }

  // PACIENTE
  buscar(): void {
    const buscandoPaciente = this.turnosService.buscarPaciente(this.formPaciente.get('busqueda')!.value);
    this.resultadosBusqueda.set(buscandoPaciente ? [buscandoPaciente] : []);
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

  get pacienteValido(): boolean {
    return this.pacienteNoRegistrado()
      ? this.formPaciente.get('nombreManual')!.valid
      : !!this.pacienteSeleccionado();
  }

  // TURNO
  elegirFranja(f: FranjaHoraria & { esSobreturno?: boolean }): void {
    if (!f.disponible) return;
    this.franjaSeleccionada.set(f);
  }

  setTipo(tipo: TipoTurno): void {
    this.formTurno.patchValue({ tipo });
  }

  // CONFIRMAR
  confirmar(): void {
    if (!this.formularioValido) return;
    this.errorMsg.set(null);

    const { medicoId, fecha, tipo } = this.formTurno.value;
    const pacienteDni = this.pacienteNoRegistrado() ? '' : this.pacienteSeleccionado()!.dni;

    const result = this.turnosService.registrarTurno({
      pacienteDni, medicoId,
      fecha: fecha,
      hora:  this.franjaSeleccionada()!.hora,
      tipo,
    });

    if (result.ok) {
      const nuevoTurnoCreado: Turno = {
        id: 'MOCK-' + Math.random().toString(36).substring(2, 9), 
        fecha: new Date(fecha + 'T00:00:00'),                     
        hora: this.franjaSeleccionada()!.hora,
        pacienteId: pacienteDni,
        medicoId: medicoId,
        consultorio: 'Consultorio A',                            
        estado: 'confirmado',                                     
        tipo: tipo                                                
      };

      this.turnoConfirmado.set(nuevoTurnoCreado);
      this.confirmado.set(true);
    } else {
      this.errorMsg.set('Error al registrar el turno.');
    }
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }

  getNombreMedico(): string {
    const m = this.medicoSeleccionado();
    if (!m) return '';
    return m.apellido ? `${m.apellido}, ${m.nombre}` : `${m.nombre}`;
  }

  // Se adapta para resolver el error NG9 de tipado estricto al renderizar la confirmación
  formatFecha(fecha: Date | string): string {
    if (fecha instanceof Date) {
      return fecha.toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    }
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}