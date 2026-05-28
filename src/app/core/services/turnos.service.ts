import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Turno, EstadoTurno, TipoTurno } from '../interfaces/turno.d';
import { Paciente } from '../interfaces/paciente.d';
import { Medico } from '../interfaces/medico.d';
 
// Consultorio fijo por médico (mock hasta integración con Supabase)
const CONSULTORIOS: Record<string, string> = {
  'm1': 'Consultorio 1',
  'm2': 'Consultorio 2',
  'm3': 'Consultorio 3',
  'm4': 'Consultorio 4',
};
 
export interface FranjaHoraria {
  hora: string;
  disponible: boolean;
  esSobreturno: boolean;
}
 
export interface ItemAgenda {
  hora: string;
  paciente: string;
  motivo: string;
  obraSocial: string;
  tipo: string;
  estado: string;
}
 
export interface RespuestaRegistro {
  ok: boolean;
  turno?: Turno;
  error?: string;
}
 
export interface Sobreturno {
  id: number;
  fecha: string;
  hora: string;
  pacienteId: string;
  medicoId: string;
  consultorio: string;
  estado: string;
  tipo: string;
  motivo: string;
}
 
export interface RespuestaSobreturno {
  success: boolean;
  data: Sobreturno;
}
 
@Injectable({ providedIn: 'root' })
export class TurnosService {
 
  private readonly MEDICOS: Medico[] = [
    { id: 'm1', nombre: 'Carlos',  apellido: 'Méndez',  especialidad: 'Clínica Médica', rol: 'MEDICO' },
    { id: 'm2', nombre: 'Laura',   apellido: 'Torres',  especialidad: 'Pediatría',      rol: 'MEDICO' },
    { id: 'm3', nombre: 'Ricardo', apellido: 'Ramírez', especialidad: 'Cardiología',    rol: 'MEDICO' },
    { id: 'm4', nombre: 'Sofia',   apellido: 'Sánchez', especialidad: 'Dermatología',   rol: 'MEDICO' },
  ];
 
  private readonly PACIENTES: Paciente[] = [
    { id: 'p1', nombre: 'Luis',   apellido: 'García',  dni: '28456789', telefono: '11-2222-3333', obraSocial: 'Swiss Medical' },
    { id: 'p2', nombre: 'Ana',    apellido: 'Romero',  dni: '31111222', telefono: '11-4444-5555', obraSocial: 'OSDE 310'     },
    { id: 'p3', nombre: 'Marta',  apellido: 'López',   dni: '25333444', telefono: '11-6666-7777', obraSocial: 'Medifé'       },
    { id: 'p4', nombre: 'Elena',  apellido: 'Soria',   dni: '35555666', telefono: '11-8888-9999', obraSocial: 'Galeno'       },
    { id: 'p5', nombre: 'Tomás',  apellido: 'Castro',  dni: '29777888', telefono: '11-0000-1111', obraSocial: 'Particular'   },
  ];
 
  private _turnos = signal<Turno[]>([
    this.mock('t1', 'p1', 'm1', '08:15', 'atendido',  'normal'),
    this.mock('t2', 'p2', 'm1', '09:00', 'atendido',  'normal'),
    this.mock('t3', 'p3', 'm1', '09:15', 'confirmado','normal'),
    this.mock('t4', 'p4', 'm1', '09:45', 'confirmado','normal'),
    this.mock('t5', 'p5', 'm1', '10:15', 'confirmado','sobreturno'),
    this.mock('t6', 'p1', 'm1', '11:00', 'confirmado','normal'),
    this.mock('t7', 'p2', 'm1', '11:45', 'confirmado','normal'),
  ]);
 
  private sobreturnosMock: Sobreturno[] = [
    {
      id: 1,
      fecha: '2026-05-05',
      hora: '09:30',
      pacienteId: '42333444',
      medicoId: 'Dr. Méndez, Carlos',
      consultorio: 'Consultorio 1',
      estado: 'pendiente',
      tipo: 'sobreturno',
      motivo: 'Control post-operatorio urgente.'
    }
  ];
 
  readonly turnos = this._turnos.asReadonly();
 
  // ── Métodos para registrar-turno ──────────────────────────────────────────
 
  getEspecialidades(): string[] {
    return [...new Set(this.MEDICOS.map(m => m.especialidad))];
  }
 
  getMedicosPorEspecialidad(especialidad: string): Medico[] {
    return this.MEDICOS.filter(m => m.especialidad === especialidad);
  }
 
  getConsultorio(medicoId: string): string {
    return CONSULTORIOS[medicoId] ?? 'Sin asignar';
  }
 
