import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolUsuario } from '../../core/interfaces/usuario';
import { Router } from '@angular/router';
import { RolService } from '../../core/services/rol.service';
import { TurnosService } from '../../core/services/turnos.service';
import { MedicosService } from '../../core/services/medicos.service';
import { LoginService } from '../../auth/login.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TurnoConDetalles } from '../../core/interfaces/turno.d';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private router = inject(Router);
  private rolService = inject(RolService);
  private turnosService = inject(TurnosService);
  private medicosService = inject(MedicosService);
  private loginService = inject(LoginService);
  private snackBar = inject(MatSnackBar);

  @Input() rolActivo: RolUsuario = 'ADMIN';

  turnosAdmin: any[] = [];
  turnosMedico: any[] = [];
  cargando = false;
  rolRealUsuario: string = 'RECEPCIONISTA';

  // Métricas del día (vista administrativo)
  metricaTurnosHoy = 0;
  metricaPendientesAcreditacion = 0;
  metricaSobreturnos = 0;
  metricaCancelaciones = 0;
  metricaAcreditados = 0;

  // Métricas del día (vista médico)
  metricaAsignados = 0;
  metricaAtendidos = 0;
  metricaEnEspera = 0;

  constructor() {
    this.cargarRolRealUsuario();
    this.rolService.rolActivo$.subscribe(rol => {
      // Solo permitir cambio de rol si es SUPER usuario
      if (this.rolRealUsuario === 'SUPER') {
        this.rolActivo = rol;
      }
    });
  }

  cargarRolRealUsuario(): void {
    const usuarioJson = localStorage.getItem('usuarioLogueado');
    if (usuarioJson) {
      const usuario = JSON.parse(usuarioJson);
      this.rolRealUsuario = usuario.rol || 'RECEPCIONISTA';

      // Establecer el rol inicial basado en el rol real del usuario
      if (this.rolRealUsuario === 'SUPER') {
        this.rolActivo = 'ADMIN'; // SUPER por defecto ve ADMIN
      } else if (this.rolRealUsuario === 'MEDICO') {
        this.rolActivo = 'MEDICO';
      } else {
        this.rolActivo = 'ADMIN'; // RECEPCIONISTA ve ADMIN
      }
    }
  }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  private cargarTurnos(): void {
    this.cargando = true;

    // Para admin: todos los turnos de hoy (incluye cancelados para las métricas)
    this.turnosService.getTurnosDeHoy(true).subscribe({
      next: (turnos) => {
        const activos = turnos.filter(t => t.estado !== 'CANCELADO');

        this.metricaTurnosHoy = activos.length;
        this.metricaPendientesAcreditacion = activos.filter(t => t.estado === 'CONFIRMADO').length;
        this.metricaSobreturnos = activos.filter(t => t.tipo === 'SOBRETURNO').length;
        this.metricaCancelaciones = turnos.filter(t => t.estado === 'CANCELADO').length;
        this.metricaAcreditados = activos.filter(t => t.estado === 'PRESENTE EN SALA' || t.estado === 'ATENDIDO').length;

        this.turnosAdmin = activos.map(t => ({
          hora: t.franja?.hora || '',
          paciente: `${t.paciente?.apellido}, ${t.paciente?.nombre}`,
          medico: `Dr/a. ${t.medico?.apellido}`,
          especialidad: t.medico?.especialidad,
          estado: t.estado,
          tipo: t.tipo,
        }));

        // Para médico: solo turnos del médico actual (solo si el usuario es médico)
        if (this.rolRealUsuario === 'MEDICO') {
          const usuarioActual = this.loginService.getUsuarioActual();
          if (usuarioActual && usuarioActual.id) {
            this.medicosService.getMedicoActual(usuarioActual.id).subscribe({
              next: (medico) => {
                if (medico && medico.id) {
                  const año = new Date().getFullYear();
                  const mes = String(new Date().getMonth() + 1).padStart(2, '0');
                  const día = String(new Date().getDate()).padStart(2, '0');
                  const hoy = `${año}-${mes}-${día}`;
                  this.turnosService.getTurnosDeMedico(medico.id, hoy).subscribe({
                    next: (turnosMedico) => {
                      this.metricaAsignados = turnosMedico.length;
                      this.metricaAtendidos = turnosMedico.filter(t => t.estado === 'ATENDIDO').length;
                      this.metricaEnEspera = turnosMedico.filter(t => t.estado === 'PRESENTE EN SALA').length;

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

  cancelarOModificarTurno() {
    this.router.navigate(['/cancelar-turno']);
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
    this.router.navigate(['/liquidacion']);
  }

  miLiquidacion() {
    this.router.navigate(['/mi-liquidacion']);
  }

  verAgenda() {
    this.router.navigate(['agenda']);
  }

  verSalaEspera() {
    this.router.navigate(['/sala-espera']);
  }

  registrarAtencion() {
    this.router.navigate(['/registrar-atencion']);
  }

  turnoSeguimiento() {
    this.snackBar.open('Funcionalidad en desarrollo: turno de seguimiento', 'Cerrar', { duration: 3000 });
  }
}