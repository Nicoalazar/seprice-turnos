import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Agenda } from '../interfaces/agenda.d';
import { Franja } from '../interfaces/franja.d';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private supabase = inject(SupabaseService).getClient();

  getAgendaPorMedico(medicoId: string): Observable<Agenda[]> {
    return from(
      this.supabase
        .from('Agenda')
        .select('*')
        .eq('medicoId', medicoId)
        .order('diaSemana', { ascending: true })
    ).pipe(
      map(({ data }) => (data ?? []) as Agenda[])
    );
  }

  getFranjasPorMedico(medicoId: string, fecha: string): Observable<Franja[]> {
    // fecha en formato YYYY-MM-DD
    return from(
      this.supabase
        .from('Franja')
        .select('*, agenda:Agenda(medicoId, duracionMin)')
        .eq('agenda.medicoId', medicoId)
        .eq('fecha', fecha)
        .order('hora', { ascending: true })
    ).pipe(
      map(({ data }) => (data ?? []) as Franja[])
    );
  }

  getFranjasDisponibles(medicoId: string, fecha: string): Observable<Franja[]> {
    return from(
      this.supabase
        .from('Franja')
        .select('*, agenda:Agenda(medicoId)')
        .eq('agenda.medicoId', medicoId)
        .eq('fecha', fecha)
        .eq('disponible', true)
        .eq('sobreturno', false)
        .order('hora', { ascending: true })
    ).pipe(
      map(({ data }) => (data ?? []) as Franja[])
    );
  }

  getFranjasParaSobreturno(medicoId: string, fecha: string): Observable<Franja[]> {
    return from(
      this.supabase
        .from('Franja')
        .select('*, agenda:Agenda(medicoId)')
        .eq('agenda.medicoId', medicoId)
        .eq('fecha', fecha)
        .eq('disponible', true)
        .eq('sobreturno', true)
        .order('hora', { ascending: true })
    ).pipe(
      map(({ data }) => (data ?? []) as Franja[])
    );
  }

  crearFranja(franja: Omit<Franja, 'id' | 'creadoEn'>): Observable<Franja | null> {
    return from(
      this.supabase.from('Franja').insert([franja]) as any
    ).pipe(
      map(({ data, error }: any) => (error || !data || !data[0]) ? null : (data[0] as Franja))
    );
  }

  marcarFranjaOcupada(franjaId: string): Observable<{ ok: boolean }> {
    return from(
      this.supabase
        .from('Franja')
        .update({ disponible: false })
        .eq('id', franjaId)
    ).pipe(
      map(({ error }) => ({ ok: !error }))
    );
  }

  marcarFranjaDisponible(franjaId: string): Observable<{ ok: boolean }> {
    return from(
      this.supabase
        .from('Franja')
        .update({ disponible: true })
        .eq('id', franjaId)
    ).pipe(
      map(({ error }) => ({ ok: !error }))
    );
  }

  crearOActualizarAgenda(
    medicoId: string,
    diaSemana: number,
    horaInicio: string,
    horaFin: string,
    duracionMin: number,
    especialidad: string
  ): Observable<{ ok: boolean; error?: string; agendaId?: string }> {
    const duracionesMinimas: { [key: string]: number } = {
      'Clínica Médica': 15,
      'Pediatría': 15,
      'Cardiología': 25,
      'Fisio-kinesiología': 25,
      'Salud Mental': 30,
      'Dermatología': 20
    };

    const duracionMinima = duracionesMinimas[especialidad] || 15;

    if (duracionMin < duracionMinima) {
      return of({ ok: false, error: `Duración mínima para ${especialidad} es ${duracionMinima} minutos` });
    }

    return from(
      this.supabase
        .from('Agenda')
        .upsert(
          {
            medicoId,
            diaSemana,
            horaInicio,
            horaFin,
            duracionMin
          },
          { onConflict: 'medicoId,diaSemana' }
        )
        .select('id')
        .single()
    ).pipe(
      map(({ data, error }: any) => {
        if (error || !data) {
          return { ok: false, error: 'Error al guardar la agenda' };
        }
        return { ok: true, agendaId: data.id };
      })
    );
  }

  generarFranjasParaAgenda(
    agendaId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    duracionMin: number
  ): Observable<{ ok: boolean; error?: string; cantidad?: number }> {
    const franjas = this.generarFranjasHorarias(horaInicio, horaFin, duracionMin);

    const franjaObjects = franjas.map(hora => ({
      agendaId,
      fecha,
      hora,
      disponible: true,
      sobreturno: false
    }));

    return from(
      this.supabase.from('Franja').insert(franjaObjects) as any
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          return { ok: false, error: 'Error al generar franjas' };
        }
        return { ok: true, cantidad: data?.length || 0 };
      })
    );
  }

  private generarFranjasHorarias(horaInicio: string, horaFin: string, duracionMin: number): string[] {
    const franjas: string[] = [];
    const [horaI, minI] = horaInicio.split(':').map(Number);
    const [horaF, minF] = horaFin.split(':').map(Number);

    let actual = horaI * 60 + minI;
    const fin = horaF * 60 + minF;

    while (actual < fin) {
      const h = Math.floor(actual / 60).toString().padStart(2, '0');
      const m = (actual % 60).toString().padStart(2, '0');
      franjas.push(`${h}:${m}`);
      actual += duracionMin;
    }

    return franjas;
  }
}
