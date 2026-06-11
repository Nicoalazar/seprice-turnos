import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MedicosService } from '../../../core/services/medicos.service';
import { LiquidacionService } from '../../../core/services/liquidacion.service';
import { Medico } from '../../../core/interfaces/medico.d';

@Component({
  selector: 'app-generar-liquidacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './generar-liquidacion.component.html',
  styleUrls: ['./generar-liquidacion.component.css']
})
export class GenerarLiquidacionComponent implements OnInit {
  medicos: Medico[] = [];
  formulario!: FormGroup;
  cargando = false;
  resumen: any = null;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private medicosService: MedicosService,
    private liquidacionService: LiquidacionService,
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
      medicoId: ['', Validators.required],
      desde: ['', Validators.required],
      hasta: ['', Validators.required]
    });
  }

  calcularResumen(): void {
    if (this.formulario.invalid) return;

    const { medicoId, desde, hasta } = this.formulario.value;
    const medico = this.medicos.find(m => m.id === medicoId);

    if (!medico) return;

    this.cargando = true;
    this.liquidacionService.getTurnosAtendidos(medicoId, desde, hasta).subscribe({
      next: (turnos) => {
        if (turnos.length === 0) {
          this.snackBar.open('FA1 — No hay turnos atendidos en este período', 'Cerrar', { duration: 3000 });
          this.cargando = false;
          this.resumen = null;
          return;
        }

        const cantidad = turnos.length;
        const montoUnitario = medico.tarifa;
        const montoTotal = cantidad * montoUnitario;

        this.resumen = {
          medicoId,
          medico: `${medico.apellido}, ${medico.nombre}`,
          periodo: `${desde} al ${hasta}`,
          cantidad,
          montoUnitario,
          montoTotal,
          turnos
        };

        this.cargando = false;
      },
      error: () => {
        this.snackBar.open('Error al calcular liquidación', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  guardarLiquidacion(): void {
    if (!this.resumen) return;

    this.guardando = true;
    const periodo = this.resumen.periodo;

    // Verificar si ya existe
    this.liquidacionService.getLiquidacionExistente(this.resumen.medicoId, periodo).subscribe({
      next: (existente) => {
        if (existente) {
          this.snackBar.open('FA2 — Esta liquidación ya fue generada', 'Cerrar', { duration: 3000 });
          this.guardando = false;
          return;
        }

        // Generar nueva
        this.liquidacionService.generarLiquidacion(
          this.resumen.medicoId,
          periodo,
          this.resumen.cantidad,
          this.resumen.montoTotal
        ).subscribe({
          next: (resultado) => {
            if (resultado.ok) {
              this.snackBar.open('Liquidación generada exitosamente', 'Cerrar', { duration: 3000 });
              this.guardando = false;
              this.resumen = null;
              this.formulario.reset();
            } else {
              this.snackBar.open(`Error: ${resultado.error}`, 'Cerrar', { duration: 3000 });
              this.guardando = false;
            }
          },
          error: () => {
            this.snackBar.open('Error al guardar liquidación', 'Cerrar', { duration: 3000 });
            this.guardando = false;
          }
        });
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
