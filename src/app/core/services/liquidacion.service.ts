import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Liquidacion } from '../interfaces/liquidacion.d';
import { TurnosService } from './turnos.service';
import { MedicosService } from './medicos.service';

@Injectable({
  providedIn: 'root'
})
export class LiquidacionService {
  private supabase = inject(SupabaseService).getClient();
  private turnosService = inject(TurnosService);
  private medicosService = inject(MedicosService);

  getTurnosAtendidos(medicoId: string, desde: string, hasta: string): Observable<any[]> {
    return from(
      this.supabase
        .from('Turno')
        .select('*, franja:Franja(fecha)')
        .eq('medicoId', medicoId)
        .eq('estado', 'ATENDIDO')
        .gte('franja.fecha', desde)
        .lte('franja.fecha', hasta)
    ).pipe(
      map(({ data }) => (data ?? []) as any[])
    );
  }

  getLiquidacionExistente(medicoId: string, periodo: string): Observable<Liquidacion | null> {
    return from(
      this.supabase
        .from('Liquidacion')
        .select('*')
        .eq('medicoId', medicoId)
        .eq('periodo', periodo)
        .single()
    ).pipe(
      map(({ data, error }) => (error || !data) ? null : (data as Liquidacion))
    );
  }

  generarLiquidacion(
    medicoId: string,
    periodo: string,
    prestaciones: number,
    montoTotal: number
  ): Observable<{ ok: boolean; error?: string; liquidacionId?: string }> {
    return from(
      this.supabase
        .from('Liquidacion')
        .insert([
          {
            medicoId,
            periodo,
            prestaciones,
            montoTotal,
            generadaEn: new Date().toISOString()
          }
        ])
        .select('id')
        .single()
    ).pipe(
      map(({ data, error }: any) => {
        if (error || !data) {
          return { ok: false, error: 'Error al generar liquidación' };
        }
        return { ok: true, liquidacionId: data.id };
      })
    );
  }

  getLiquidacionesPorMedico(medicoId: string): Observable<Liquidacion[]> {
    return from(
      this.supabase
        .from('Liquidacion')
        .select('*')
        .eq('medicoId', medicoId)
        .order('periodo', { ascending: false })
    ).pipe(
      map(({ data }) => (data ?? []) as Liquidacion[])
    );
  }

  getLiquidacionById(id: string): Observable<Liquidacion | null> {
    return from(
      this.supabase
        .from('Liquidacion')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => (error || !data) ? null : (data as Liquidacion))
    );
  }
}
