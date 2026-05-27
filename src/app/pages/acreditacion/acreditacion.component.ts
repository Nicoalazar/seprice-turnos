import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { RolUsuario } from '../../core/interfaces/usuario';

interface TurnoHoy {
  fecha: string;
  hora: string;
  medico: string;
  especialidad: string;
  estado: 'confirmado' | 'presente en sala' | 'atendido' | 'cancelado';
}

interface Cobertura {
  estado: 'autorizado' | 'rechazado' | 'sin-cobertura';
  obraSocial?: string;
  prestacion?: string;
  codigo?: string;
}

interface PacienteAcreditacion {
  id: number;
  iniciales: string;
  colorAvatar: string;
  nombre: string;
  apellido: string;
  dni: string;            // sin puntos → para búsqueda
  dniDisplay: string;     // con puntos → para mostrar
  fechaNacimiento: string;
  telefono: string;
  obraSocial: string | null;
  nroAfiliado: string | null;
  turnoHoy: TurnoHoy | null;
  cobertura: Cobertura;
}

@Component({
  selector: 'app-acreditacion',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './acreditacion.component.html',
  styleUrls: ['./acreditacion.component.css']
})
export class AcreditacionComponent {
  private router = inject(Router);

  rolActivo: RolUsuario = 'RECEPCIONISTA';

  busqueda = '';
  paciente: PacienteAcreditacion | null = null;
  pacienteNoEncontrado = false;

  // Paso 1
  identidadVerificada = false;

  // Paso 2
  modalidadPago: 'obraSocial' | 'particular' = 'obraSocial';

  // Paso 4
  acreditacionConfirmada = false;

  // ── Datos mockeados ──────────────────────────────────────────────────────────
  private pacientes: PacienteAcreditacion[] = [
    {
      id: 1,
      iniciales: 'GL',
      colorAvatar: 'linear-gradient(135deg,#E91E8C,#9B1FE8)',
      nombre: 'Luis Alberto',
      apellido: 'García',
      dni: '28456789',
      dniDisplay: '28.456.789',
      fechaNacimiento: '12/03/1985',
      telefono: '11 4567-8901',
      obraSocial: 'Swiss Medical',
      nroAfiliado: 'SM-00234-X',
      turnoHoy: {
        fecha: '05/05/2026',
        hora: '09:15',
        medico: 'Dr. Méndez',
        especialidad: 'Clínica Médica',
        estado: 'confirmado'
      },
      cobertura: {
        estado: 'autorizado',
        obraSocial: 'Swiss Medical',
        prestacion: 'Prestación cubierta',
        codigo: 'SM-2026-00891'
      }
    },
    {
      id: 2,
      iniciales: 'ML',
      colorAvatar: 'linear-gradient(135deg,#7B2FBE,#4A1580)',
      nombre: 'Marta',
      apellido: 'López',
      dni: '45678901',
      dniDisplay: '45.678.901',
      fechaNacimiento: '22/08/1979',
      telefono: '11 5432-1098',
      obraSocial: 'OSDE',
      nroAfiliado: 'OSD-00112-B',
      turnoHoy: {
        fecha: '05/05/2026',
        hora: '09:30',
        medico: 'Dra. Torres',
        especialidad: 'Cardiología',
        estado: 'confirmado'
      },
      cobertura: {
        estado: 'rechazado',
        obraSocial: 'OSDE',
        prestacion: 'Sin cobertura activa para esta prestación'
      }
    },
    {
      id: 3,
      iniciales: 'AR',
      colorAvatar: 'linear-gradient(135deg,#FF6B35,#F7931E)',
      nombre: 'Ana',
      apellido: 'Romero',
      dni: '34567890',
      dniDisplay: '34.567.890',
      fechaNacimiento: '05/11/1992',
      telefono: '11 9876-5432',
      obraSocial: null,
      nroAfiliado: null,
      turnoHoy: {
        fecha: '05/05/2026',
        hora: '10:00',
        medico: 'Dr. Méndez',
        especialidad: 'Clínica Médica',
        estado: 'confirmado'
      },
      cobertura: { estado: 'sin-cobertura' }
    },
    {
      id: 4,
      iniciales: 'JP',
      colorAvatar: 'linear-gradient(135deg,#1565C0,#1976D2)',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      dniDisplay: '12.345.678',
      fechaNacimiento: '14/06/1988',
      telefono: '11 2345-6789',
      obraSocial: 'Galeno',
      nroAfiliado: 'GAL-00567-C',
      turnoHoy: null,   // FA1 — sin turno hoy
      cobertura: {
        estado: 'autorizado',
        obraSocial: 'Galeno',
        prestacion: 'Prestación cubierta',
        codigo: 'GAL-2026-00234'
      }
    }
  ];

  // ── Búsqueda ──────────────────────────────────────────────────────────────────

  /** Quita tildes y pasa a minúsculas para comparar sin importar acentos */
  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/\p{Mn}/gu, '')   // elimina todos los diacríticos (á→a, é→e, ñ→n…)
      .toLowerCase()
      .replace(/\./g, '');
  }

  buscarPaciente(): void {
    this.pacienteNoEncontrado = false;
    this.paciente = null;
    this.resetearPasos();

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
      this.modalidadPago = encontrado.obraSocial ? 'obraSocial' : 'particular';
    }
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (ke.key === 'Enter') this.buscarPaciente();
  }

  resetearPasos(): void {
    this.identidadVerificada = false;
    this.acreditacionConfirmada = false;
    this.modalidadPago = 'obraSocial';
  }

  // ── Paso 1 ────────────────────────────────────────────────────────────────────
  verificarIdentidad(): void {
    this.identidadVerificada = true;
  }

  // ── Computed ──────────────────────────────────────────────────────────────────
  get tieneTurnoHoy(): boolean {
    return !!this.paciente?.turnoHoy;
  }

  get esSinTurno(): boolean {
    return !!this.paciente && !this.paciente.turnoHoy;
  }

  get mostrarCoberturaOS(): boolean {
    return this.modalidadPago === 'obraSocial' && !!this.paciente?.obraSocial;
  }

  get mostrarAdvertenciaFA3(): boolean {
    return (
      this.modalidadPago === 'obraSocial' &&
      this.paciente?.cobertura.estado === 'rechazado'
    );
  }

  get puedeConfirmar(): boolean {
    return !!this.paciente?.turnoHoy && this.identidadVerificada;
  }

  // ── Paso 4 ────────────────────────────────────────────────────────────────────
  confirmarAcreditacion(): void {
    if (!this.paciente?.turnoHoy) return;
    this.paciente.turnoHoy.estado = 'presente en sala';
    this.acreditacionConfirmada = true;
  }

  registrarComoParticular(): void {
    this.modalidadPago = 'particular';
  }

  // ── Navegación ────────────────────────────────────────────────────────────────
  irASobreturno(): void {
    this.router.navigate(['/atencion/agenda-medico']);
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
