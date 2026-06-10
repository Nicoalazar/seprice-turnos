import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../../core/services/turnos.service';
import { MedicosService } from '../../../core/services/medicos.service';
import { AgendaService } from '../../../core/services/agenda.service';
import { Franja } from '../../../core/interfaces/franja.d';

@Component({
  selector: 'app-sobreturno',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sobreturno.component.html',
  styleUrl: './sobreturno.component.css'
})
export class SobreturnoComponent implements OnInit {
  private router = inject(Router);
  private turnosService = inject(TurnosService);
  private medicosService = inject(MedicosService);
  private agendaService = inject(AgendaService);

  sobreturnoForm!: FormGroup;
  medicos = signal<any[]>([]);
  franjas = signal<Franja[]>([]);
  cargando = signal(false);

  limiteSobreturnoAlcanzado = false;
  sobreturnosAsignados = 0;
  sobreturnosDelDia: any[] = [];

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

    // Cuando cambia médico o fecha, recargar franjas
    this.sobreturnoForm.get('medicoId')!.valueChanges.subscribe((medicoId: string) => {
      if (medicoId) {
        this.cargarFranjas(medicoId);
      }
    });

    this.sobreturnoForm.get('fecha')!.valueChanges.subscribe(() => {
      const medicoId = this.sobreturnoForm.get('medicoId')!.value;
      if (medicoId) {
        this.cargarFranjas(medicoId);
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
    if (this.sobreturnoForm.invalid) return;

    this.cargando.set(true);
    const formValues = this.sobreturnoForm.value;

    const modalidad = formValues.modalidadPago === 'obraSocial' ? 'OBRA_SOCIAL' : 'PARTICULAR';
    this.turnosService.registrarTurno({
      pacienteId: formValues.pacienteDni,
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
