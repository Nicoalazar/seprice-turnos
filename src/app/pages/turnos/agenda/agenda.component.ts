// 1. Agregamos 'OnInit' a los imports de Angular
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { TurnosService } from '../../../core/services/turnos.service';

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
  @Output() turnoSeleccionado = new EventEmitter<any>();

  franjasHorarias: any[] = [];

  constructor(private turnosService: TurnosService) { }

  // Este método se ejecuta SÍ O SÍ apenas carga la pantalla independiente
  ngOnInit(): void {
    this.cargarAgenda();
  }

  // Este se ejecutará más adelante cuando lo usemos dentro de los flujos reales
  ngOnChanges(changes: SimpleChanges): void {
    if (this.medicoSeleccionado && this.fechaSeleccionada) {
      this.cargarAgenda();
    }
  }

  cargarAgenda(): void {
    this.turnosService.obtenerAgendaDelDia(this.medicoSeleccionado, this.fechaSeleccionada)
      .subscribe((datos: any[]) => {
        this.franjasHorarias = datos;
      });
  }

  seleccionarFranja(franja: any): void {
    if (franja.estado === 'Libre') {
      this.turnoSeleccionado.emit(franja);
      console.log('Turno libre seleccionado:', franja);
    } else {
      console.log('Esta franja no está disponible para selección.');
    }
  }
}