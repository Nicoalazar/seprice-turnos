
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TurnosService } from '../../core/services/turnos.service';
import { AtencionService } from '../../core/services/atencion.service';
import { MedicosService } from '../../core/services/medicos.service';
import { LoginService } from '../../auth/login.service';
import { TurnoConDetalles } from '../../core/interfaces/turno.d';
import { Medico } from '../../core/interfaces/medico.d';
 
@Component({
  selector: 'app-registrar-atencion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './registrar-atencion.component.html',
  styleUrls: ['./registrar-atencion.component.css']
})
export class RegistrarAtencionComponent implements OnInit {
  private router = inject(Router);
  private turnosService = inject(TurnosService);
  private atencionService = inject(AtencionService);
  private medicosService = inject(MedicosService);
  private loginService = inject(LoginService);
 
  medicoActual: Medico | null = null;
  pacientesEnEspera: TurnoConDetalles[] = [];
  turnoSeleccionado: TurnoConDetalles | null = null;
  atencionesPrevias: any[] = [];
 
  diagnostico = '';
  prescripciones = '';
  derivacion = '';
  requiereSeguimiento = false;
 
  cargando = false;
  guardando = false;
  confirmado = false;
  error = '';
 
  hoy = new Date().toISOString().split('T')[0];
 
  ngOnInit(): void {
    this.cargarMedicoYPacientes();
  }
 
  private cargarMedicoYPacientes(): void {
    const usuarioActual = this.loginService.getUsuarioActual();
    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }
 
    this.cargando = true;
    this.medicosService.getMedicoActual(usuarioActual.id).subscribe({
      next: (medico) => {
        if (medico) {
          this.medicoActual = medico;
          this.turnosService.getSalaDeEspera(medico.id, this.hoy).subscribe({
            next: (turnos) => {
              this.pacientesEnEspera = turnos;
              this.cargando = false;
            },
            error: () => { this.cargando = false; }
          });
        } else {
          this.cargando = false;
        }
      },
      error: () => { this.cargando = false; }
    });
  }
 
  seleccionarPaciente(turno: TurnoConDetalles): void {
    this.turnoSeleccionado = turno;
    this.diagnostico = '';
    this.prescripciones = '';
    this.derivacion = '';
    this.requiereSeguimiento = false;
    this.confirmado = false;
    this.error = '';
 
    if (this.medicoActual) {
      const hace1año = new Date();
      hace1año.setFullYear(hace1año.getFullYear() - 1);
      this.atencionService.getAtencionesPorMedico(
        this.medicoActual.id,
        hace1año.toISOString(),
        new Date().toISOString()
      ).subscribe({
        next: (atenciones) => {
          this.atencionesPrevias = atenciones
            .filter(a => a.turnoId !== turno.id)
            .slice(0, 4);
        },
        error: () => { this.atencionesPrevias = []; }
      });
    }
  }
 
  get puedeConfirmar(): boolean {
    return !!this.turnoSeleccionado && this.diagnostico.trim().length > 0;
  }
 
  confirmarAtencion(): void {
    if (!this.turnoSeleccionado || !this.medicoActual) return;
 
    this.guardando = true;
    this.error = '';
 
    const atencion = {
      turnoId: this.turnoSeleccionado.id,
      medicoId: this.medicoActual.id,
      diagnostico: this.diagnostico.trim(),
      prescripciones: this.prescripciones.trim() || undefined,
      derivacion: this.derivacion.trim() || undefined,
    };
 
    this.atencionService.crearAtencion(atencion).subscribe({
      next: (resultado) => {
        if (resultado) {
          this.turnosService.marcarComoAtendido(this.turnoSeleccionado!.id).subscribe({
            next: () => {
              this.guardando = false;
              this.confirmado = true;
              this.pacientesEnEspera = this.pacientesEnEspera.filter(
                t => t.id !== this.turnoSeleccionado!.id
              );
            },
            error: () => {
              this.guardando = false;
              this.error = 'Error al actualizar el estado del turno.';
            }
          });
        } else {
          this.guardando = false;
          this.error = 'Error al registrar la atención.';
        }
      },
      error: () => {
        this.guardando = false;
        this.error = 'Error al registrar la atención.';
      }
    });
  }
 
  nuevaAtencion(): void {
    this.turnoSeleccionado = null;
    this.confirmado = false;
    this.diagnostico = '';
    this.prescripciones = '';
    this.derivacion = '';
    this.atencionesPrevias = [];
    this.cargarMedicoYPacientes();
  }
 
  volver(): void {
    this.router.navigate(['/dashboard']);
  }
 
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR');
  }
 
  obtenerNombrePaciente(turno: TurnoConDetalles): string {
    return `${turno.paciente?.apellido}, ${turno.paciente?.nombre}`;
  }
 
  obtenerTipoLabel(tipo: string): string {
    const tipos: Record<string, string> = {
      NORMAL: 'Normal',
      SOBRETURNO: 'Sobreturno',
      SEGUIMIENTO: 'Seguimiento'
    };
    return tipos[tipo] || tipo;
  }
}
 
