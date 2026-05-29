// Agregamos 'OnInit' a los imports de Angular
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../../core/services/turnos.service';
import { FranjaAgenda } from '../../../core/interfaces/franja-agenda';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
// Le decimos a la clase que implemente tanto OnChanges como OnInit
export class AgendaComponent implements OnChanges, OnInit {

  @Input() medicoSeleccionado: string = '';
  @Input() fechaSeleccionada: string = '';
  @Output() turnoSeleccionado = new EventEmitter<FranjaAgenda>();
  @Output() atencionRegistrada = new EventEmitter<FranjaAgenda>();

  franjasHorarias: FranjaAgenda[] = [];

  private router = inject(Router);

  constructor(private turnosService: TurnosService) { }

  volverAlDashboard(): void { this.router.navigate(['/dashboard']); }

  // Este método se ejecuta SÍ O SÍ apenas carga la pantalla independiente
  ngOnInit(): void {
    this.cargarAgenda();
  }

  // Este se ejecutará más adelante cuando lo usemos dentro de los flujos reales
  ngOnChanges(_changes: SimpleChanges): void {
    if (this.medicoSeleccionado && this.fechaSeleccionada) {
      this.cargarAgenda();
    }
  }

  cargarAgenda(): void {
    this.turnosService.obtenerAgendaDelDia(this.medicoSeleccionado, this.fechaSeleccionada)
      .subscribe((datos) => {
        this.franjasHorarias = datos;
      });
  }

  seleccionarFranja(franja: FranjaAgenda): void {
    if (franja.estado === 'Libre') {
      this.turnoSeleccionado.emit(franja);
    }
  }

  registrarAtencion(franja: FranjaAgenda): void {
    franja.estado = 'Atendido';
    this.atencionRegistrada.emit(franja);
  }

  verDetalle(franja: FranjaAgenda): void {
    alert(`Detalle de la atención:\nPaciente: ${franja.paciente}\nEstado: Ya fue Atendido`);
  }
}