// Agregamos 'OnInit' a los imports de Angular
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
  @Output() atencionRegistrada = new EventEmitter<any>(); // <-- Nuevo Output agregado

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

  registrarAtencion(franja: any): void {
    console.log('Iniciando flujo de atención para el paciente:', franja.paciente);
    console.log('Detalles de la franja:', franja);
    
    // Emitimos la franja hacia afuera por si el sistema lo necesita
    this.atencionRegistrada.emit(franja);

    // Alerta simple para probar en el navegador que captura los datos correctos
    alert(`Atendiendo a: ${franja.paciente}\nMotivo: ${franja.motivo}\nTipo: ${franja.tipo}`);
  }

  verDetalle(franja: any): void {
    console.log('Mostrando el detalle del paciente ya atendido:', franja.paciente);
    alert(`Detalle de la atención:\nPaciente: ${franja.paciente}\nEstado: Ya fue Atendido`);
  }
}