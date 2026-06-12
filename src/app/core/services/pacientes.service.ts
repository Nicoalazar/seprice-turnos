import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Paciente } from '../interfaces/paciente.d';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private supabase = inject(SupabaseService).getClient();

  getall(): Observable<Paciente[]> {
    return from(
      this.supabase.from('Paciente')
        .select('*')
    ).pipe(
      map(({ data }) => (data ?? []) as Paciente[])
    );
  }

  buscarPaciente(query: string): Observable<Paciente[]> {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return of([]);

    return from(
      this.supabase
        .from('Paciente')
        .select('*')
        .or(
          `dni.eq.${q},nombre.ilike.%${q}%,apellido.ilike.%${q}%`
        )
        .limit(10)
    ).pipe(
      map(({ data }) => (data ?? []) as Paciente[])
    );
  }

  getPacienteById(id: string): Observable<Paciente | null> {
    return from(
      this.supabase
        .from('Paciente')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => (error || !data) ? null : (data as Paciente))
    );
  }

  getPacientePorDni(dni: string): Observable<Paciente | null> {
    return from(
      this.supabase
        .from('Paciente')
        .select('*')
        .eq('dni', dni)
        .single()
    ).pipe(
      map(({ data, error }) => (error || !data) ? null : (data as Paciente))
    );
  }

  crearPaciente(paciente: Omit<Paciente, 'id' | 'creadoEn'>): Observable<Paciente | null> {
    const nuevo = {
      id: crypto.randomUUID(),
      ...paciente,
      creadoEn: new Date().toISOString()
    };
    return from(
      this.supabase
        .from('Paciente')
        .insert([nuevo])
        .select() as any
    ).pipe(
      map(({ data, error }: any) => (error || !data || !data[0]) ? null : (data[0] as Paciente))
    );
  }
}
