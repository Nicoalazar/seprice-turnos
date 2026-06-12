import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RolUsuario } from '../../core/interfaces/usuario';
import { ResultadoVerificacion, PacienteVerificacion } from '../../core/interfaces/verificacion';
import { Paciente } from '../../core/interfaces/paciente';
import { PacientesService } from '../../core/services/pacientes.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-verificar-autorizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './verificar-autorizacion.component.html',
  styleUrls: ['./verificar-autorizacion.component.css']
})
export class VerificarAutorizacionComponent implements OnInit {
  private router = inject(Router);
  private pacientesService = inject(PacientesService);

  rolActivo: RolUsuario = 'ADMIN';

  busqueda = '';
  paciente: PacienteVerificacion | null = null;
  pacienteNoEncontrado = false;

  planSeleccionado    = '';
  tipoPrestacion      = 'Consulta clínica — primer nivel';
  codigoPrestacion    = '';
  fechaAtencion       = '05/05/2026';
  docCredencial       = true;
  docDni              = true;
  docOrden            = false;

  verificacionRealizada = false;
  resultadoRegistrado   = false;

  readonly tiposPrestacion = [
    'Consulta clínica — primer nivel',
    'Consulta especialista',
    'Práctica ambulatoria',
    'Diagnóstico por imágenes',
    'Internación programada',
  ];

  private pacientes: PacienteVerificacion[] = [];

  ngOnInit(): void {
    this.cargarPacientes();
  }

  private async cargarPacientes(): Promise<void> {
    try {
      const pacientesDB = await lastValueFrom(this.pacientesService.getall());
      this.pacientes = pacientesDB.map((p: Paciente) => this.mapearPaciente(p));
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      this.pacientes = [];
    }
  }

  private mapearPaciente(paciente: Paciente): PacienteVerificacion {
    const iniciales = `${paciente.nombre?.charAt(0) || ''}${paciente.apellido?.charAt(0) || ''}`.toUpperCase();
    const colores = [
      'linear-gradient(135deg, var(--color-magenta), var(--color-violeta))',
      'linear-gradient(135deg, var(--color-violeta), var(--color-bg-purple-dark-1))',
      'linear-gradient(135deg, var(--color-naranja), var(--color-status-warning))',
      'linear-gradient(135deg, var(--color-status-info-dark), var(--color-bg-blue-bright))',
    ];
    //const colorIndex = (paciente.id || 0) % colores.length;

    return {
      id: paciente.id,
      iniciales,
      colorAvatar: colores[3], // Usamos un color fijo por ahora
      nombre: paciente.nombre || '',
      apellido: paciente.apellido || '',
      dni: paciente.dni || '',
      dniDisplay: this.formatearDni(paciente.dni || ''),
      obraSocial: 'Swiss Medical',
      planesDisponibles: ['Swiss Medical 210', 'Swiss Medical 310', 'Swiss Medical 410'],
      planPredeterminado: 'Swiss Medical 310',
      nroAfiliado: 'SM-00234-X',
      medico: 'Dr. Méndez',
      prestacionNombre: 'Consulta clínica',
      codigoPrestacionDefault: '03.01.01',
      cobertura: {
        estado: 'autorizado',
        descripcion: 'La prestación está cubierta por Swiss Medical plan 310.',
        codigoAutorizacion: 'SM-2026-00891',
        coberturaPct: '100%',
        copago: '$ 0,00',
        topeAnual: 'Sin tope',
        requiereOrden: 'No',
      }
    };
  }

  private formatearDni(dni: string): string {
    return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }


  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/\p{Mn}/gu, '')
      .toLowerCase()
      .replace(/\./g, '');
  }

  buscarPaciente(): void {
    this.pacienteNoEncontrado = false;
    this.paciente = null;
    this.resetearFormulario();

    const criterio = this.normalizar(this.busqueda.trim());
    if (!criterio) return;

    const encontrado = this.pacientes.find(p =>
      p.dni === criterio ||
      this.normalizar(p.nombre).includes(criterio) ||
      this.normalizar(p.apellido).includes(criterio) ||
      this.normalizar(`${p.apellido} ${p.nombre}`).includes(criterio) ||
      this.normalizar(`${p.nombre} ${p.apellido}`).includes(criterio)
    );

    if (!encontrado) {
      this.pacienteNoEncontrado = true;
    } else {
      this.paciente = encontrado;
      this.planSeleccionado    = encontrado.planPredeterminado;
      this.codigoPrestacion    = encontrado.codigoPrestacionDefault;
      this.tipoPrestacion      = encontrado.prestacionNombre.includes('imagen')
        ? 'Diagnóstico por imágenes'
        : encontrado.prestacionNombre.includes('especialista')
          ? 'Consulta especialista'
          : 'Consulta clínica — primer nivel';
    }
  }

  onEnter(event: Event): void {
    if ((event as KeyboardEvent).key === 'Enter') this.buscarPaciente();
  }

  resetearFormulario(): void {
    this.verificacionRealizada = false;
    this.resultadoRegistrado   = false;
    this.planSeleccionado      = '';
    this.codigoPrestacion      = '';
    this.tipoPrestacion        = 'Consulta clínica — primer nivel';
    this.docCredencial = true;
    this.docDni        = true;
    this.docOrden      = false;
  }

  verificarCobertura(): void {
    if (!this.paciente) return;
    this.verificacionRealizada = true;
  }

  registrarYContinuar(): void {
    if (!this.paciente) return;
    this.resultadoRegistrado = true;
  }

  get resultadoActual(): ResultadoVerificacion | null {
    if (!this.paciente || !this.verificacionRealizada) return null;
    return this.paciente.cobertura.estado;
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  irAcreditacion(): void {
    this.router.navigate(['/acreditacion']);
  }
}