  buscarPaciente(query: string): Paciente[] {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];
    return this.PACIENTES.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.apellido.toLowerCase().includes(q) ||
      p.dni.includes(q)
    );
  }
 
  getFranjasDisponibles(medicoId: string, fecha: string): FranjaHoraria[] {
    const turnosDelDia = this._turnos().filter(t =>
      t.medicoId === medicoId &&
      new Date(t.fecha).toISOString().split('T')[0] === fecha &&
      t.estado !== 'cancelado'
    );
 
    const franjas: FranjaHoraria[] = [];
    for (let h = 8; h < 18; h++) {
      for (const min of [0, 15, 30, 45]) {
        const hora = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        const turno = turnosDelDia.find(t => t.hora === hora);
        franjas.push({
          hora,
          disponible: !turno,
          esSobreturno: turno !== undefined && turno.tipo === 'sobreturno',
        });
      }
    }
    return franjas;
  }
 
  registrarTurno(datos: {
    pacienteId: string;
    medicoId: string;
    fecha: string;
    hora: string;
    tipo: TipoTurno;
  }): RespuestaRegistro {
    const ocupada = this._turnos().some(t =>
      t.medicoId === datos.medicoId &&
      new Date(t.fecha).toISOString().split('T')[0] === datos.fecha &&
      t.hora === datos.hora &&
      t.estado !== 'cancelado'
    );
    if (ocupada) return { ok: false, error: 'Esa franja ya está ocupada.' };
 
    const nuevo: Turno = {
      id: `t${Date.now()}`,
      pacienteId:  datos.pacienteId,
      medicoId:    datos.medicoId,
      consultorio: this.getConsultorio(datos.medicoId),
      fecha:       new Date(datos.fecha + 'T00:00:00'),
      hora:        datos.hora,
      tipo:        datos.tipo,
      estado:      'confirmado',
    };
    this._turnos.update(ts => [...ts, nuevo]);
    return { ok: true, turno: nuevo };
  }
 
  // ── Métodos para agenda ───────────────────────────────────────────────────
 
  obtenerAgendaDelDia(medicoId: string, fecha: string): Observable<ItemAgenda[]> {
    const agenda: ItemAgenda[] = [
      { hora: '09:00', paciente: 'García, Luis',   motivo: 'Control',     obraSocial: 'OSDE 310',      tipo: 'Normal',     estado: 'Atendido'   },
      { hora: '09:15', paciente: 'Romero, Ana',    motivo: 'Consulta',    obraSocial: 'Swiss Medical', tipo: 'Normal',     estado: 'Atendido'   },
      { hora: '09:30', paciente: 'López, Marta',   motivo: 'Seguimiento', obraSocial: 'Medifé',        tipo: 'Seguimiento',estado: 'En espera'  },
      { hora: '09:45', paciente: 'Soria, Elena',   motivo: 'Primera vez', obraSocial: 'Galeno',        tipo: 'Normal',     estado: 'En espera'  },
      { hora: '10:00', paciente: 'Castro, Tomás',  motivo: 'Control',     obraSocial: 'Particular',    tipo: 'Normal',     estado: 'Acreditado' },
      { hora: '10:15', paciente: 'Flores, Diana',  motivo: 'Derivación',  obraSocial: 'OSDE 410',      tipo: 'Sobreturno', estado: 'Acreditado' },
      { hora: '10:30', paciente: 'Vera, Miguel',   motivo: 'Consulta',    obraSocial: 'Swiss Medical', tipo: 'Normal',     estado: 'Confirmado' },
      { hora: '10:45', paciente: 'Ríos, Patricia', motivo: 'Control',     obraSocial: 'Medifé',        tipo: 'Normal',     estado: 'Confirmado' },
    ];
    return of(agenda);
  }
 
  // ── Métodos para sobreturno ───────────────────────────────────────────────
 
  getSoburnosDelDia(medicoId: string, fecha: string, hora: string): Observable<Sobreturno[]> {
    const filtrados = this.sobreturnosMock.filter(t =>
      t.medicoId === medicoId &&
      t.fecha === fecha &&
      t.hora === hora &&
      t.tipo === 'sobreturno'
    );
    return of(filtrados);
  }
 
  guardarSobreturno(nuevoTurno: Omit<Sobreturno, 'id'>): Observable<RespuestaSobreturno> {
    const turnoConId: Sobreturno = { ...nuevoTurno, id: this.sobreturnosMock.length + 1 };
    this.sobreturnosMock.push(turnoConId);
    return of({ success: true, data: turnoConId });
  }
 
  // ── Privados ──────────────────────────────────────────────────────────────
 
  private mock(
    id: string, pacienteId: string, medicoId: string,
    hora: string, estado: EstadoTurno, tipo: TipoTurno
  ): Turno {
    return {
      id, pacienteId, medicoId,
      consultorio: CONSULTORIOS[medicoId] ?? 'Sin asignar',
      fecha: new Date(), hora, estado, tipo,
    };
  }
}
