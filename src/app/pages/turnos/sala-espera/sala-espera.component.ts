import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { TurnosService } from '../../../core/services/turnos.service';
import { MedicosService } from '../../../core/services/medicos.service';
import { LoginService } from '../../../auth/login.service';
import { TurnoConDetalles } from '../../../core/interfaces/turno.d';
import { Medico } from '../../../core/interfaces/medico.d';

@Component({
  selector: 'app-sala-espera',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './sala-espera.component.html',
  styleUrls: ['./sala-espera.component.css']
})
export class SalaEsperaComponent implements OnInit {
  pacientesEnEspera: TurnoConDetalles[] = [];
  medicoActual: Medico | null = null;
  cargando = false;
  hoy = new Date().toISOString().split('T')[0];

  constructor(
    private turnosService: TurnosService,
    private medicosService: MedicosService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSalaDeEspera();
    // Recargar cada 30 segundos
    setInterval(() => this.cargarSalaDeEspera(), 30000);
  }

  private cargarSalaDeEspera(): void {
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
            error: () => {
              this.pacientesEnEspera = [];
              this.cargando = false;
            }
          });
        } else {
          this.cargando = false;
        }
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  actualizarAhora(): void {
    this.cargarSalaDeEspera();
  }

  obtenerNombrePaciente(turno: TurnoConDetalles): string {
    return `${turno.paciente?.apellido}, ${turno.paciente?.nombre}`;
  }

  obtenerModalidadPago(turno: TurnoConDetalles): string {
    return turno.modalidadPago === 'PARTICULAR' ? 'Particular' : 'Obra Social';
  }

  obtenerTipoTurno(turno: TurnoConDetalles): string {
    return turno.tipo === 'SOBRETURNO' ? 'Sobreturno' : 'Normal';
  }
}
