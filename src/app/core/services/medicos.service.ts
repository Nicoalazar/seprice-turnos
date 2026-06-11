import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Medico } from '../interfaces/medico.d';

@Injectable({
  providedIn: 'root'
})
export class MedicosService {
  private supabase = inject(SupabaseService).getClient();

  getEspecialidades(): Observable<string[]> {
    return from(
      this.supabase.from('Medico').select('especialidad')
    ).pipe(
      map(({ data }) => [
        ...new Set((data ?? []).map((r: any) => r.especialidad))
      ])
    );
  }

  getMedicosPorEspecialidad(especialidad: string): Observable<Medico[]> {
    return from(
      this.supabase
        .from('Medico')
        .select('*, usuario:Usuario(email, rol)')
        .eq('especialidad', especialidad)
    ).pipe(
      map(({ data }) => (data ?? []) as Medico[])
    );
  }

  getMedicoById(id: string): Observable<Medico | null> {
    return from(
      this.supabase
        .from('Medico')
        .select('*, usuario:Usuario(email, rol)')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => (error || !data) ? null : (data as Medico))
    );
  }

  getTodosMedicos(): Observable<Medico[]> {
    return from(
      this.supabase
        .from('Medico')
        .select('*, usuario:Usuario(email, rol)')
    ).pipe(
      map(({ data }) => (data ?? []) as Medico[])
    );
  }

  getMedicoActual(usuarioId: string): Observable<Medico | null> {
    return from(
      this.supabase
        .from('Medico')
        .select('*')
        .eq('usuarioId', usuarioId)
        .single()
    ).pipe(
      map(({ data, error }) => (error || !data) ? null : (data as Medico))
    );
  }
}
