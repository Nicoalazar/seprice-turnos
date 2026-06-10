import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AgendaService } from './agenda.service';
import { Turno, TurnoConDetalles, EstadoTurno, TipoTurno, ModalidadPago } from '../interfaces/turno.d';

export interface RespuestaRegistroTurno {
  ok: boolean;
  turno?: Turno;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private supabase = inject(SupabaseService).getClient();
  private agendaService = inject(AgendaService);

  registrarTurno(datos: {
    pacienteId: string;
    medicoId: string;
    franjaId: string;
    tipo: TipoTurno;
    modalidadPago?: ModalidadPago;
  }): Observable<RespuestaRegistroTurno> {
    return from(
      this.supabase.from('Turno').insert({
        pacienteId: datos.pacienteId,
        medicoId: datos.medicoId,
        franjaId: datos.franjaId,
        tipo: datos.tipo,
        modalidadPago: datos.modalidadPago,
        estado: 'CONFIRMADO',
      }) as any
    ).pipe(
      switchMap(({ data, error }: any) => {
        if (error || !data || !data[0]) {
          return of({
            ok: false,
            error: 'Error al registrar el turno.',
          });
        }

        // Marcar franja como ocupada
        return this.agendaService.marcarFranjaOcupada(datos.franjaId).pipe(
          map(() => ({
            ok: true,
            turno: data[0] as Turno,
          }))
        );
      })
    );
  }

  getTurnosDeHoy(): Observable<TurnoConDetalles[]> {
    const hoy = new Date().toISOString().split('T')[0];
    return from(
      this.supabase
        .from('Turno')
        .select(`
          *,
          paciente:Paciente(nombre, apellido, dni, telefono, obraSocial),
          medico:Medico(nombre, apellido, especialidad),
          franja:Franja(fecha, hora)
        `)
        .eq('franja.fecha', hoy)
        .neq('estado', 'CANCELADO')
        .order('franja.hora', { ascending: true })
    ).pipe(
      map(({ data }) => (data ?? []) as TurnoConDetalles[])
    );
  }

  getTurnosDeMedico(medicoId: string, fecha: string): Observable<TurnoConDetalles[]> {
    return from(
      this.supabase
        .from('Turno')
        .select(`
          *,
          paciente:Paciente(nombre, apellido, dni, telefono, obraSocial),
          medico:Medico(nombre, apellido, especialidad),
          franja:Franja(fecha, hora)
        `)
        .eq('medicoId', medicoId)
        .eq('franja.fecha', fecha)
        .neq('estado', 'CANCELADO')
        .order('franja.hora', { ascending: true })
    ).pipe(
      map(({ data }) => (data ?? []) as TurnoConDetalles[])
    );
  }

  buscarTurnoPorPaciente(queryDniONombre: string): Observable<TurnoConDetalles | null> {
    const q = queryDniONombre.trim().toLowerCase();
    if (q.length < 2) return of(null);

    return from(
      this.supabase
        .from('Turno')
        .select(`
          *,
          paciente:Paciente(nombre, apellido, dni, telefono, obraSocial),
          medico:Medico(nombre, apellido, especialidad),
          franja:Franja(fecha, hora)
        `)
        .or(`paciente.dni.eq.${q},paciente.nombre.ilike.%${q}%,paciente.apellido.ilike.%${q}%`)
        .eq('estado', 'CONFIRMADO')
        .limit(1)
    ).pipe(
      map(({ data }) => {
        if (!data || data.length === 0) return null;
        return data[0] as TurnoConDetalles;
      })
    );
  }

  cancelarTurno(turnoId: string): Observable<{ ok: boolean; error?: string }> {
    return from(
      this.supabase
        .from('Turno')
        .select('franjaId')
        .eq('id', turnoId)
        .single()
    ).pipe(
      switchMap(({ data, error }: any) => {
        if (error || !data) {
          return of({ ok: false, error: 'Turno no encontrado' });
        }

        return from(
          this.supabase
            .from('Turno')
            .update({ estado: 'CANCELADO' })
            .eq('id', turnoId)
        ).pipe(
          switchMap(({ error: updateError }) => {
            if (updateError) {
              return of({ ok: false, error: updateError.message });
            }

            // Liberar la franja
            return this.agendaService.marcarFranjaDisponible(data.franjaId).pipe(
              map(() => ({ ok: true }))
            );
          })
        );
      })
    );
  }

