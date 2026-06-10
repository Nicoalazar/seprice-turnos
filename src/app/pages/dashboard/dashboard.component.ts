import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolUsuario } from '../../core/interfaces/usuario';
import { Router } from '@angular/router';
import { RolService } from '../../core/services/rol.service';
import { TurnosService } from '../../core/services/turnos.service';
import { MedicosService } from '../../core/services/medicos.service';
import { LoginService } from '../../auth/login.service';
import { MatIconModule } from '@angular/material/icon';
import { TurnoConDetalles } from '../../core/interfaces/turno.d';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private router = inject(Router);
  private rolService = inject(RolService);
  private turnosService = inject(TurnosService);
  private medicosService = inject(MedicosService);
  private loginService = inject(LoginService);

  @Input() rolActivo: RolUsuario = 'ADMIN';

  turnosAdmin: any[] = [];
  turnosMedico: any[] = [];
  cargando = false;

  constructor() {
    this.rolService.rolActivo$.subscribe(rol => {
      this.rolActivo = rol;
    });
  }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  private cargarTurnos(): void {
    this.cargando = true;

    // Para admin: todos los turnos de hoy
    this.turnosService.getTurnosDeHoy().subscribe({
      next: (turnos) => {
        this.turnosAdmin = turnos.map(t => ({
          hora: t.franja?.hora || '',
          paciente: `${t.paciente?.apellido}, ${t.paciente?.nombre}`,
          medico: `Dr/a. ${t.medico?.apellido}`,
          especialidad: t.medico?.especialidad,
          estado: t.estado,
          tipo: t.tipo,
        }));

        // Para médico: solo turnos del médico actual
        const usuarioActual = this.loginService.getUsuarioActual();
        if (usuarioActual) {
          this.medicosService.getMedicoActual(usuarioActual.id).subscribe({
            next: (medico) => {
              if (medico) {
                const hoy = new Date().toISOString().split('T')[0];
                this.turnosService.getTurnosDeMedico(medico.id, hoy).subscribe({
                  next: (turnosMedico) => {
                    this.turnosMedico = turnosMedico.map(t => ({
                      hora: t.franja?.hora || '',
                      paciente: `${t.paciente?.apellido}, ${t.paciente?.nombre}`,
                      motivo: t.tipo,
                      estado: t.estado,
                    }));
                    this.cargando = false;
                  },
                  error: () => {
                    this.turnosMedico = [];
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
        } else {
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar turnos:', err);
        this.turnosAdmin = [];
        this.turnosMedico = [];
        this.cargando = false;
      }
    });
  }

  getClasePill(estado: string): string {
    return 'pill-' + estado.replace(/ /g, '-');
  }

  // Funciones para manejar las acciones rápidas y navegar a las páginas correspondientes
  nuevoTurno() {
    this.router.navigate(['/turnos/registrar']);
  }

  sobreturno() {
    this.router.navigate(['/sobreturnos']);
  }

  acreditarPaciente() {
    this.router.navigate(['/acreditacion']);
  }

  verificarAutorizacion() {
    this.router.navigate(['/verificar-autorizacion']);
  }

  crearUsuario() {
    this.router.navigate(['/crear-usuario']);
  }

  configurarAgenda() {
    this.router.navigate(['/configurar-agenda']);
  }

  liquidarHonorarios() {
    alert('Función para liquidar honorarios');
  }

  verAgenda() {
    this.router.navigate(['agenda']);
  }

  verSalaEspera() {
    this.router.navigate(['/sala-espera']);
  }

  registrarAtencion() {
    alert('Función para registrar atención');
  }

  turnoSeguimiento() {
    alert('Función para recitar turno de seguimiento');
  }
}