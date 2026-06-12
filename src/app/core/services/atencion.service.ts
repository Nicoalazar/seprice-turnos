import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Atencion } from '../interfaces/atencion.d';

@Injectable({
  providedIn: 'root'
})
export class AtencionService {
  private supabase = inject(SupabaseService).getClient();

  crearAtencion(atencion: Omit<Atencion, 'id' | 'registradoEn'>): Observable<Atencion | null> {
    const nueva = {
      id: crypto.randomUUID(),
      ...atencion,
      registradoEn: new Date().toISOString()
    };
    return new Observable(subscriber => {
      this.supabase.from('Atencion').insert([nueva]).select().then(({ data, error }: any) => {
        if (error || !data || !data[0]) {
          subscriber.next(null);
        } else {
          subscriber.next(data[0] as Atencion);
        }
        subscriber.complete();
      });
    });
  }

  getAtencionPorTurno(turnoId: string): Observable<Atencion | null> {
    return from(
      this.supabase
        .from('Atencion')
        .select('*')
        .eq('turnoId', turnoId)
        .single()
    ).pipe(
      map(({ data, error }) => (error || !data) ? null : (data as Atencion))
    );
  }

  getAtencionesPorMedico(medicoId: string, desde: string, hasta: string): Observable<Atencion[]> {
    return from(
      this.supabase
        .from('Atencion')
        .select('*')
        .eq('medicoId', medicoId)
        .gte('registradoEn', desde)
        .lte('registradoEn', hasta)
        .order('registradoEn', { ascending: false })
    ).pipe(
      map(({ data }) => (data ?? []) as Atencion[])
    );
  }

  actualizarAtencion(id: string, atencion: Partial<Omit<Atencion, 'id' | 'turnoId' | 'medicoId' | 'registradoEn'>>): Observable<{ ok: boolean; error?: string }> {
    return from(
      this.supabase
        .from('Atencion')
        .update(atencion)
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) {
          return { ok: false, error: error.message };
        }
        return { ok: true };
      })
    );
  }
}
