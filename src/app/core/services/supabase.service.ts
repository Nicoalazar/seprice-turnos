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
    // Crear la conexión usando la URL y la clave desde el archivo de configuración
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Método que devuelve la conexión para que otros servicios la usen
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