  reasignarTurno(
    turnoId: string,
    nuevaFranjaId: string
  ): Observable<{ ok: boolean; error?: string }> {
    return from(
      this.supabase
        .from('Turno')
        .select('franjaId')
        .eq('id', turnoId)
        .single()
    ).pipe(
      switchMap(({ data, error }: any) => {
        if (error || !data) {
          return of({ ok: false, error: 'Turno no encontrado' });
        }

        const franjaAnterior = data.franjaId;

        return from(
          this.supabase
            .from('Turno')
            .update({ franjaId: nuevaFranjaId, estado: 'CONFIRMADO' })
            .eq('id', turnoId)
        ).pipe(
          switchMap(({ error: updateError }) => {
            if (updateError) {
              return of({ ok: false, error: updateError.message });
            }

            // Liberar franja antigua y ocupar nueva
            return this.agendaService.marcarFranjaDisponible(franjaAnterior).pipe(
              switchMap(() => this.agendaService.marcarFranjaOcupada(nuevaFranjaId)),
              map(() => ({ ok: true }))
            );
          })
        );
      })
    );
  }

  cambiarEstadoTurno(turnoId: string, nuevoEstado: EstadoTurno): Observable<{ ok: boolean; error?: string }> {
    return from(
      this.supabase
        .from('Turno')
        .update({ estado: nuevoEstado })
        .eq('id', turnoId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          return { ok: false, error: error.message };
        }
        return { ok: true };
      })
    );
  }

  acreditarTurno(turnoId: string): Observable<{ ok: boolean; error?: string }> {
    return this.cambiarEstadoTurno(turnoId, 'PRESENTE_EN_SALA');
  }

  marcarComoAtendido(turnoId: string): Observable<{ ok: boolean; error?: string }> {
    return this.cambiarEstadoTurno(turnoId, 'ATENDIDO');
  }

  getTurnoById(id: string): Observable<TurnoConDetalles | null> {
    return from(
      this.supabase
        .from('Turno')
        .select(`
          *,
          paciente:Paciente(nombre, apellido, dni, telefono, obraSocial),
          medico:Medico(nombre, apellido, especialidad),
          franja:Franja(fecha, hora)
        `)
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => (error || !data) ? null : (data as TurnoConDetalles))
    );
  }

  contarSobreturnosPorHora(medicoId: string, fecha: string, hora: string): Observable<number> {
    return from(
      this.supabase
        .from('Turno')
        .select('id', { count: 'exact' })
        .eq('medicoId', medicoId)
        .eq('tipo', 'SOBRETURNO')
        .neq('estado', 'CANCELADO')
        .in('estado', ['CONFIRMADO', 'PRESENTE_EN_SALA', 'ATENDIDO', 'AUSENTE'])
    ).pipe(
      switchMap(({ data, error }: any) => {
        if (error || !data) return of(0);

        const turnos = data as any[];
        const conFranja = turnos.filter(t => {
          return t.franja?.fecha === fecha && t.franja?.hora === hora;
        });

        return of(conFranja.length);
      })
    );
  }

  actualizarModalidadPago(turnoId: string, modalidadPago: ModalidadPago): Observable<{ ok: boolean; error?: string }> {
    return from(
      this.supabase
        .from('Turno')
        .update({ modalidadPago })
        .eq('id', turnoId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          return { ok: false, error: error.message };
        }
        return { ok: true };
      })
    );
  }

  getSalaDeEspera(medicoId: string, fecha: string): Observable<TurnoConDetalles[]> {
    return from(
      this.supabase
        .from('Turno')
        .select(`
          *,
          paciente:Paciente(nombre, apellido, dni, telefono, obraSocial),
          medico:Medico(nombre, apellido, especialidad),
          franja:Franja(fecha, hora)
        `)
        .eq('medicoId', medicoId)
        .eq('franja.fecha', fecha)
        .eq('estado', 'PRESENTE_EN_SALA')
        .order('franja(hora)', { ascending: true })
    ).pipe(
      map(({ data }) => (data ?? []) as TurnoConDetalles[])
    );
  }
}
