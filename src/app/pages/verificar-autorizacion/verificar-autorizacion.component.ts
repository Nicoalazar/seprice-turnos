import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RolUsuario } from '../../core/interfaces/usuario';
import { ResultadoVerificacion, PacienteVerificacion } from '../../core/interfaces/verificacion';

@Component({
  selector: 'app-verificar-autorizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './verificar-autorizacion.component.html',
  styleUrls: ['./verificar-autorizacion.component.css']
})
export class VerificarAutorizacionComponent {
  private router = inject(Router);

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

  private readonly pacientes: PacienteVerificacion[] = [
    {
      id: 1,
      iniciales: 'GL',
      colorAvatar: 'linear-gradient(135deg, var(--color-magenta), var(--color-violeta))',
      nombre: 'Luis Alberto',
      apellido: 'García',
      dni: '28456789',
      dniDisplay: '28.456.789',
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
    },
    {
      id: 2,
      iniciales: 'ML',
      colorAvatar: 'linear-gradient(135deg, var(--color-violeta), var(--color-bg-purple-dark-1))',
      nombre: 'Marta',
      apellido: 'López',
      dni: '45678901',
      dniDisplay: '45.678.901',
      obraSocial: 'OSDE',
      planesDisponibles: ['OSDE 210', 'OSDE 310', 'OSDE 410', 'OSDE 510'],
      planPredeterminado: 'OSDE 210',
      nroAfiliado: 'OSD-00112-B',
      medico: 'Dra. Torres',
      prestacionNombre: 'Consulta especialista',
      codigoPrestacionDefault: '03.02.01',
      cobertura: {
        estado: 'no-autorizado',
        descripcion: 'Prestación no cubierta por el plan actual del afiliado.',
        coberturaPct: '0%',
        copago: 'N/A',
        topeAnual: 'N/A',
        requiereOrden: 'Sí',
      }
    },
    {
      id: 3,
      iniciales: 'AR',
      colorAvatar: 'linear-gradient(135deg, var(--color-naranja), var(--color-status-warning))',
      nombre: 'Ana',
      apellido: 'Romero',
      dni: '34567890',
      dniDisplay: '34.567.890',
      obraSocial: 'Galeno',
      planesDisponibles: ['Galeno Básico', 'Galeno Plus', 'Galeno Full'],
      planPredeterminado: 'Galeno Plus',
      nroAfiliado: 'GAL-00789-C',
      medico: 'Dr. Méndez',
      prestacionNombre: 'Diagnóstico por imágenes',
      codigoPrestacionDefault: '05.01.03',
      cobertura: {
        estado: 'pendiente',
        descripcion: 'Verificación en curso con la obra social. Reintentá en unos minutos.',
        coberturaPct: '—',
        copago: '—',
        topeAnual: '—',
        requiereOrden: '—',
      }
    },
    {
      id: 4,
      iniciales: 'SE',
      colorAvatar: 'linear-gradient(135deg, var(--color-status-info-dark), var(--color-bg-blue-bright))',
      nombre: 'Elena',
      apellido: 'Soria',
      dni: '56789012',
      dniDisplay: '56.789.012',
      obraSocial: 'Medifé',
      planesDisponibles: ['Medifé A', 'Medifé B', 'Medifé C'],
      planPredeterminado: 'Medifé B',
      nroAfiliado: 'MDF-00456-A',
      medico: 'Dr. Méndez',
      prestacionNombre: 'Consulta clínica',
      codigoPrestacionDefault: '03.01.01',
      cobertura: {
        estado: 'autorizado',
        descripcion: 'La prestación está cubierta por Medifé plan B.',
        codigoAutorizacion: 'MDF-2026-00334',
        coberturaPct: '80%',
        copago: '$ 1.200,00',
        topeAnual: '12 consultas',
        requiereOrden: 'No',
      }
    },
  ];

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
