import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../../core/services/turnos.service';
import { MedicosService } from '../../../core/services/medicos.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { PacientesService } from '../../../core/services/pacientes.service';
import { Franja } from '../../../core/interfaces/franja.d';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sobreturno',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './sobreturno.component.html',
  styleUrl: './sobreturno.component.css'
})
export class SobreturnoComponent implements OnInit {
  private router = inject(Router);
  private turnosService = inject(TurnosService);
  private medicosService = inject(MedicosService);
  private agendaService = inject(AgendaService);
  private pacientesService = inject(PacientesService);

  sobreturnoForm!: FormGroup;
  medicos = signal<any[]>([]);
  franjas = signal<Franja[]>([]);
  cargando = signal(false);
  franjasSeleccionada = signal<Franja | null>(null);

  limiteSobreturnoAlcanzado = signal(false);
  sobreturnosAsignados = signal(0);
  pacienteEncontrado = signal<any | null>(null);

  volverAlDashboard(): void { this.router.navigate(['/dashboard']); }

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    this.cargando.set(true);
    this.medicosService.getTodosMedicos().subscribe({
      next: (medicos: any[]) => {
        this.medicos.set(medicos);
        if (medicos.length > 0) {
          this.sobreturnoForm.patchValue({ medicoId: medicos[0].id });
          this.cargarFranjas(medicos[0].id);
        }
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  private initForm(): void {
    const hoy = new Date().toISOString().split('T')[0];
    this.sobreturnoForm = this.fb.group({
      pacienteDni: ['', Validators.required],
      obraSocial: [''],
      modalidadPago: ['obraSocial'],
      especialidad: [''],
      medicoId: ['', Validators.required],
      fecha: [hoy, Validators.required],
      franjaId: ['', Validators.required],
      motivo: ['', Validators.required]
    });

    // Cuando cambia médico o fecha, recargar franjas y resetear límite
    this.sobreturnoForm.get('medicoId')!.valueChanges.subscribe((medicoId: string) => {
      if (medicoId) {
        this.cargarFranjas(medicoId);
        this.limiteSobreturnoAlcanzado.set(false);
        this.sobreturnosAsignados.set(0);
      }
    });

    this.sobreturnoForm.get('fecha')!.valueChanges.subscribe(() => {
      const medicoId = this.sobreturnoForm.get('medicoId')!.value;
      if (medicoId) {
        this.cargarFranjas(medicoId);
        this.limiteSobreturnoAlcanzado.set(false);
        this.sobreturnosAsignados.set(0);
      }
    });

    // Cuando se selecciona franja, verificar el límite de sobreturno
    this.sobreturnoForm.get('franjaId')!.valueChanges.subscribe((franjaId: string) => {
      if (franjaId) {
        this.verificarLimiteSobreturno();
      }
    });
  }

  buscarPaciente(): void {
    const dni = this.sobreturnoForm.get('pacienteDni')?.value as string;
    if (!dni || dni.length < 2) return;

    this.pacientesService.buscarPaciente(dni).subscribe({
      next: (resultados) => {
        if (resultados.length > 0) {
          this.pacienteEncontrado.set(resultados[0]);
        } else {
          this.pacienteEncontrado.set(null);
        }
      },
      error: () => {
        this.pacienteEncontrado.set(null);
      }
    });
  }

  private verificarLimiteSobreturno(): void {
    const franjaId = this.sobreturnoForm.get('franjaId')?.value as string;
    const medicoId = this.sobreturnoForm.get('medicoId')?.value as string;
    const fecha = this.sobreturnoForm.get('fecha')?.value as string;

    if (!franjaId || !medicoId || !fecha) return;

    const franjaSelec = this.franjas().find(f => f.id === franjaId);
    if (!franjaSelec) return;

    this.turnosService.contarSobreturnosPorHora(medicoId, fecha, franjaSelec.hora).subscribe({
      next: (cantidad) => {
        this.sobreturnosAsignados.set(cantidad);
        this.limiteSobreturnoAlcanzado.set(cantidad >= 1);
      }
    });
  }

  private cargarFranjas(medicoId: string): void {
    const fecha = this.sobreturnoForm.get('fecha')!.value;
    if (!fecha) return;

    this.agendaService.getFranjasParaSobreturno(medicoId, fecha).subscribe({
      next: (franjas) => {
        this.franjas.set(franjas);
      },
      error: () => {
        this.franjas.set([]);
      }
    });
  }

  onSubmit(): void {
    if (this.sobreturnoForm.invalid || !this.pacienteEncontrado() || this.limiteSobreturnoAlcanzado()) {
      alert('Por favor, completá todos los campos y asegurate que el paciente existe.');
      return;
    }

    this.cargando.set(true);
    const formValues = this.sobreturnoForm.value;
    const paciente = this.pacienteEncontrado()!;

    const modalidad = formValues.modalidadPago === 'obraSocial' ? 'OBRA_SOCIAL' : 'PARTICULAR';
    this.turnosService.registrarTurno({
      pacienteId: paciente.id,
      medicoId: formValues.medicoId,
      franjaId: formValues.franjaId,
      tipo: 'SOBRETURNO',
      modalidadPago: modalidad,
    }).subscribe({
      next: (response) => {
        this.cargando.set(false);
        if (response.ok) {
          alert('¡Sobreturno registrado con éxito!');
          this.sobreturnoForm.reset({
            modalidadPago: 'obraSocial',
            fecha: new Date().toISOString().split('T')[0]
          });
          this.franjas.set([]);
          this.pacienteEncontrado.set(null);
          this.limiteSobreturnoAlcanzado.set(false);
          this.sobreturnosAsignados.set(0);
        } else {
          alert('Error: ' + response.error);
        }
      },
      error: () => {
        this.cargando.set(false);
        alert('Error al registrar el sobreturno');
      }
    });
  }
}
