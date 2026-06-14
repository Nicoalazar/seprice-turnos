import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RolUsuario } from '../../core/interfaces/usuario';
import { PacientesService } from '../../core/services/pacientes.service';
import { TurnosService } from '../../core/services/turnos.service';
import { FechaService } from '../../core/services/fecha.service';
import { Paciente } from '../../core/interfaces/paciente.d';
import { TurnoConDetalles } from '../../core/interfaces/turno.d';

@Component({
  selector: 'app-acreditacion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './acreditacion.component.html',
  styleUrls: ['./acreditacion.component.css']
})
export class AcreditacionComponent implements OnInit {
  private router = inject(Router);
  private pacientesService = inject(PacientesService);
  private turnosService = inject(TurnosService);
  private fechaService = inject(FechaService);

  rolActivo: RolUsuario = 'ADMIN';

  busqueda = '';
  paciente: any = null;
  turnoHoy: TurnoConDetalles | null = null;
  pacienteNoEncontrado = false;
  cargando = false;

  identidadVerificada = false;
  modalidadPago: 'obraSocial' | 'particular' = 'obraSocial';
  acreditacionConfirmada = false;

  ngOnInit(): void {}

  buscarPaciente(): void {
    this.pacienteNoEncontrado = false;
    this.paciente = null;
    this.turnoHoy = null;
    this.resetearPasos();
    this.cargando = true;

    const criterio = this.busqueda.trim();
    if (!criterio) {
      this.cargando = false;
      return;
    }

    // Buscar paciente primero
    this.pacientesService.buscarPaciente(criterio).subscribe({
      next: (pacientes) => {
        if (!pacientes || pacientes.length === 0) {
          this.cargando = false;
          this.pacienteNoEncontrado = true;
          return;
        }

        const p = pacientes[0];
        const fechaNac = new Date(p.fechaNac).toLocaleDateString('es-AR');
        this.paciente = {
          ...p,
          fechaNacimiento: fechaNac,
          telefono: p.telefono,
          colorAvatar: `linear-gradient(135deg, var(--color-${['magenta', 'violeta', 'naranja'][Math.floor(Math.random() * 3)]}), var(--color-violeta))`,
          iniciales: `${p.nombre.charAt(0)}${p.apellido.charAt(0)}`.toUpperCase(),
          dniDisplay: `${p.dni.slice(0, 2)}.${p.dni.slice(2, 5)}.${p.dni.slice(5)}`,
          cobertura: {
            estado: p.obraSocial ? 'autorizado' : 'sin-cobertura',
            obraSocial: p.obraSocial || undefined,
            prestacion: 'Prestación cubierta',
            codigo: `${p.obraSocial?.toUpperCase()}-2026-00001` || undefined,
          },
        };
        const hoy = this.fechaService.obtenerHoy();

        // Buscar turno de hoy para este paciente
        this.turnosService.getTurnosDeHoy().subscribe({
          next: (turnos) => {
            const turnoDelPaciente = turnos.find(t => t.pacienteId === this.paciente!.id);
            if (turnoDelPaciente) {
              this.turnoHoy = turnoDelPaciente;
              // Mapear TurnoConDetalles a formato esperado por template
              (this.paciente! as any).turnoHoy = {
                id: turnoDelPaciente.id,
                fecha: new Date((turnoDelPaciente.franja?.fecha || '') + 'T00:00:00').toLocaleDateString('es-AR'),
                hora: turnoDelPaciente.franja?.hora || '',
                medico: `Dr/a. ${turnoDelPaciente.medico?.apellido}`,
                especialidad: turnoDelPaciente.medico?.especialidad || '',
                estado: turnoDelPaciente.estado,
              };
              this.modalidadPago = turnoDelPaciente.modalidadPago === 'PARTICULAR' ? 'particular' : 'obraSocial';
            }
            this.cargando = false;
          },
          error: () => {
            this.cargando = false;
            this.pacienteNoEncontrado = true;
          }
        });
      },
      error: () => {
        this.cargando = false;
        this.pacienteNoEncontrado = true;
      }
    });
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (ke.key === 'Enter') this.buscarPaciente();
  }

  resetearPasos(): void {
    this.identidadVerificada = false;
    this.acreditacionConfirmada = false;
    this.modalidadPago = 'obraSocial';
  }

  verificarIdentidad(): void {
    this.identidadVerificada = true;
  }

  get tieneTurnoHoy(): boolean {
    return !!this.turnoHoy;
  }

  get esSinTurno(): boolean {
    return !!this.paciente && !this.turnoHoy;
  }

  get mostrarCoberturaOS(): boolean {
    return this.modalidadPago === 'obraSocial' && !!this.paciente;
  }

  get mostrarAdvertenciaFA3(): boolean {
    return (
      this.modalidadPago === 'obraSocial' &&
      this.paciente?.cobertura?.estado === 'sin-cobertura'
    );
  }

  get puedeConfirmar(): boolean {
    return !!this.turnoHoy && this.identidadVerificada;
  }

  confirmarAcreditacion(): void {
    if (!this.turnoHoy) return;
    this.cargando = true;
    this.turnosService.acreditarTurno(this.turnoHoy.id).subscribe({
      next: (result) => {
        this.cargando = false;
        if (result.ok) {
          this.turnoHoy!.estado = 'PRESENTE EN SALA';
          this.acreditacionConfirmada = true;
        }
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  registrarComoParticular(): void {
    if (!this.turnoHoy) return;

    this.cargando = true;
    this.turnosService.actualizarModalidadPago(this.turnoHoy.id, 'PARTICULAR').subscribe({
      next: (result) => {
        this.cargando = false;
        if (result.ok) {
          this.modalidadPago = 'particular';
          this.turnoHoy!.modalidadPago = 'PARTICULAR';
        }
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  irASobreturno(): void {
    this.router.navigate(['/sobreturnos']);
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
