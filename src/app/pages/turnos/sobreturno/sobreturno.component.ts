import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// Importamos el servicio mock que cree
import { TurnosService } from '../../../core/services/turnos.service'; 

@Component({
  selector: 'app-sobreturno',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // CommonModule nos permite usar *ngIf y *ngFor
  templateUrl: './sobreturno.component.html',
  styleUrl: './sobreturno.component.css'
})
export class SobreturnoComponent implements OnInit {
  sobreturnoForm!: FormGroup;
  limiteSobreturnoAlcanzado: boolean = false; 
  sobreturnosAsignados: number = 0;
  sobreturnosDelDia: any[] = [];

  // Inyectamos el TurnosService mockeado
  constructor(
    private fb: FormBuilder,
    private turnosService: TurnosService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Verificación inicial apenas arranca la pantalla
    this.verificarLimiteSobreturno();
  }

  private initForm(): void {
    this.sobreturnoForm = this.fb.group({
      pacienteDni: ['', Validators.required],
      obraSocial: ['Swiss Medical'],
      modalidadPago: ['Obra social'],
      especialidad: ['Clínica Médica'],
      medicoId: ['Dr. Méndez, Carlos', Validators.required],
      fecha: ['2026-05-05', Validators.required], 
      hora: ['09:30', Validators.required],
      motivo: ['', Validators.required]
    });

    // Escucha cambios en tiempo real en los inputs para validar el límite (FA1)
    this.sobreturnoForm.valueChanges.subscribe(() => {
      this.verificarLimiteSobreturno();
    });
  }

  // LÓGICA DE NEGOCIO (FA1): Consulta al servicio mockeado
  verificarLimiteSobreturno(): void {
    const formValues = this.sobreturnoForm.value;
    if (!formValues.medicoId || !formValues.fecha || !formValues.hora) return;

    // acá solo quiero avisar que se llama GET SOBURNOS DEL DIA
    this.turnosService.getSoburnosDelDia(formValues.medicoId, formValues.fecha, formValues.hora)
      .subscribe(data => {
        this.sobreturnosDelDia = data;
        this.sobreturnosAsignados = data.length;

        // Regla: Si el médico ya tiene 1 sobreturno en esa hora, salta la alerta
        if (this.sobreturnosAsignados >= 1) {
          this.limiteSobreturnoAlcanzado = true;
        } else {
          this.limiteSobreturnoAlcanzado = false;
        }
      });
  }

  // ENVIAR DATOS AL MOCK
  onSubmit(): void {
    if (this.sobreturnoForm.invalid || this.limiteSobreturnoAlcanzado) return;

    const formValues = this.sobreturnoForm.value;

    const nuevoSobreturno = {
      fecha: formValues.fecha,
      hora: formValues.hora,
      pacienteId: formValues.pacienteDni,
      medicoId: formValues.medicoId,
      consultorio: 'Consultorio 1',
      estado: 'pendiente',
      tipo: 'sobreturno',
      motivo: formValues.motivo
    };

    this.turnosService.guardarSobreturno(nuevoSobreturno).subscribe(response => {
      if (response.success) {
        alert('¡Sobreturno registrado con éxito!');
        this.sobreturnoForm.get('pacienteDni')?.reset();
        this.sobreturnoForm.get('motivo')?.reset();
        
        // Refrescamos la interfaz para ver el nuevo turno reflejado
        this.verificarLimiteSobreturno();
      }
    });
  }
}

