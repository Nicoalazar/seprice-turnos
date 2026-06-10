import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../../core/services/turnos.service';
import { TurnoConDetalles } from '../../../core/interfaces/turno.d';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnChanges, OnInit {

  @Input() medicoSeleccionado: string = '';
  @Input() fechaSeleccionada: string = '';
  @Output() turnoSeleccionado = new EventEmitter<TurnoConDetalles>();
  @Output() atencionRegistrada = new EventEmitter<TurnoConDetalles>();

  turnosDelDia: TurnoConDetalles[] = [];
  franjasHorarias: any[] = [];
  cargando = false;

  private router = inject(Router);

  constructor(private turnosService: TurnosService) { }

  volverAlDashboard(): void { this.router.navigate(['/dashboard']); }

  ngOnInit(): void {
    this.cargarAgenda();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.medicoSeleccionado && this.fechaSeleccionada) {
      this.cargarAgenda();
    }
  }

  cargarAgenda(): void {
    this.cargando = true;
    this.turnosService.getTurnosDeMedico(this.medicoSeleccionado, this.fechaSeleccionada)
      .subscribe({
        next: (datos) => {
          this.turnosDelDia = datos;
          this.franjasHorarias = datos.map(t => ({
            hora: t.franja?.hora,
            paciente: `${t.paciente?.apellido}, ${t.paciente?.nombre}`,
            motivo: t.tipo,
            estado: t.estado,
            turnoId: t.id,
          }));
          this.cargando = false;
        },
        error: () => {
          this.turnosDelDia = [];
          this.franjasHorarias = [];
          this.cargando = false;
        }
      });
  }

  seleccionarFranja(franja: any): void {
    const turno = this.turnosDelDia.find(t => t.id === franja.turnoId);
    if (turno && turno.estado === 'CONFIRMADO') {
      this.turnoSeleccionado.emit(turno);
    }
  }

  seleccionarTurno(turno: TurnoConDetalles): void {
    if (turno.estado === 'CONFIRMADO') {
      this.turnoSeleccionado.emit(turno);
    }
  }

  registrarAtencion(turno: TurnoConDetalles): void {
    turno.estado = 'ATENDIDO';
    this.atencionRegistrada.emit(turno);
  }

  verDetalle(turno: TurnoConDetalles): void {
    alert(`Detalle de la atención:\nPaciente: ${turno.paciente.apellido}, ${turno.paciente.nombre}\nEstado: ${turno.estado}`);
  }
}
