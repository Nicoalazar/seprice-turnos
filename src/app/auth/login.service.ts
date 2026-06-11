import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/services/supabase.service';
import { Usuario } from '../core/interfaces/usuario.d';
import { Router } from '@angular/router';

// Servicio encargado de manejar el login de usuarios
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // Variable que guarda los datos del usuario que está logueado
  private usuarioActual: Usuario | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.cargarUsuarioGuardado();
  }

  // Método para hacer login - recibe email y password
  async login(email: string, password: string): Promise<{ exito: boolean; usuario?: Usuario; error?: string }> {
    try {
      // Obtener la conexión a Supabase
      const supabase = this.supabaseService.getClient();

      // Buscar un usuario con ese email en la tabla 'Usuario'
      const { data, error } = await supabase
        .from('Usuario')
        .select('*')
        .eq('email', email)
        .single();

      // Si hay error o no encuentra el usuario
      if (error || !data) {
        return { exito: false, error: 'Usuario no encontrado' };
      }

      // Castear los datos como un usuario (convertir a tipo Usuario)
      const usuario = data as Usuario;

      // Verificar que la contraseña sea correcta
      if (usuario.password !== password) {
        return { exito: false, error: 'Contraseña incorrecta' };
      }

      // Verificar que el usuario esté activo
      if (!usuario.activo) {
        return { exito: false, error: 'Este usuario está desactivado' };
      }

      // Si todo está bien, guardar el usuario en la sesión
      this.usuarioActual = usuario;
      this.guardarUsuario(usuario);

      return { exito: true, usuario };
    } catch (error: any) {
      // Si hay un error inesperado
      return { exito: false, error: 'Error al conectar con el servidor' };
    }
  }

  // Método para cerrar sesión
  logout(): void {
    this.usuarioActual = null;
    localStorage.removeItem('usuarioLogueado');
    this.router.navigate(['/login']);
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioActual;
  }

  estaLogueado(): boolean {
    return this.usuarioActual !== null;
  }

  private guardarUsuario(usuario: Usuario): void {
    localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
  }

  private cargarUsuarioGuardado(): void {
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');

    if (usuarioGuardado) {
      try {
        this.usuarioActual = JSON.parse(usuarioGuardado) as Usuario;
      } catch {
        localStorage.removeItem('usuarioLogueado');
      }
    }
  }
}
