import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; // HERRAMIENTAS DE FORMULARIOS

@Component({
  selector: 'app-cancelar-turno',
  standalone: true,
  // AGREGO EL REACTIVEFORMSMODULE EN LOS IMPORTS
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './cancelar-turno.component.html',
  styleUrl: './cancelar-turno.component.css'
})
export class CancelarTurnoComponent implements OnInit {
  
  //CONTROL INDEPENDIENTE PARA EL INPUT DE BÚSQUEDA
  buscadorControl = new FormControl('');

  turnoEncontrado: boolean = false; 
  errorTurnoNoEncontrado: boolean = false;

  ngOnInit(): void {
  }

  // MEJORAS FUNCIÓN DE BÚSQUEDA
  simularBuscar() {
    // Obtenemos el valor limpio de lo que escribió el usuario
    const valorBusqueda = this.buscadorControl.value?.trim();

    // Si el usuario no escribió nada, limpiamos la pantalla y salimos
    if (!valorBusqueda) {
      this.turnoEncontrado = false;
      this.errorTurnoNoEncontrado = false;
      return;
    }

    // SIMULACIÓN DEL FLUJO:
    // Si escribe el DNI de Luis ("28456789" o "28.456.789") o su apellido "Garcia", lo encuentra.
    if (valorBusqueda.includes('28') || valorBusqueda.toLowerCase().includes('garcia')) {
      this.turnoEncontrado = true;
      this.errorTurnoNoEncontrado = false;
    } else {
      // FLUJO ALTERNATIVO FA2: Si escribe cualquier otra cosa, da error
      this.turnoEncontrado = false;
      this.errorTurnoNoEncontrado = true;
    }
  }
}