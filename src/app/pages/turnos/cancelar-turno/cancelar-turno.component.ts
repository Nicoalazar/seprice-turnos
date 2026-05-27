import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'; // Sumamos FormsModule

@Component({
  selector: 'app-cancelar-turno',
  standalone: true,
  // Agregamos FormsModule en los imports para poder usar [(ngModel)] abajo
  imports: [CommonModule, ReactiveFormsModule, FormsModule], 
  templateUrl: './cancelar-turno.component.html',
  styleUrl: './cancelar-turno.component.css'
})
export class CancelarTurnoComponent implements OnInit {
  
  buscadorControl = new FormControl('');
  turnoEncontrado: boolean = false; 
  errorTurnoNoEncontrado: boolean = false;

  // VARIABLES PARA CAPTURAR LOS DATOS DEL FORMULARIO DE ABAJO
  // Columna Cancelar
  motivoCancelacion: string = '';
  notaCancelacion: string = '';

  // Columna Reasignar
  nuevaFecha: string = '';
  nuevaHora: string = '';
  nuevoMedico: string = 'Dr. Méndez, Carlos'; // Dejamos el que viene por defecto

  ngOnInit(): void {}

  simularBuscar() {
    const valorBusqueda = this.buscadorControl.value?.trim();
    if (!valorBusqueda) {
      this.reseteoCompleto();
      return;
    }

    if (valorBusqueda.includes('28') || valorBusqueda.toLowerCase().includes('garcia')) {
      this.turnoEncontrado = true;
      this.errorTurnoNoEncontrado = false;
    } else {
      this.turnoEncontrado = false;
      this.errorTurnoNoEncontrado = true;
    }
  }

  // FUNCIÓN 1: PROCESAR LA CANCELACIÓN
  ejecutarCancelacion() {
    if (!this.motivoCancelacion) {
      alert('Por favor, seleccioná un motivo de cancelación.');
      return;
    }

    // Simulamos el éxito de la operación
    alert(`¡Turno Cancelado con Éxito!\nMotivo: ${this.motivoCancelacion}\nNota: ${this.notaCancelacion || 'Ninguna'}`);
    
    // Una vez cancelado, limpiamos la pantalla
    this.reseteoCompleto();
  }

  // FUNCIÓN 2: PROCESAR LA REASIGNACIÓN
  ejecutarReasignacion() {
    if (!this.nuevaFecha || !this.nuevaHora) {
      alert('Por favor, completá la nueva fecha y hora para la reasignación.');
      return;
    }

    // Simulamos el éxito de la operación
    alert(`¡Turno Reasignado con Éxito!\nNuevo Médico: ${this.nuevoMedico}\nFecha: ${this.nuevaFecha}\nHora: ${this.nuevaHora}`);
    
    // Una vez reasignado, limpiamos la pantalla
    this.reseteoCompleto();
  }

  // Función auxiliar para limpiar todo y volver al estado inicial
  private reseteoCompleto() {
    this.turnoEncontrado = false;
    this.errorTurnoNoEncontrado = false;
    this.buscadorControl.setValue('');
    this.motivoCancelacion = '';
    this.notaCancelacion = '';
    this.nuevaFecha = '';
    this.nuevaHora = '';
  }
}