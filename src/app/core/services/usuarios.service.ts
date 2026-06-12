import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Usuario, RolUsuario } from '../interfaces/usuario.d';

interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  tipo: 'MEDICO' | 'ADMINISTRATIVO';
  usuarioId?: string;
  especialidad?: string;
  matricula?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  constructor(private supabaseService: SupabaseService) {}

  async buscarPersonas(criterio: string): Promise<Persona[]> {
    const supabase = this.supabaseService.getClient();
    const searchTerm = `%${criterio.toLowerCase()}%`;
    const personas: Persona[] = [];

    try {
      const { data: medicos } = await supabase
        .from('Medico')
        .select('id, nombre, apellido, especialidad, matricula, usuarioId')
        .or(`nombre.ilike.${searchTerm},apellido.ilike.${searchTerm},matricula.ilike.${searchTerm}`);

      if (medicos) {
        personas.push(
          ...medicos.map(m => ({
            id: m.id,
            nombre: m.nombre,
            apellido: m.apellido,
            tipo: 'MEDICO' as const,
            usuarioId: m.usuarioId,
            especialidad: m.especialidad,
            matricula: m.matricula
          }))
        );
      }

      const { data: admins } = await supabase
        .from('Administrativo')
        .select('id, nombre, apellido, usuarioId')
        .or(`nombre.ilike.${searchTerm},apellido.ilike.${searchTerm}`);

      if (admins) {
        personas.push(
          ...admins.map(a => ({
            id: a.id,
            nombre: a.nombre,
            apellido: a.apellido,
            tipo: 'ADMINISTRATIVO' as const,
            usuarioId: a.usuarioId
          }))
        );
      }

      return personas;
    } catch (error) {
      console.error('Error buscando personas:', error);
      return [];
    }
  }

  async existeCuentaParaPersona(personaId: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    try {
      const { data: medicos } = await supabase
        .from('Medico')
        .select('usuarioId')
        .eq('id', personaId)
        .single();

      if (medicos?.usuarioId) return true;

      const { data: admins } = await supabase
        .from('Administrativo')
        .select('usuarioId')
        .eq('id', personaId)
        .single();

      if (admins?.usuarioId) return true;

      return false;
    } catch (error) {
      return false;
    }
  }

  async crearUsuario(email: string, password: string, rol: RolUsuario, personaId: string, personaTipo: 'MEDICO' | 'ADMINISTRATIVO'): Promise<{ exito: boolean; error?: string; usuarioId?: string }> {
    const supabase = this.supabaseService.getClient();

    try {
      const existe = await this.existeCuentaParaPersona(personaId);
      if (existe) {
        return { exito: false, error: 'Esta persona ya tiene una cuenta' };
      }

      const existeEmail = await this.verificarEmailUnico(email);
      if (!existeEmail) {
        return { exito: false, error: 'El email ya está en uso' };
      }

      const { data, error } = await supabase
        .from('Usuario')
        .insert([
          {
            id: crypto.randomUUID(),
            email,
            password,
            rol,
            activo: true,
            creadoEn: new Date().toISOString()
          }
        ])
        .select('id')
        .single();

      if (error || !data) {
        return { exito: false, error: 'Error al crear el usuario' };
      }

      const usuarioId = data.id;

      const tabla = personaTipo === 'MEDICO' ? 'Medico' : 'Administrativo';
      const { error: updateError } = await supabase
        .from(tabla)
        .update({ usuarioId })
        .eq('id', personaId);

      if (updateError) {
        return { exito: false, error: 'Error al vincular el usuario con la persona' };
      }

      return { exito: true, usuarioId };
    } catch (error: any) {
      return { exito: false, error: error.message || 'Error inesperado' };
    }
  }

  private async verificarEmailUnico(email: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { data } = await supabase
      .from('Usuario')
      .select('id')
      .eq('email', email)
      .single();

    return !data;
  }

  async crearPersonaConUsuario(datos: {
    tipo: 'MEDICO' | 'ADMINISTRATIVO';
    nombre: string;
    apellido: string;
    especialidad?: string;
    matricula?: string;
    tarifa?: number;
    email: string;
    password: string;
    rol: RolUsuario;
  }): Promise<{ exito: boolean; persona?: Persona; error?: string }> {
    const supabase = this.supabaseService.getClient();

    try {
      const personaId = crypto.randomUUID();
      const usuarioId = crypto.randomUUID();

      // Crear Usuario primero
      const { error: usuarioError } = await supabase
        .from('Usuario')
        .insert([
          {
            id: usuarioId,
            email: datos.email,
            password: datos.password,
            rol: datos.rol,
            activo: true,
            creadoEn: new Date().toISOString()
          }
        ]);

      if (usuarioError) {
        return { exito: false, error: 'Error al crear el usuario' };
      }

      // Crear Persona
      const tabla = datos.tipo === 'MEDICO' ? 'Medico' : 'Administrativo';

      if (datos.tipo === 'MEDICO') {
        const { error: personaError } = await supabase
          .from('Medico')
          .insert([
            {
              id: personaId,
              nombre: datos.nombre,
              apellido: datos.apellido,
              especialidad: datos.especialidad || '',
              matricula: datos.matricula || '',
              tarifa: datos.tarifa || 0,
              usuarioId
            }
          ]);

        if (personaError) {
          return { exito: false, error: 'Error al crear el médico' };
        }

        const persona: Persona = {
          id: personaId,
          nombre: datos.nombre,
          apellido: datos.apellido,
          tipo: 'MEDICO',
          usuarioId,
          especialidad: datos.especialidad,
          matricula: datos.matricula
        };

        return { exito: true, persona };
      } else {
        const { error: personaError } = await supabase
          .from('Administrativo')
          .insert([
            {
              id: personaId,
              nombre: datos.nombre,
              apellido: datos.apellido,
              usuarioId
            }
          ]);

        if (personaError) {
          return { exito: false, error: 'Error al crear el administrativo' };
        }

        const persona: Persona = {
          id: personaId,
          nombre: datos.nombre,
          apellido: datos.apellido,
          tipo: 'ADMINISTRATIVO',
          usuarioId
        };

        return { exito: true, persona };
      }
    } catch (error: any) {
      return { exito: false, error: error.message || 'Error inesperado' };
    }
  }

  async crearPersona(datos: {
    tipo: 'MEDICO' | 'ADMINISTRATIVO';
    nombre: string;
    apellido: string;
    especialidad?: string;
    matricula?: string;
    tarifa?: number;
  }): Promise<{ exito: boolean; persona?: Persona; error?: string }> {
    const supabase = this.supabaseService.getClient();

    try {
      const id = crypto.randomUUID();
      const tabla = datos.tipo === 'MEDICO' ? 'Medico' : 'Administrativo';

      if (datos.tipo === 'MEDICO') {
        const { error } = await supabase
          .from('Medico')
          .insert([
            {
              id,
              nombre: datos.nombre,
              apellido: datos.apellido,
              especialidad: datos.especialidad || '',
              matricula: datos.matricula || '',
              tarifa: datos.tarifa || 0
            }
          ]);

        if (error) {
          return { exito: false, error: 'Error al crear el médico' };
        }

        const persona: Persona = {
          id,
          nombre: datos.nombre,
          apellido: datos.apellido,
          tipo: 'MEDICO',
          especialidad: datos.especialidad,
          matricula: datos.matricula
        };

        return { exito: true, persona };
      } else {
        const { error } = await supabase
          .from('Administrativo')
          .insert([
            {
              id,
              nombre: datos.nombre,
              apellido: datos.apellido
            }
          ]);

        if (error) {
          return { exito: false, error: 'Error al crear el administrativo' };
        }

        const persona: Persona = {
          id,
          nombre: datos.nombre,
          apellido: datos.apellido,
          tipo: 'ADMINISTRATIVO'
        };

        return { exito: true, persona };
      }
    } catch (error: any) {
      return { exito: false, error: error.message || 'Error inesperado' };
    }
  }
}
