import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LiquidacionService } from '../../../core/services/liquidacion.service';
import { Liquidacion } from '../../../core/interfaces/liquidacion.d';

@Component({
  selector: 'app-consultar-liquidacion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './consultar-liquidacion.component.html',
  styleUrls: ['./consultar-liquidacion.component.css']
})
export class ConsultarLiquidacionComponent implements OnInit {
  liquidaciones: Liquidacion[] = [];
  seleccionada: Liquidacion | null = null;
  cargando = false;
  usuarioLogueado: any = null;

  constructor(
    private liquidacionService: LiquidacionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener usuario logueado
    const usuarioJson = localStorage.getItem('usuarioLogueado');
    if (!usuarioJson) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioLogueado = JSON.parse(usuarioJson);
    this.cargarLiquidaciones();
  }

  cargarLiquidaciones(): void {
    if (!this.usuarioLogueado?.medicoId) {
      this.snackBar.open('Error: usuario no es médico', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cargando = true;
    this.liquidacionService.getLiquidacionesPorMedico(this.usuarioLogueado.medicoId).subscribe({
      next: (liquidaciones) => {
        this.liquidaciones = liquidaciones;
        this.cargando = false;

        if (liquidaciones.length === 0) {
          this.snackBar.open('FA1 — Aún no se generó ninguna liquidación', 'Cerrar', { duration: 3000 });
        }
      },
      error: () => {
        this.snackBar.open('Error al cargar liquidaciones', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  verDetalle(liquidacion: Liquidacion): void {
    this.seleccionada = liquidacion;
  }

  cerrarDetalle(): void {
    this.seleccionada = null;
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
