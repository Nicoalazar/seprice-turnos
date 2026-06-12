import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/env';

// Servicio encargado de mantener la conexión a la base de datos Supabase
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Variable privada que guarda la conexión a Supabase
  private supabase: SupabaseClient;

  constructor() {
    // Crear la conexión usando la URL y la clave desde el archivo de configuración.
    // La sesión propia se maneja en LoginService (tabla Usuario), por lo que se
    // desactiva la persistencia de sesión de Supabase Auth (evita errores de LockManager).
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }

  // Método que devuelve la conexión para que otros servicios la usen
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
